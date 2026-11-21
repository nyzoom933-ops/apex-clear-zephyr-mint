import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { getCallSchedule, submitCallSchedule } from "@/lib/admin.functions";

export const Route = createFileRoute("/call")({
  validateSearch: (search: Record<string, unknown>) => ({ token: typeof search.token === "string" ? search.token.slice(0, 80) : "" }),
  head: () => ({ meta: [{ title: "Request a call" }] }),
  component: CallPage,
});

const controlClass = "w-full rounded-md border border-border bg-surface px-3.5 py-3 text-base text-fg outline-none transition focus:border-primary";

function CallPage() {
  const { token } = Route.useSearch();
  const [ready, setReady] = useState(null);
  const [phone, setPhone] = useState("");
  const [callOn, setCallOn] = useState("");
  const [callTime, setCallTime] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!token) {
      setError("This call link is not valid.");
      return;
    }
    getCallSchedule({ data: { token } })
      .then((result) => {
        setReady(result);
        setPhone(result.phone || "");
        setCallOn(result.callOn || "");
        setCallTime(result.callTime || "");
        const zones = result.zones || [];
        const browser = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setTimeZone(result.timeZone || (zones.some((zone) => zone.id === browser) ? browser : zones[0]?.id || ""));
        setNote(result.note || "");
        if (result.callOn) setDone(true);
      })
      .catch((caught) => setError(caught instanceof Error && caught.message ? caught.message : "This call link is not valid."));
  }, [token]);
  async function submit(event) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const result = await submitCallSchedule({ data: { token, phone, callOn, callTime, timeZone, note } });
      setDone(true);
      if (result.preview) setError("");
    } catch (caught) {
      setError(caught instanceof Error && caught.message ? caught.message : "The request could not be saved.");
    } finally {
      setPending(false);
    }
  }
  const zoneLabel = (ready?.zones || []).find((zone) => zone.id === timeZone)?.label || "";
  const day = callOn ? new Date(`${callOn}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "";
  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteHeader eyebrow="Request a call" />
      <main className="mx-auto max-w-xl px-4 py-10">
        {!ready && !error ? <p>Loading the form…</p> : null}
        {error && !ready ? <p className="text-danger">{error}</p> : null}
        {ready ? (
          <form className="rounded-lg border border-border bg-surface p-5" onSubmit={(event) => void submit(event)}>
            <h1 className="text-2xl font-semibold text-primary">Request an advisor call</h1>
            <p className="mt-2 text-sm text-fg">{ready.preview ? "This is a preview. A request from this page is not saved." : `Choose a day and time${ready.name ? ` for ${ready.name}` : ""}. An advisor will call the number you enter.`}</p>
            {done ? <p className="mt-4 rounded-md border border-border bg-bg px-3 py-3 text-sm text-fg">{ready.preview ? "Preview only. Nothing was sent to the desk." : `We have this request: ${day} at ${callTime}${zoneLabel ? ` ${zoneLabel}` : ""}. You can change it and send it again.`}</p> : null}
            <div className="mt-4 grid gap-3">
              <label className="block text-sm"><span className="mb-1.5 block font-medium">Phone number</span><input className={controlClass} value={phone} inputMode="tel" autoComplete="tel" onChange={(event) => setPhone(event.target.value)} /></label>
              <label className="block text-sm"><span className="mb-1.5 block font-medium">Day</span><input type="date" className={controlClass} value={callOn} onChange={(event) => setCallOn(event.target.value)} /></label>
              <label className="block text-sm"><span className="mb-1.5 block font-medium">Time</span><select className={controlClass} value={callTime} onChange={(event) => setCallTime(event.target.value)}><option value="">Choose a time</option>{(ready.times || []).map((time) => <option key={time} value={time}>{time}</option>)}</select></label>
              <label className="block text-sm"><span className="mb-1.5 block font-medium">Time zone</span><select className={controlClass} value={timeZone} onChange={(event) => setTimeZone(event.target.value)}><option value="">Choose a time zone</option>{(ready.zones || []).map((zone) => <option key={zone.id} value={zone.id}>{zone.label}</option>)}</select></label>
              <label className="block text-sm"><span className="mb-1.5 block font-medium">Note, optional</span><textarea className={`${controlClass} min-h-24`} value={note} onChange={(event) => setNote(event.target.value)} /></label>
            </div>
            {error && ready ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
            <button type="submit" className="mt-4 min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60" disabled={pending}>{pending ? "Sending…" : done && !ready.preview ? "Update request" : "Request the call"}</button>
          </form>
        ) : null}
      </main>
    </div>
  );
}
