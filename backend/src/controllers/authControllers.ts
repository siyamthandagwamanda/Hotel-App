import type { Request, Response } from 'express';
import { loginUser, normaliseEmail, registerGuest } from '../services/authService';

function readText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function register(req: Request, res: Response): Promise<void> {
  const phone = readText(req.body.phone, 20);

  const result = await registerGuest({
    name: readText(req.body.name, 80),
    email: normaliseEmail(req.body.email),
    password: typeof req.body.password === 'string' ? req.body.password : '',
    phone: phone === '' ? null : phone,
    consent: req.body.consent === true,
  });
  res.status(201).json(result);
}

export async function login(req: Request, res: Response): Promise<void> {
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  const result = await loginUser(normaliseEmail(req.body.email), password);
  res.json(result);
}