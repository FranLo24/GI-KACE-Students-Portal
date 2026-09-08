const GHS_FORMATTER = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  minimumFractionDigits: 2,
});

export function formatFee(fee) {
  if (fee === null || fee === undefined || fee === '') return '';
  const value = Number(fee);
  if (Number.isNaN(value)) return '';
  return GHS_FORMATTER.format(value);
}
