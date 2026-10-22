import type { SearchArgs } from "../slices/hotelSlices";

export function buildSearchQuery(args: SearchArgs): string {
    const query = new URLSearchParams();

    if (args.city.trim() !== ''){
        query.set('city', args.city.trim());
    }

    if (args.checkIn !== null && args.checkOut !== null){
        query.set('checkIn', args.checkIn);
        query.set('checkOut', args.checkOut);
    }
    query.set('adults', String(args.adults));
    query.set('children', String(args.children));
    query.set('rooms', String(args.rooms));

    if (args.minPrice !== null) query.set('minPrice', String(args.minPrice));
    if (args.maxPrice !== null) query.set('maxPrice', String(args.maxPrice));
    if (args.stars !== null) query.set('stars', String(args.stars));
    if (args.amenityIds.length > 0) query.set('amenityIds', args.amenityIds.join(','));
    if (args.propertyType !== null) query.set('setting', args.propertyType);
    query.set('sort', args.sort);
    if (args.cursor !== null) query.set('cursor', args.cursor);

    return query.toString();
}