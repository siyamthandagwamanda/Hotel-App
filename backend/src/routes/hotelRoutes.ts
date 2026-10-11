import { Router } from 'express';
import { getShelves } from '../services/hotelService.js';

const router = Router();

router.get('/shelves', async (req, res) => {
  const queryCity = req.query.city;
  const city = typeof queryCity === 'string' && queryCity.trim() !== '' 
    ? queryCity.trim() 
    : 'Pietermatizburg';

  const shelves = await getShelves(city);
  res.json({ shelves });
});

export default router;
