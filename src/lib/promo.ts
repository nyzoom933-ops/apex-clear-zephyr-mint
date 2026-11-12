export type PromoTier = {
  id: string;
  minAmount: number;
  maxAmount: number | null;
  bonusPercent: number;
  months: number[];
};

export type PromoOffer = {
  intro: string;
  protection: string;
  finePrint: string;
  startsOn: string;
  endsOn: string;
  tiers: PromoTier[];
};

export const EMPTY_PROMO: PromoOffer = {
  intro: "",
  protection: "",
  finePrint: "",
  startsOn: "",
  endsOn: "",
  tiers: [],
};

export function promoMonths(offer: PromoOffer) {
  return [...new Set(offer.tiers.flatMap((tier) => tier.months))].sort((a, b) => a - b);
}

export const PROMO_MINIMUM = 100_000;

export function parseDollarAmount(raw: string) {
  const cleaned = raw.trim().replace(/[$\s]/g, "");
  if (!cleaned) return null;
  const grouped = cleaned.includes(",") ? /^\d{1,3}(,\d{3})+(\.\d{1,2})?$/ : /^\d+(\.\d{1,2})?$/;
  if (!grouped.test(cleaned)) return null;
  const value = Number(cleaned.replace(/,/g, ""));
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function dollarInputError(raw: string, promo = false) {
  const amount = parseDollarAmount(raw);
  if (amount == null) return "Enter the amount in dollars, such as 200,000. A comma must separate thousands, so 200,00 is not accepted.";
  if (promo && amount < PROMO_MINIMUM) return "A promotional certificate starts at $100,000.";
  return "";
}

export function matchTier(offer: PromoOffer, months: number, amount: number) {
  if (!Number.isFinite(amount)) return null;
  return offer.tiers.find((tier) => tier.months.includes(months) && amount >= tier.minAmount && (tier.maxAmount == null || amount <= tier.maxAmount)) ?? null;
}

export function formatBonus(percent: number) {
  const digits = Math.round(percent * 1000) % 10 === 0 ? 2 : 3;
  return `+${percent.toFixed(digits)}%`;
}

export function parseApy(value: string) {
  const number = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(number) ? number / 100 : 0;
}

export function formatOfferDate(iso: string) {
  const [year, month, day] = iso.slice(0, 10).split("-");
  if (!year || !month || !day) return iso;
  return `${Number(month)}/${Number(day)}/${year}`;
}

export function amountRange(tier: PromoTier) {
  const min = tier.minAmount.toLocaleString("en-US");
  if (tier.maxAmount == null) return `$${min}+`;
  return `$${min} – $${tier.maxAmount.toLocaleString("en-US")}`;
}
