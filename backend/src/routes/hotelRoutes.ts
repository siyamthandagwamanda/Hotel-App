import { Router } from 'express';
import { getShelves } from '../services/hotelService.js';

const router = Router();

// Fetches categorized dashboard collections, falling back to 'Pietermaritzburg' if empty
router.get('/shelves', async (req, res) => {
  
  const queryCity = req.query.city;

  const city = typeof queryCity === 'string' && queryCity.trim() !== '' 

    ? queryCity.trim() 
    : 'Pietermaritzburg';

  console.log(`Fetching shelves for city: "${city}"`);
  const shelves = await getShelves(city);
  
  res.json({ shelves });
});

export default router;
