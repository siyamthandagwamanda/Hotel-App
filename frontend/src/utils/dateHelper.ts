// Formats a native Date object cleanly into a standard YYYY-MM-DD string
function toDateText(date: Date): string{
    return date.toISOString().split('T')[0];
}

export function todayString(): string{
    return toDateText(new Date());
}

export function dayAfter(dateText: string): string{
    const next = new Date(dateText);
    next.setDate(next.getDate() + 1);
    return toDateText(next);
}