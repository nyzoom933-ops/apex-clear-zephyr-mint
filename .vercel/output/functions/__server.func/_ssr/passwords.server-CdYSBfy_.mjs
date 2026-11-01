import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
//#region node_modules/.nitro/vite/services/ssr/assets/passwords.server-CdYSBfy_.js
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
	const salt = randomBytes(16).toString("hex");
	return `scrypt:${salt}:${(await scryptAsync(password, salt, 32)).toString("hex")}`;
}
async function verifyPassword(password, stored) {
	const [scheme, salt, hex] = stored.split(":");
	if (scheme !== "scrypt" || !salt || !hex) return false;
	const hash = await scryptAsync(password, salt, 32);
	const expected = Buffer.from(hex, "hex");
	if (hash.length !== expected.length) return false;
	return timingSafeEqual(hash, expected);
}
//#endregion
export { hashPassword, verifyPassword };
