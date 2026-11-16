import { parseDollarAmount } from "@/lib/promo";

export const CDARS_TERMS = [1, 3, 6, 12] as const;
export const CDARS_MINIMUM = 500_000;
export const CDARS_MAXIMUM = 50_000_000;

export type CdarsRate = { months: number; apy: string };

export function cdarsAmountError(raw: string) {
  const amount = parseDollarAmount(raw);
  if (amount == null) return "Enter the amount in dollars, such as 500,000. A comma must separate thousands, so 500,00 is not accepted.";
  if (amount < CDARS_MINIMUM) return "A CDARS placement starts at $500,000.";
  if (amount > CDARS_MAXIMUM) return "A CDARS placement cannot exceed $50,000,000.";
  return "";
}

export function normalizeCdarsRates(input: { months: number; apy: string }[] | null | undefined): CdarsRate[] {
  const byMonth = new Map((input || []).map((item) => [Number(item.months), (item.apy || "").trim()]));
  return CDARS_TERMS.map((months) => {
    const raw = (byMonth.get(months) || "").replace(/\s*APY/i, "").trim();
    const apy = raw ? (raw.endsWith("%") ? raw : `${raw}%`) : "";
    return { months, apy };
  });
}

export function cdarsRatesReady(rates: CdarsRate[]) {
  return CDARS_TERMS.every((months) => /^\d+(\.\d{1,3})?%$/.test(rates.find((rate) => rate.months === months)?.apy || ""));
}
