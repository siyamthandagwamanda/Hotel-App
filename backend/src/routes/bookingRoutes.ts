import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { cancel, create, list, loyalty, pay, show, verify } from '../controllers/bookingController';

const router = Router();

// Every booking route needs a signed-in visitor
router.use(requireAuth);

router.post('/', create);
router.get('/', list);
router.get('/loyalty', loyalty);
router.get('/:reference', show);
router.post('/:reference/cancel', cancel);
router.post('/:reference/pay', pay);
router.post('/:reference/verify', verify);

export default router;