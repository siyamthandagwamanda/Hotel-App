import { Router } from 'express';
import { getShelves } from '../services/hotelService.js';

const router = Router();

router.get('/shelves', async (req, res) => {
  try {
    const queryCity = req.query.city;
    
   
    const city = typeof queryCity === 'string' && queryCity.trim() !== '' 
      ? queryCity.trim() 
      : 'Pietermaritzburg';

    console.log(`Fetching shelves for city: "${city}"`);
    const shelves = await getShelves(city);
    
  
    res.json({ shelves });
  } catch (error) {
    console.error("Error fetching hotel shelves:", error);
    res.status(500).json({ error: "Internal Server Error", shelves: [] });
  }
});

export default router;
