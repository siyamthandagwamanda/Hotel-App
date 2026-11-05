import { Router } from "express";
import type { Request, Response, NextFunction } from 'express';
import { requireAuth } from "../middleware/auth";
import rateLimit from 'express-rate-limit';
import { getUserById, loginUser, normaliseEmail, registerGuest } from "../services/authService";

const router = Router();

//Allow 10 sign-in or sign-up attemps per 15 minutes from one address
const limitAttempts = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: { error: { code: 'TOO_MANY_REQUESTS', message: 'Too many attemps. Please wait a few minutes and try again.'}},
});

function readText(value: unknown, maxLength: number): string {
    return typeof value === 'string' ? value.trim().slice(0, maxLength): '';
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void>{
    try {
        const phone = readText(req.body.phone, 20);
        const result = await registerGuest({
            name: readText(req.body.name, 80),
            email: normaliseEmail(req.body.email),
            password: typeof req.body.password === 'string' ? req.body.password : '',
            phone: phone === '' ? null : phone,
            consent: req.body.consent === true,
        });
        res.status(201).json(result);
    }catch(error){
        next(error);
    }
}

async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const result = await loginUser(normaliseEmail(req.body.email), password);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

 // requireAuth has already set req.auth on this route
export async function currentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
   
    const user = await getUserById(req.auth!.userId);
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

router.post('/register', limitAttempts, register);
router.post('/login', limitAttempts, login)
router.get('/currentUser', requireAuth, currentUser)