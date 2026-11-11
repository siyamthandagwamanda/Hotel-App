import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { add, ids, list, remove } from '../controllers/favouriteController';

const router = Router();

// Saved hotels belong to a signed-in guest
router.use(requireAuth);

router.get('/', list);
router.get('/ids', ids);
router.put('/:hotelId', add);
router.delete('/:hotelId', remove);

export default router;