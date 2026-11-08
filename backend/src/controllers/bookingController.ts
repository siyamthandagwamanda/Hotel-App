import type { Request, Response } from 'express';
import { cancelBooking, createBooking, getBooking, getLoyalty, listBookings, parseBookingInput} from '../services/bookingServices';
import { startPayment, verifyPayment } from '../services/paymentServices';

// requireAuth has already filled in req.auth by the time these functions run
function userIdOf(req: Request): number {
  return req.auth!.userId;
}

function referenceOf(req: Request): string {
  return String(req.params.reference);
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = parseBookingInput(req.body);
  const booking = await createBooking(userIdOf(req), input);
  res.status(201).json({ booking });
}

export async function list(req: Request, res: Response): Promise<void> {
  res.json({ bookings: await listBookings(userIdOf(req)) });
}

export async function loyalty(req: Request, res: Response): Promise<void> {
  res.json({ loyalty: await getLoyalty(userIdOf(req)) });
}

export async function show(req: Request, res: Response): Promise<void> {
  res.json({ booking: await getBooking(userIdOf(req), referenceOf(req)) });
}

export async function cancel(req: Request, res: Response): Promise<void> {
  res.json({ booking: await cancelBooking(userIdOf(req), referenceOf(req)) });
}

export async function pay(req: Request, res: Response): Promise<void> {
  res.json({ paymentUrl: await startPayment(userIdOf(req), referenceOf(req)) });
}

export async function verify(req: Request, res: Response): Promise<void> {
  res.json({ booking: await verifyPayment(userIdOf(req), referenceOf(req)) });
}