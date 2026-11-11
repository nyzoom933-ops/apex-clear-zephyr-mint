import { createHash, createHmac } from "node:crypto";
import type { Sql } from "@/lib/db";

export type CloudProvider = "r2" | "spaces" | "s3" | "b2" | "wasabi" | "github" | "custom";

export type CloudConfig = {
  enabled: boolean;
  provider: CloudProvider;
  region: string;
  bucket: string;
  accessKey: string;
  secretKey: string;
  endpoint: string;
};

const PROVIDERS = new Set<CloudProvider>(["r2", "spaces", "s3", "b2", "wasabi", "github", "custom"]);

export async function readCloudConfig(sql: Sql): Promise<CloudConfig> {
  const rows = await sql<{ key: string; value: string }>`
    select key, value from site_settings
    where key in ('cloud_backup', 'cloud_provider', 'cloud_region', 'cloud_bucket', 'cloud_access_key', 'cloud_secret_key', 'cloud_endpoint')
  `;
  const value = (key: string) => rows.find((row) => row.key === key)?.value?.trim() || "";
  const provider = value("cloud_provider");
  return {
    enabled: value("cloud_backup") === "1",
    provider: PROVIDERS.has(provider as CloudProvider) ? provider as CloudProvider : "r2",
    region: value("cloud_region"),
    bucket: value("cloud_bucket"),
    accessKey: value("cloud_access_key"),
    secretKey: value("cloud_secret_key"),
    endpoint: value("cloud_endpoint"),
  };
}

export function cloudSetupView(config: CloudConfig) {
  return {
    enabled: config.enabled,
    provider: config.provider,
    region: config.region,
    bucket: config.bucket,
    endpoint: config.endpoint,
    hasAccessKey: Boolean(config.accessKey),
    hasSecretKey: Boolean(config.secretKey),
    accessHint: config.accessKey ? `…${config.accessKey.slice(-4)}` : "",
    secretHint: config.secretKey ? `…${config.secretKey.slice(-4)}` : "",
    ready: cloudReady(config),
  };
}

export function cleanCloudInput(input: { provider?: string; region?: string; bucket?: string; endpoint?: string; accessKey?: string; secretKey?: string }) {
  const provider = PROVIDERS.has(input.provider as CloudProvider) ? input.provider as CloudProvider : "r2";
  const region = (input.region || "").trim().slice(0, 80);
  const bucket = provider === "github" ? (input.bucket || "").trim() : (input.bucket || "").trim().toLowerCase();
  const endpoint = (input.endpoint || "").trim().slice(0, 200);
  const accessKey = (input.accessKey || "").trim().slice(0, 200);
  const secretKey = (input.secretKey || "").trim().slice(0, 255);
  if (provider === "github") {
    if (bucket && !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(bucket)) throw new Error("The repository should look like owner/name.");
    if (region && !/^[A-Za-z0-9._/-]+$/.test(region)) throw new Error("The branch name is not valid.");
  } else if (bucket && !/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket)) throw new Error("The bucket name should be lowercase letters, numbers, and dashes.");
  if (provider === "custom" && endpoint && !/^https:\/\/[^/]+$/i.test(endpoint)) throw new Error("The endpoint should look like https://s3.example.com");
  return { provider, region, bucket, endpoint, accessKey, secretKey };
}

export async function uploadCloudBackup(config: CloudConfig, filename: string, body: Buffer) {
  assertReady(config);
  if (config.provider === "github") {
    await putGithub(config, `backups/${filename}`, body, `Database backup ${filename}`);
    return;
  }
  await putObject(config, `backups/${filename}`, body, "application/zip");
}

export async function testCloudConnection(config: CloudConfig) {
  assertReady(config);
  if (config.provider === "github") {
    await putGithub(config, "backups/connection-test.txt", Buffer.from("ok"), "Backup connection test");
    return { ok: true as const };
  }
  await putObject(config, "backups/connection-test.txt", Buffer.from("ok"), "text/plain");
  return { ok: true as const };
}

function cloudReady(config: CloudConfig) {
  if (config.provider === "github") return /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(config.bucket) && Boolean(config.secretKey);
  if (!config.bucket || !config.accessKey || !config.secretKey) return false;
  if (config.provider === "custom") return /^https:\/\//i.test(config.endpoint);
  if (config.provider === "s3" || config.provider === "wasabi" || config.provider === "spaces") return true;
  return Boolean(config.region);
}

function assertReady(config: CloudConfig) {
  if (!cloudReady(config)) throw new Error(config.provider === "github" ? "Save the private repository and the token before connecting." : "Save the bucket and both keys before connecting.");
}

