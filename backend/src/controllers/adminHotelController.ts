import type { Request, Response } from 'express';
import { HttpError } from '../middleware/errorHandler';
import {
  createHotel, createRoom, listHotels, listRooms, setAvailability, updateHotel, updateRoom,
} from '../services/adminHotelService';

function idOf(value: unknown): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'The id must be a positive whole number.');
  }
  return id;
}

export async function hotels(_req: Request, res: Response): Promise<void> {
  res.json({ hotels: await listHotels() });
}

export async function addHotel(req: Request, res: Response): Promise<void> {
  res.status(201).json({ hotel: await createHotel(req.body, req.auth!.userId) });
}

export async function editHotel(req: Request, res: Response): Promise<void> {
  res.json({ hotel: await updateHotel(idOf(req.params.hotelId), req.body) });
}

export async function rooms(req: Request, res: Response): Promise<void> {
  res.json({ rooms: await listRooms(idOf(req.params.hotelId)) });
}

export async function addRoom(req: Request, res: Response): Promise<void> {
  res.status(201).json({ room: await createRoom(idOf(req.params.hotelId), req.body) });
}

export async function editRoom(req: Request, res: Response): Promise<void> {
  res.json({ room: await updateRoom(idOf(req.params.roomId), req.body) });
}

export async function availability(req: Request, res: Response): Promise<void> {
  res.json(await setAvailability(idOf(req.params.roomId), req.body));
}