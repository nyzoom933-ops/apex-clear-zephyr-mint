import { createFileRoute } from "@tanstack/react-router";
import { WealthApplication } from "@/components/wealth-application";

export const Route = createFileRoute("/onboarding")({
  validateSearch: (search: Record<string, unknown>) => ({
    invite: typeof search.invite === "string" ? search.invite : "",
    offer: typeof search.offer === "string" ? search.offer : "",
  }),
  head: () => ({
    meta: [{ title: "Client application" }],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const { invite, offer } = Route.useSearch();
  return <WealthApplication invite={invite} offer={offer} />;
}
