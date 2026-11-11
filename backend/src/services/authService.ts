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
};

const BCRYPT_ROUNDS = 12;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A fixed hash compared against when the email is unknown, so a wrong email and a wrong password take the same time.
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

function checkRegisterInput(input: RegisterInput): void {
  if (input.name.length < 1 || input.name.length > 80) {
    throw new HttpError(400, 'INVALID_NAME', 'Enter your name (up to 80 characters).');
  }
  if (!EMAIL_PATTERN.test(input.email) || input.email.length > 254) {
    throw new HttpError(400, 'INVALID_EMAIL', 'Enter a valid email address.');
  }
  if (input.password.length < 8 || input.password.length > 72) {
    throw new HttpError(400, 'INVALID_PASSWORD', 'Use a password of 8 to 72 characters.');
  }
  if (!/[a-zA-Z]/.test(input.password) || !/[0-9]/.test(input.password)) {
    throw new HttpError(400, 'WEAK_PASSWORD', 'Include at least one letter and one number in your password.');
  }
  if (!input.consent) {
    throw new HttpError(400, 'CONSENT_REQUIRED', 'You must accept the privacy terms to create an account.');
  }
  if (input.phone !== null && !/^[0-9+() -]{7,20}$/.test(input.phone)) {
    throw new HttpError(400, 'INVALID_PHONE', 'Enter a valid phone number, or leave it empty.');
  }
}

export async function registerGuest(input: RegisterInput): Promise<AuthResult> {
  checkRegisterInput(input);

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  try {
    const result = await pool.query<UserRow>(
      `INSERT INTO users (email, name, phone, password_hash, role, consent_at)
       VALUES ($1, $2, $3, $4, 'guest', now())
       RETURNING id, email, name, phone, avatar_url, role, password_hash`,
      [input.email, input.name, input.phone, passwordHash],
    );
    const user = toPublicUser(result.rows[0]);
    return { token: signToken(user), user: user };
  } catch (error) {
    // 23505 is Postgres "unique violation": the email is already registered
    if (typeof error === 'object' && error !== null && (error as { code?: string }).code === '23505') {
      throw new HttpError(409, 'EMAIL_TAKEN', 'An account with this email already exists. Try signing in.');
    }
    throw error;
  }
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  const result = await pool.query<UserRow>(
    `SELECT id, email, name, phone, avatar_url, role, password_hash
     FROM users WHERE email = $1`,
    [email],
  );

  const row = result.rows.length === 0 ? null : result.rows[0];
  const hashToCheck = row !== null && row.password_hash !== null ? row.password_hash : DUMMY_HASH;
  const matches = await bcrypt.compare(password, hashToCheck);

  if (row === null || row.password_hash === null || !matches) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
  }

  const user = toPublicUser(row);
  return { token: signToken(user), user: user };
}

export async function getUserById(userId: number): Promise<PublicUser> {
  const result = await pool.query<UserRow>(
    `SELECT id, email, name, phone, avatar_url, role, password_hash
     FROM users WHERE id = $1`,
    [userId],
  );
  if (result.rows.length === 0) {
    throw new HttpError(401, 'UNAUTHORIZED', 'Your session is no longer valid. Please sign in again.');
  }
  return toPublicUser(result.rows[0]);
}

// Lets a signed-in guest change their name and phone number
export async function updateProfile(userId: number, name: string, phone: string | null): Promise<PublicUser> {
  if (name.length < 1 || name.length > 80) {
    throw new HttpError(400, 'INVALID_NAME', 'Enter your name (up to 80 characters).');
  }
  if (phone !== null && !/^[0-9+() -]{7,20}$/.test(phone)) {
    throw new HttpError(400, 'INVALID_PHONE', 'Enter a valid phone number, or leave it empty.');
  }

  await pool.query('UPDATE users SET name = $2, phone = $3 WHERE id = $1', [userId, name, phone]);
  return getUserById(userId);
}

export function verifyToken(token: string): { userId: number; role: Role } {
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    if (typeof payload === 'string' || payload.sub === undefined) {
      throw new Error('Bad token payload');
    }
    const role: Role = payload.role === 'admin' ? 'admin' : 'guest';
    return { userId: Number(payload.sub), role: role };
  } catch {
    throw new HttpError(401, 'UNAUTHORIZED', 'Your session has expired. Please sign in again.');
  }
}