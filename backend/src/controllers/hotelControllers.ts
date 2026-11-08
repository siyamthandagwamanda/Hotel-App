import type { Request, Response } from 'express';
import { getAmenities, getShelves } from '../services/hotelService';
import { searchHotels } from '../services/searchService';
import { parseSearchQuery } from '../services/searchParams';
import { HttpError } from '../middleware/errorHandler';
import { getHotelReviews, getNextStayRooms, getNextStayDetail } from '../services/nextStayDetailService';

function readHotelId(value: unknown): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Hotel id must be a positive whole number');
  }
  return id;
}

// Filtering and pagination search
export async function search(req: Request, res: Response): Promise<void> {
  const params = parseSearchQuery(req.query);
  res.json(await searchHotels(params));
}

export async function shelves(req: Request, res: Response): Promise<void> {
  const city = typeof req.query.city === 'string' && req.query.city.trim() !== ''
    ? req.query.city.trim()
    : 'Pietermaritzburg';

  res.json({ shelves: await getShelves(city) });
}

export async function amenities(_req: Request, res: Response): Promise<void> {
  res.json({ amenities: await getAmenities() });
}

export async function detail(req: Request, res: Response): Promise<void> {
  res.json(await getNextStayDetail(readHotelId(req.params.id)));
}

export async function rooms(req: Request, res: Response): Promise<void> {
  const hotelId = readHotelId(req.params.id);
  const params = parseSearchQuery(req.query);

  const result = await getNextStayRooms(hotelId, {
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    adults: params.adults,
    children: params.children,
    rooms: params.rooms,
  });
  res.json(result);
}

export async function reviews(req: Request, res: Response): Promise<void> {
  res.json({ reviews: await getHotelReviews(readHotelId(req.params.id)) });
}