async function putGithub(config: CloudConfig, key: string, body: Buffer, message: string) {
  if (body.length > 95_000_000) throw new Error("GitHub accepts files up to 100 MB. This backup is larger, so use S3-compatible storage for it.");
  await assertPrivateRepo(config);
  const { owner, repo, branch, token } = githubRepo(config);
  const path = key.split("/").map((part) => encodeURIComponent(part)).join("/");
  const existing = await githubRequest(token, `/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`);
  let sha = "";
  if (existing.ok) {
    const payload = (await existing.json()) as { sha?: string };
    sha = payload.sha || "";
  } else if (existing.status !== 404) {
    throw new Error(await githubError(existing));
  }
  const response = await githubRequest(token, `/repos/${owner}/${repo}/contents/${path}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message, content: body.toString("base64"), branch, ...(sha ? { sha } : {}) }),
  });
  if (!response.ok) throw new Error(await githubError(response));
}

async function assertPrivateRepo(config: CloudConfig) {
  const { owner, repo, token } = githubRepo(config);
  const response = await githubRequest(token, `/repos/${owner}/${repo}`);
  if (!response.ok) throw new Error(await githubError(response));
  const payload = (await response.json()) as { private?: boolean };
  if (!payload.private) throw new Error("That repository is public. Make it private before storing backups there.");
}

function githubRepo(config: CloudConfig) {
  const [owner, repo] = config.bucket.split("/");
  return { owner, repo, branch: config.region || "main", token: config.secretKey };
}

async function githubRequest(token: string, path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("accept", "application/vnd.github+json");
  headers.set("authorization", `Bearer ${token}`);
  headers.set("x-github-api-version", "2022-11-28");
  headers.set("user-agent", "account-holding-backup");
  return fetch(`https://api.github.com${path}`, { ...init, headers, signal: AbortSignal.timeout(30000) });
}

async function githubError(response: Response) {
  const payload = (await response.json().catch(() => ({}))) as { message?: string };
  if (response.status === 401 || response.status === 403) return "GitHub refused the token. Use a fine-grained token with Contents read and write on this private repository.";
  if (response.status === 404) return "GitHub could not find that repository. Check owner/name and that the token can see it.";
  return payload.message || `GitHub rejected the backup (${response.status}).`;
}

function destination(config: CloudConfig) {
  const bucket = config.bucket;
  if (config.provider === "r2") return { host: `${config.region}.r2.cloudflarestorage.com`, region: "auto", bucket, virtual: false };
  if (config.provider === "spaces") {
    const region = config.region || "nyc3";
    return { host: `${region}.digitaloceanspaces.com`, region, bucket, virtual: true };
  }
  if (config.provider === "b2") return { host: `s3.${config.region}.backblazeb2.com`, region: config.region, bucket, virtual: false };
  if (config.provider === "wasabi") {
    const region = config.region || "us-east-1";
    return { host: `s3.${region}.wasabisys.com`, region, bucket, virtual: true };
  }
  if (config.provider === "custom") {
    const url = new URL(config.endpoint);
    return { host: url.host, region: config.region || "us-east-1", bucket, virtual: false };
  }
  const region = config.region || "us-east-1";
  return { host: region === "us-east-1" ? "s3.amazonaws.com" : `s3.${region}.amazonaws.com`, region, bucket, virtual: true };
}

async function putObject(config: CloudConfig, key: string, body: Buffer, contentType: string) {
  const place = destination(config);
  const encoded = key.split("/").map((part) => encodeURIComponent(part)).join("/");
  const host = place.virtual ? `${place.bucket}.${place.host}` : place.host;
  const canonicalUri = place.virtual ? `/${encoded}` : `/${place.bucket}/${encoded}`;
  const url = `https://${host}${canonicalUri}`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const date = amzDate.slice(0, 8);
  const payloadHash = sha256(body);
  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonical = ["PUT", canonicalUri, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const scope = `${date}/${place.region}/s3/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256(canonical)].join("\n");
  const signature = createHmac("sha256", signingKey(config.secretKey, date, place.region)).update(stringToSign).digest("hex");
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "content-type": contentType,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      authorization: `AWS4-HMAC-SHA256 Credential=${config.accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
    body: new Uint8Array(body),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) {
    const detail = (await response.text().catch(() => "")).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
    throw new Error(detail || `Cloud storage rejected the file (${response.status}).`);
  }
}

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function signingKey(secret: string, date: string, region: string) {
  const dateKey = createHmac("sha256", `AWS4${secret}`).update(date).digest();
  const regionKey = createHmac("sha256", dateKey).update(region).digest();
  const serviceKey = createHmac("sha256", regionKey).update("s3").digest();
  return createHmac("sha256", serviceKey).update("aws4_request").digest();
}
