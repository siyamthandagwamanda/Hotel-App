import type { Request, Response, NextFunction } from 'express';
import { HttpError } from './errorHandler';
import { verifyToken } from '../services/authService';
import type { Role } from '../services/authService';

//Add the signed-in user to the request so route handlers can read req.auth
declare module 'express-serve-static-core' {
    interface Request {
        auth?: { userId: number; role: Role};
    }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
    const header = req.headers.authorization;
    if (header === undefined || !header.startsWith('Bearer')){
        next(new HttpError(401, 'UNAUTHORIZED', 'Sign in to continue.'));
        return;
    }

    try {
        req.auth = verifyToken(header.slice('Bearer'.length));
        next();
    }catch(error){
        next (error);
    }
}

//Use after requireAuth: requireRole('admin') blocks guests
export function requireRole(role: Role){
    return function checkRole(req: Request, _res: Response, next: NextFunction): void {
        if (req.auth === undefined || req.auth.role !== role){
            next(new HttpError(403, 'FORBIDDEN', 'You do not have access to this.'))
        }
        next();
    };
}