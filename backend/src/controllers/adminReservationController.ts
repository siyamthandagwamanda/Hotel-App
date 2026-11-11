import type { Request, Response } from 'express';
import { HttpError } from '../middleware/errorHandler';
import { parseStayDates } from '../services/bookingServices';
import {
  approveReservation, cancelReservation, changeReservationDates, getReservation, listReservations, rejectReservation,
} from '../services/adminReservationService';

const STATUSES = ['held', 'paid_pending_approval', 'confirmed', 'rejected', 'cancelled', 'expired', 'completed'];

function referenceOf(req: Request): string {
  return String(req.params.reference);
}

export async function list(req: Request, res: Response): Promise<void> {
  const status = typeof req.query.status === 'string' ? req.query.status : null;
  if (status !== null && !STATUSES.includes(status)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Unknown status.');
  }
  res.json({ reservations: await listReservations(status) });
}

export async function show(req: Request, res: Response): Promise<void> {
  res.json({ reservation: await getReservation(referenceOf(req)) });
}

export async function approve(req: Request, res: Response): Promise<void> {
  res.json({ reservation: await approveReservation(referenceOf(req)) });
}

export async function reject(req: Request, res: Response): Promise<void> {
  res.json({ reservation: await rejectReservation(referenceOf(req)) });
}

export async function cancel(req: Request, res: Response): Promise<void> {
  res.json({ reservation: await cancelReservation(referenceOf(req)) });
}

export async function changeDates(req: Request, res: Response): Promise<void> {
  const stay = parseStayDates(req.body);
  res.json({ reservation: await changeReservationDates(referenceOf(req), stay.checkIn, stay.checkOut) });
}