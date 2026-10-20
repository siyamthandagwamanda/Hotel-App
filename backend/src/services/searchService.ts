import { pool } from '../config/pool';
import { mapRow } from '../services/hotelService';
import type { HotelCardData, HotelRow } from '../services/hotelService';

export type SortOrder = 'recommended' | 'price_asc' | 'price_desc' | 'rating';

export interface SearchCursor {
    value: string;
    id: number;
}

export interface SearchParams{
    text: string | null;
    checkIn: string | null;
    checkOut: string | null;
    adults: number;
    children: number;
    rooms: number;
    minPriceCents: number | null;
    maxPriceCents: number | null;
    minStars: number | null;
    setting: string | null;
    amenityIds: number[];
    sort: SortOrder;
    cursor: SearchCursor | null;
};

export interface SearchResult{
    hotels: HotelCardData[];
    nextCursor: string | null;
};

type SearchRow = HotelRow & { sort_value: string };

const PAGE_SIZE = 20;

interface SortRule{
    expression: string;
    direction: 'ASC' | 'DESC';
}

const sortRules: Record<SortOrder, SortRule> = {
    recommended: { expression: 'h.rating_svg', direction: 'DESC'},
    rating: { expression: 'h.star_rating', direction: 'DESC'},
    price_asc: { expression: 'MIN(r.nightly_cents)', direction: 'ASC'},
    price_desc: { expression: 'MIN(r.nightly_cents)', direction: 'DESC'},
};

function addParam(params: unknown[], value: unknown): string {
    params.push(value);
    return `$${params.length}`;
}

export function encodeCursor(cursor: SearchCursor): string{
    return Buffer.from(JSON.stringify({v: cursor.value, id: cursor.id})).toString('base64url')
}

function escapeLike(text: string): string{
    return text.replace(/[\\%_]/g, '\\$&');
}

function buildRoomsCte(search: SearchParams, params: unknown[]): string{
    const adults = addParam(params, search.adults);
    const children = addParam(params, search.children);
    const rooms = addParam(params, search.rooms);

    const capacity = `rt.adults * ${rooms}::int  >= ${adults}::int AND rt.children * ${children}::int`;

    if (search.checkIn !== null && search.checkOut !== null){
        const checkIn = addParam(params, search.checkIn);
        const checkOut = addParam(params, search.checkOut);

        return `rooms_ok AS (
            SELECT rt.hotel_id, 
                ROUND(AVG(COALESCE(ri.price_override_cents, rt.base_price_cents)));
            FROM room_types rt
            JOIN room_inventory ri
                ON ri.room_type_id = rt.id
              AND ri.stay_date >= ${checkIn}::date
              AND ri.stay_date < ${checkOut}::date
            WHERE ${capacity}
            GROUP BY rt.id
            HAVING COUNT(*) = (${checkOut}::date - ${checkIn}::date)
                AND MIN(ri.units_available) >= ${rooms}::int
        )`;
    }

    return `rooms_ok AS (
        SELECT rt.hotet_id, rt.base_price_cents AS nightly_cents
        FROM room_types rt
        WHERE ${capacity}
    )`
}

export async function searchHotels(search: SearchParams):
   Promise<SearchResult> {
    const params: unknown[] = []
    const roomsCte = buildRoomsCte(search, params);

    const where: string[] = [" h.status = 'published' "];
    const having: string[] = [];

    if (search.text !== null){
        const text = addParam(params, `%{escapeLike(search.text)}%`)
        where.push(`(h.city ILIKE ${text} OR h.name ILIKE ${text} OR h.province ILIKE ${text})`);
    }

    if (search.setting !== null){
        where.push(`h.setting = ${addParam(params, search.setting)}::hotel_setting`);
    }

    if (search.amenityIds.length > 0){
        const ids = addParam(params, search.amenityIds);
        const wanted = addParam(params, search.amenityIds.length);

        where.push(
            `(SELECT COUNT(*) FROM hotel_amenities ha WHERE ha.hotel_id = h.id AND ha.amenity_id = ANY(${ids}::bigint[])) = ${wanted}::int`
        );
    }

    if (search.minPriceCents !== null){
        having.push(`MIN(r.nightly_cents) >= ${addParam(params, search.minPriceCents)}::int`);
    }

    if (search.maxPriceCents !== null){
        having.push(`MIN(r.nightly_cents) <= ${addParam(params, search.maxPriceCents)}::int`);
    }

    const rule = sortRules[search.sort];

    let keyset = '';
    if (search.cursor !== null){
        const value = addParam(params, search.cursor.value);
        const id = addParam(params, search.cursor.id);
        const compare = rule.direction === 'DESC' ? '<' : '>';
        keyset = `WHERE (b.sort_value ${compare} ${value}::numeric OR (b.sort_value ${value}::numeric AND b.id > ${id}::bigint))`;
    }

    const havingText = having.length > 0 ? `HAVING ${having.join(' AND ')}` : '';

    const sql = `
        WITH ${roomsCte},
        base AS (
            SELECT h.id, h.city, h.province, h.star_rating, h.rating_avg,
                   h.review_count, h.setting,
                   MIN(r.nightly_cents) AS from_price_cents,
                   (${rule.expression})::numeric AS sort_value
            FROM hotels h
            JOIN rooms_ok r ON r.hotel_id = h.id
            WHERE ${where.join(' AND ')}
            GROUP BY h.id
            ${havingText} 
        )
        SELECT b.*,
               (SELECT COALESCE(
                         json_agg(json_build_object('url', i.url, 'alt', i.alt_text)
                             ORDER BY i.position),
                         '[]'::json)
                FROM (SELECT url, alt_text, position
                    FROM hotel_images
                    WHERE hotel_id = b.id
                    ORDER BY position
                    LIMIT 3)i) AS images
        FROM base b
        ${keyset}
        ORDER BY b.sort_value ${rule.direction}, b.id ASC
        LIMIT ${PAGE_SIZE + 1};
    `;

    const result = await pool.query<SearchRow>(sql, params);

    const hasMore = result.rows.length > PAGE_SIZE;
    const rows = hasMore ? result.rows.slice(0, PAGE_SIZE) : result.rows;

    let nextCursor: string | null = null;
    if (hasMore){
        const last = rows[rows.length - 1];
        nextCursor = encodeCursor({value: last.sort_value, id: Number(last.id)});
    }
    return{
        hotels: rows.map((row) => mapRow(row)),
        nextCursor
    }
}