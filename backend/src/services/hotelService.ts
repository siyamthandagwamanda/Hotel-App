import { pool } from '../config/pool.js';

export interface HotelCardData {
  id: number;
  name: string;
  city: string;
  province: string;
  starRating: number;
  ratingAvg: number;
  reviewCount: number;
  setting: string;
  fromPriceCents: number;
  images: { url: string; alt: string }[];
}

export interface Shelf {
  id: string;
  title: string;
  hotels: HotelCardData[];
}

interface ShelfDefinition {
  id: string;
  title: string;
  where: string;
  having: string;
  orderBy: string;
  useCity: boolean;
}

const petFriendlyClause = `EXISTS (
  SELECT 1 FROM hotel_amenities ha
  JOIN amenities a ON a.id = ha.amenity_id
  WHERE ha.hotel_id = h.id AND a.name = 'Pet friendly'
)`;

const shelfDefinitions: ShelfDefinition[] = [
  { id: 'near-you', title: 'Near you', where: 'h.province = $1', having: 'TRUE', orderBy: 'h.rating_avg DESC', useCity: true },
  { id: 'top-rated', title: 'Top rated', where: '', having: 'TRUE', orderBy: 'h.rating_avg DESC', useCity: false },
  { id: 'best-value', title: 'Best value', where: '', having: 'TRUE', orderBy: 'from_price_cents ASC', useCity: false },
  { id: 'beach', title: 'Beach escapes', where: "h.setting = 'beach'", having: 'TRUE', orderBy: 'h.rating_avg DESC', useCity: false },
  { id: 'city', title: 'City stays', where: "h.setting = 'city'", having: 'TRUE', orderBy: 'h.rating_avg DESC', useCity: false },
  { id: 'safari', title: 'Safari and nature', where: "h.setting IN ('safari', 'mountain')", having: 'TRUE', orderBy: 'h.rating_avg DESC', useCity: false },
  { id: 'under-1000', title: 'Under R1000', where: '', having: 'MIN(rt.base_price_cents) <= 100000', orderBy: 'from_price_cents ASC', useCity: false },
  { id: 'pet-friendly', title: 'Pet friendly', where: petFriendlyClause, having: 'TRUE', orderBy: 'h.rating_avg DESC', useCity: false },
];

async function findProvince(city: string): Promise<string | null> {
  const escaped = city.replace(/[\\%_]/g, '\\$&');
  const result = await pool.query(
    'SELECT province FROM hotels WHERE city ILIKE $1 OR province ILIKE $1 LIMIT 1',
    [`%${escaped}%`],
  );
  return result.rows[0]?.province ?? null;
}

async function fetchShelfHotels(shelf: ShelfDefinition, city: string): Promise<HotelCardData[]> {
  let whereText = "h.status = 'published'";
  if (shelf.where !== '') {
    whereText = `${whereText} AND ${shelf.where}`;
  }

  const params: string[] = [];
  if (shelf.useCity) {
    const province = await findProvince(city);
    if (!province) return [];
    params.push(province);
  }

  const sql = `
    SELECT h.id, h.name, h.city, h.province, h.star_rating, h.rating_avg,
        h.review_count, h.setting,
        MIN(rt.base_price_cents) AS from_price_cents,
        (SELECT COALESCE(
                    json_agg(json_build_object('url', i.url, 'alt', i.alt_text)
                            ORDER BY i.position),
                    '[]'::json)
            FROM (SELECT url, alt_text, position
                FROM hotel_images
                WHERE hotel_id = h.id
                ORDER BY position
                LIMIT 3) i) AS images
    FROM hotels h
    JOIN room_types rt ON rt.hotel_id = h.id
    WHERE ${whereText}
    GROUP BY h.id
    HAVING ${shelf.having}
    ORDER BY ${shelf.orderBy}
    LIMIT 10`;

  const result = await pool.query(sql, params);

  return result.rows.map((row) => ({
    id: Number(row.id),
    name: row.name,
    city: row.city,
    province: row.province,
    starRating: Number(row.star_rating),
    ratingAvg: Number(row.rating_avg),
    reviewCount: Number(row.review_count),
    setting: row.setting,
    fromPriceCents: Number(row.from_price_cents),
    images: row.images,
  }));
}

export async function getShelves(city: string): Promise<Shelf[]> {
  const results = await Promise.all(
    shelfDefinitions.map(async (definition) => ({
      definition,
      hotels: await fetchShelfHotels(definition, city),
    })),
  );

  const nearYou = results.find((r) => r.definition.id === 'near-you');
  if (nearYou) {
    const isSearched = (h: HotelCardData) =>
      Number(h.city.toLowerCase() === city.toLowerCase());
    nearYou.hotels.sort(
      (a, b) => isSearched(b) - isSearched(a) || b.ratingAvg - a.ratingAvg,
    );
  }

  return results
    .filter((r) => r.hotels.length > 0)
    .map((r) => ({ id: r.definition.id, title: r.definition.title, hotels: r.hotels }));
}