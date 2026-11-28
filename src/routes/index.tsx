import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "\u200b" }] }),
  component: IndexPage,
});

function IndexPage() {
  return <div className="fixed inset-0 z-50 bg-white" />;
}
