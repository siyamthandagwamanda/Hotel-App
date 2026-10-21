import { Router } from 'express';
import { getAmenities, getShelves } from '../services/hotelService';
import { searchHotels } from '../services/searchService';
import { parseSearchQuery } from '../services/searchParams';

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

export default router;
