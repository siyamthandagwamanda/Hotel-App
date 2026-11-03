import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/pool';
import { env } from '../config/env';
import { HttpError } from '../middleware/errorHandler';

export type Role = 'guest' | 'admin';

export interface PublicUser {
    id: number;
    email: string;
    name: string;
    phone: string | null;
    avatar: string | null;
    role: Role;
}

export interface AuthResult {
    token: string;
    user: PublicUser;
}

export interface RegisterInput {
    name: string;
    email: string;
    password: string;
    phone: string | null;
    consent: boolean;
}

type UserRow = {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    avatar_url: string | null;
    role: Role;
    password_hash: string | null;
}

const BCRYPT_ROUNDS = 12;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_ROUNDS);

function toPublicUser(row: UserRow): PublicUser {
    return {
        id: Number(row.id),
        email: row.email,
        name: row.name,
        phone: row.phone,
        avatar: row.avatar_url,
        role: row.role,
    };
}

function signToken(user: PublicUser): string {
  return jwt.sign({ role: user.role }, env.jwtSecret, {
    subject: String(user.id),
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function normaliseEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}