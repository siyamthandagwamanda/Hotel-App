import { pool } from "../config/pool";
import { HttpError } from "../middleware/errorHandler";


export interface NextStayDetail {
  id: number;
  name: string;
  description: string;
  city: string;
  province: string;
  address: string;
  latitude: number;
  longitude: number;
  starRating: number;
  ratingAvg: number;
  reviewCount: number;
  setting: string;
  checkInTime: string;
  checkOutTime: string;
  images: { url: string; alt: string }[];
  amenities: { id: number; name: string }[];
  policies: { type: string; text: string }[];
}

export interface StayRequest {
  checkIn: string | null;
  checkOut: string | null;
  adults: number;
  children: number;
  rooms: number;
}

export interface RoomOption {
  id: number;
  name: string;
  description: string | null;
  adults: number;
  children: number;
  bedType: string | null;
  nightlyCents: number;
  totalCents: number | null;
  unitsLeft: number | null;
  isValid: boolean;
  available: boolean | null;
}

export interface RoomsResult {
  nights: number | null;
  rooms: RoomOption[];
  bestRoomId: number | null;
}

export interface ReviewItem {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  name: string;
}


type HotelDetailRow = {
  id: string;
  name: string;
  description: string;
  city: string;
  province: string;
  address: string;
  latitude: string;
  longitude: string;
  star_rating: string;
  rating_avg: string;
  review_count: number;
  setting: string;
  check_in_time: string;
  check_out_time: string;
};

type RoomRow = {
  id: string;
  name: string;
  description: string | null;
  adults: number;
  children: number;
  bed_type: string | null;
  base_price_cents: number;
  stocked_nights: number;
  min_units: number | null;
  nightly_cents: number | null;
  stay_cents: number | null;
};

type ReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: Date;
  first_name: string;
};

export async function apiTestingNextStayHotels(hotelId: number): Promise<void>{
    const result = await pool.query(
        "SELECT 1 FROM hotels WHERE id = $1 AND status = 'published'",
        [hotelId]
    );
    if (result.rows.length === 0){
        throw new HttpError(404, 'NEXTSTAY_NOT_FOUND', 'Hotel not found');
    }
}

function countNights(checkIn: string, checkOut: string): number {
    const start = Date.parse(checkIn + 'T00:00:00Z');
    const end = Date.parse(checkOut + 'T00:00:00Z');
    return Math.round((end - start) / 86400000);
}

export async function getNextStayDetail(hotelId: number): Promise<NextStayDetail>{
    const hotelResult = await pool.query<HotelDetailRow>(
        `
            SELECT id, name, description, city, province, address, latitude, longitude,
                star_rating, rating_avg, review_count, setting, check_in_time, check_out_time
            FROM hotels
            WHERE id = $1 AND status = 'published'`,
        [hotelId]
    );

    if (hotelResult.rows.length === 0){
        throw new HttpError(404, 'NEXTSTAY_NOT_FOUND', 'Hotel not found');
    }

    const row = hotelResult.rows[0];

    const imageResult = await pool.query<{ url: string; alt_text: string }>(
        'SELECT url, alt_text FROM hotel_images WHERE hotel_id = $1 ORDER BY position',
        [hotelId]
    );

    const amenityResult = await pool.query<{ id: string; name: string }>(
        `
        SELECT a.id, a.name
        FROM hotel_amenities ha
        JOIN amenities a ON a.id = ha.amenity_id
        WHERE ha.hotel_id = $1
        ORDER BY a.name`,
        [hotelId]
    );

    const policyResult = await pool.query<{ type: string; text: string }>(
        'SELECT type, text FROM hotel_policies WHERE hotel_id = $1 ORDER BY id',
        [hotelId]
    );

    return {
        id: Number(row.id),
        name: row.name,
        description: row.description,
        city: row.city,
        province: row.province,
        address: row.address,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        starRating: Number(row.star_rating),
        ratingAvg: Number(row.rating_avg),
        reviewCount: row.review_count,
        setting: row.setting,
        checkInTime: row.check_in_time.slice(0, 5),
        checkOutTime: row.check_out_time.slice(0, 5),
        images: imageResult.rows.map((image) => ({ url: image.url, alt: image.alt_text })),
        amenities: amenityResult.rows.map((amenity) => ({ id: Number(amenity.id), name: amenity.name })),
        policies: policyResult.rows,
    };
}

export async function getNextStayRooms(hotelId: number, stay: StayRequest): Promise<RoomsResult>{
    await apiTestingNextStayHotels(hotelId);

    /**
     * For each room type this calculates:
     * 1. stocked_nights: how many inventory rows exist inside the date range
     * 2. min_units: the lowest stock on any single night (the bottleneck)
     * 3. stay_cents: the summed price across the whole stay
     */
    const result = await pool.query<RoomRow>(
        `SELECT rt.id, rt.name, rt.description, rt.adults, rt.children, rt.bed_type,
                rt.base_price_cents,
                COUNT(ri.stay_date)::int AS stocked_nights,
                MIN(ri.units_available)::int AS min_units,
                ROUND(AVG(COALESCE(ri.price_override_cents, rt.base_price_cents)))::int AS nightly_cents,
                SUM(COALESCE(ri.price_override_cents, rt.base_price_cents))::int AS stay_cents
         FROM room_types rt
         LEFT JOIN rooms_inventory ri
              ON ri.room_type_id = rt.id
             AND ri.stay_date >= $2::date
             AND ri.stay_date < $3::date
         WHERE rt.hotel_id = $1
         GROUP BY rt.id
         ORDER BY rt.base_price_cents, rt.id`,
        [hotelId, stay.checkIn, stay.checkOut]
    );

    let nights: number | null = null;
    if (stay.checkIn !== null && stay.checkOut !== null){
        nights = countNights(stay.checkIn, stay.checkOut);
    }

    const rooms: RoomOption[] = result.rows.map((row) => {
        const isValid = row.adults * stay.rooms >= stay.adults && row.children * stay.rooms >= stay.children;

        let available: boolean | null = null;
        let totalCents: number | null = null;
        let unitsLeft: number | null = null;

        if (nights !== null){
            available = row.stocked_nights === nights && (row.min_units ?? 0) >= stay.rooms;
            unitsLeft = row.min_units;
            if (available && row.stay_cents !== null){
                totalCents = row.stay_cents * stay.rooms;
            }
        }

        return {
            id: Number(row.id),
            name: row.name,
            description: row.description,
            adults: row.adults,
            children: row.children,
            bedType: row.bed_type,
            nightlyCents: row.nightly_cents ?? row.base_price_cents,
            totalCents: totalCents,
            unitsLeft: unitsLeft,
            isValid: isValid,
            available: available,
        };
    });

    const best = rooms.find((room) => room.isValid && room.available !== false);

    return {
        nights: nights,
        rooms: rooms,
        bestRoomId: best === undefined ? null : best.id,
    };
}

export async function getHotelReviews(hotelId: number): Promise<ReviewItem[]>{
    await apiTestingNextStayHotels(hotelId);

    const result = await pool.query<ReviewRow>(
        `SELECT r.id, r.rating, r.comment, r.created_at,
            split_part(u.name, ' ', 1) AS first_name
        FROM reviews r
        JOIN users u ON u.id = r.user_id
        WHERE r.hotel_id = $1
        ORDER BY r.created_at DESC
        LIMIT 10`,
        [hotelId]
    );

    return result.rows.map((row) => ({
        id: Number(row.id),
        rating: row.rating,
        comment: row.comment,
        createdAt: row.created_at.toISOString(),
        name: row.first_name,
    }));
}