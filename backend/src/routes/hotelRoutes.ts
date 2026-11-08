import { Router } from 'express';
import { amenities, detail, reviews, rooms, search, shelves } from '../controllers/hotelController';

const router = Router();

router.get('/', search);
router.get('/shelves', shelves);
router.get('/amenities', amenities);
router.get('/:id', detail);
router.get('/:id/rooms', rooms);
router.get('/:id/reviews', reviews);

export default router;