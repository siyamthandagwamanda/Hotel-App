const monthNames: string[] = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// 145000 cents becomes "R1 450"
export function formatRand(cents: number): string {
  return 'R' + Math.round(cents / 100).toLocaleString('en-ZA');
}

// "2026-11-12" becomes "12 Nov"
export function formatShortDate(dateText: string): string {
  const parts = dateText.split('-');
  return Number(parts[2]) + ' ' + monthNames[Number(parts[1]) - 1];
}