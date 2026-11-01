//#region node_modules/.nitro/vite/services/ssr/assets/promo-a-oE9-Iz.js
var EMPTY_PROMO = {
	intro: "",
	protection: "",
	finePrint: "",
	startsOn: "",
	endsOn: "",
	tiers: []
};
function promoMonths(offer) {
	return [...new Set(offer.tiers.flatMap((tier) => tier.months))].sort((a, b) => a - b);
}
function matchTier(offer, months, amount) {
	if (!Number.isFinite(amount)) return null;
	return offer.tiers.find((tier) => tier.months.includes(months) && amount >= tier.minAmount && (tier.maxAmount == null || amount <= tier.maxAmount)) ?? null;
}
function formatBonus(percent) {
	const digits = Math.round(percent * 1e3) % 10 === 0 ? 2 : 3;
	return `+${percent.toFixed(digits)}%`;
}
function parseApy(value) {
	const number = Number(value.replace(/[^0-9.]/g, ""));
	return Number.isFinite(number) ? number / 100 : 0;
}
function formatOfferDate(iso) {
	const [year, month, day] = iso.slice(0, 10).split("-");
	if (!year || !month || !day) return iso;
	return `${Number(month)}/${Number(day)}/${year}`;
}
function amountRange(tier) {
	const min = tier.minAmount.toLocaleString("en-US");
	if (tier.maxAmount == null) return `$${min}+`;
	return `$${min} – $${tier.maxAmount.toLocaleString("en-US")}`;
}
//#endregion
export { matchTier as a, formatOfferDate as i, amountRange as n, parseApy as o, formatBonus as r, promoMonths as s, EMPTY_PROMO as t };
