export const NGN = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export const formatNGN = (n: number) => NGN.format(Math.round(n));
export const formatNumber = (n: number, digits = 0) =>
  new Intl.NumberFormat("en-NG", { maximumFractionDigits: digits }).format(n);
