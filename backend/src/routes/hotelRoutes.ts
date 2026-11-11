import { Router } from 'express';
<<<<<<< Updated upstream
<<<<<<< HEAD
import { amenities, detail, reviews, rooms, search, shelves } from '../controllers/hotelControllers';
=======
<<<<<<< Updated upstream
import { amenities, detail, reviews, rooms, search, shelves } from '../controllers/hotelController';
=======
import { requireAuth } from '../middleware/auth';
import { amenities, detail, postReview, reviews, reviewStatus, rooms, search, shelves } from '../controllers/hotelControllers';
>>>>>>> Stashed changes
>>>>>>> back/routes
=======
import { requireAuth } from '../middleware/auth';
import { amenities, detail, postReview, reviews, reviewStatus, rooms, search, shelves } from '../controllers/hotelControllers';
>>>>>>> Stashed changes

const router = Router();

router.get('/', search);
router.get('/shelves', shelves);
router.get('/amenities', amenities);
router.get('/:id', detail);
router.get('/:id/rooms', rooms);
router.get('/:id/reviews', reviews);
router.get('/:id/review-status', requireAuth, reviewStatus);
router.post('/:id/reviews', requireAuth, postReview);

export default router;