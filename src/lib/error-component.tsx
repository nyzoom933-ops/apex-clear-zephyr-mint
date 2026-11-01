import { useEffect } from "react";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

const FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return FALLBACK_MESSAGE;
}

function staleModule(error: unknown) {
  const message = errorMessage(error);
  return message.includes("dynamically imported module") || message.includes("Importing a module script failed");
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  useEffect(() => {
    if (!staleModule(error)) return;
    const key = "ah-chunk-reload";
    if (sessionStorage.getItem(key) === "1") return;
    sessionStorage.setItem(key, "1");
    window.location.reload();
  }, [error]);

  return (
    <main
      className={
        "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center " +
        "bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50"
      }
    >
      <span className="text-red-500" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400">
        {staleModule(error) ? "The page was updated. Reload to open the latest version." : errorMessage(error)}
      </p>
      <button type="button" className="mt-2 min-h-11 rounded-md bg-[#006fcf] px-4 py-2 text-sm font-semibold text-white" onClick={() => window.location.reload()}>
        Reload
      </button>
    </main>
  );
}
