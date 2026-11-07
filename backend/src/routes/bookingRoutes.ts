import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { cancelBooking, createBooking, getBooking, listBookings, parseBookingInput } from '../services/bookingServices';
import { startPayment, verifyPayment } from '../services/paymentServices';

const router = Router();


router.use(requireAuth);


function userIdOf(req: Request): number {
  return req.auth!.userId;
}

function referenceOf(req: Request): string {
  return String(req.params.reference);
}

async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = parseBookingInput(req.body);
    res.status(201).json({ booking: await createBooking(userIdOf(req), input) });
  } catch (error) {
    next(error);
  }
}

async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json({ bookings: await listBookings(userIdOf(req)) });
  } catch (error) {
    next(error);
  }
}

async function show(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json({ booking: await getBooking(userIdOf(req), referenceOf(req)) });
  } catch (error) {
    next(error);
  }
}

async function cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json({ booking: await cancelBooking(userIdOf(req), referenceOf(req)) });
  } catch (error) {
    next(error);
  }
}

async function pay(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json({ paymentUrl: await startPayment(userIdOf(req), referenceOf(req)) });
  } catch (error) {
    next(error);
  }
}

async function verify(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json({ booking: await verifyPayment(userIdOf(req), referenceOf(req)) });
  } catch (error) {
    next(error);
  }
}

router.post('/', create);
router.get('/', list);
router.get('/:reference', show);
router.post('/:reference/cancel', cancel);
router.post('/:reference/pay', pay);
router.post('/:reference/verify', verify);

export default router;