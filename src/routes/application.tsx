import { createFileRoute } from "@tanstack/react-router";
import { ApplicationForm } from "@/components/application-form";

export const Route = createFileRoute("/application")({
  head: () => ({
    meta: [{ title: "Application · Account Holding" }],
  }),
  component: ApplicationForm,
});
