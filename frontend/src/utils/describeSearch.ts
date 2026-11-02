export function describeSearch(
    city: string,
    checkIn: string | null,
    checkOut: string | null,
    adults: number,

): string {
    const parts: string[] = [];

    //Appends fallback search text if the city parameter is empty
    parts.push(city === '' ? 'Where to?' : city);

    if (checkIn !== null && checkOut !== null){
        parts.push(`${checkIn} to ${checkOut}`);
    }

    parts.push(`${adults} ${adults === 1 ? 'guest' : 'guests'}`);

    return parts.join(' . ');
}