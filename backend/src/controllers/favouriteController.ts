import type { Request, Response } from 'express';
import { HttpError } from '../middleware/errorHandler';
import { addFavourite, listFavouriteIds, listFavourites, removeFavourite } from '../services/favouriteService';

function hotelIdOf(req: Request): number {
  const id = Number(req.params.hotelId);
  if (!Number.isInteger(id) || id < 1) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Hotel id must be a positive whole number');
  }
  return id;
}

export async function list(req: Request, res: Response): Promise<void> {
  res.json({ hotels: await listFavourites(req.auth!.userId) });
}

export async function ids(req: Request, res: Response): Promise<void> {
  res.json({ hotelIds: await listFavouriteIds(req.auth!.userId) });
}

export async function add(req: Request, res: Response): Promise<void> {
  await addFavourite(req.auth!.userId, hotelIdOf(req));
  res.status(204).end();
}

export async function remove(req: Request, res: Response): Promise<void> {
  await removeFavourite(req.auth!.userId, hotelIdOf(req));
  res.status(204).end();
}