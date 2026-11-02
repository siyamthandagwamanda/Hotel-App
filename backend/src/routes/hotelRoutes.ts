import { Router } from 'express';
import { getAmenities, getShelves } from '../services/hotelService';
import { searchHotels } from '../services/searchService';
import { parseSearchQuery } from '../services/searchParams';
import { HttpError } from '../middleware/errorHandler';
import { getHotelReviews, getNextStayRooms, getNextStayDetail } from '../services/nextStayDetailService';


const router = Router();

//filtering and pagination search endpoint
router.get('/', async (req , res) => {
  const params = parseSearchQuery(req.query);
  const result = await searchHotels(params);
  res.json(result)
});

router.get('/shelves', async (req , res) => {
  const city = typeof req.query.city === 'string' && req.query.city.trim() !== ''
    ? req.query.city.trim()
    : 'Pietermaritzburg';

  const shelves = await getShelves(city);
  res.json({ shelves })
});

router.get('/amenities', async (req , res) => {
  const amenities = await getAmenities();
  res.json({amenities});
});

function readHotelId(value: unknown): number{
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1){
    throw new HttpError(400, 'VALIDATION_ERROR', 'Hotel id must be a positive whole number');
  }
  return id;
}

router.get('/:id/', async (req, res) => {
  const hotel = await getNextStayDetail(readHotelId(req.params.id));
  res.json(hotel);
});

router.get('/:id/rooms', async (req, res) => {
  const hotelId = readHotelId(req.params.id);
  const search = parseSearchQuery(req.query);
  const result = await getNextStayRooms(hotelId, {
    checkIn: search.checkIn,
    checkOut: search.checkOut,
    adults: search.adults,
    children: search.children,
    rooms: search.rooms,
  });
 res.json(result);
});

router.get('/:id/reviews', async (req, res) => {
  const reviews = await getHotelReviews(readHotelId(req.params.id));
  res.json({ reviews })
})
export default router;
