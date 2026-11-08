// Plain-words label for each booking status the server can send
export function describeStatus(status: string): string {
  const labels: Record<string, string> = {
    held: 'Waiting for payment',
    paid_pending_approval: 'Paid, waiting for hotel approval',
    confirmed: 'Confirmed',
    rejected: 'Not approved by the hotel',
    cancelled: 'Cancelled',
    expired: 'Hold expired',
    completed: 'Stay completed',
  };
  return labels[status] ?? status;
}

// Whole minutes left before a hold runs out (0 when there is no hold)
export function minutesLeft(holdExpiresAt: string | null): number {
  if (holdExpiresAt === null) return 0;
  const milliseconds = new Date(holdExpiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(milliseconds / 60000));
}