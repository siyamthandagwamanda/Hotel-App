import type { Request, Response, NextFunction } from "express";
import { error } from "node:console";

export class HttpError extends Error{
    constructor(
        public status: number,
        public code: string,
        message: string
    ){
        super(message);
    }
}

export function notFound(_req: Request, res: Response): void{
    res.status(404).json({
        error: {code: 'NOT FOUND', message: 'Route not found'},
    });
}

export function errorHandler(
    err: Error, _req: Request, res: Response, _next: NextFunction
    
): void {
    if (err instanceof HttpError){
        res.status(err.status).json({
            error: {code: err.code, message: err.message},
        });

    }else{
        console.error(err);
        res.status(500).json({
            error: {code: 'SERVER_ERROR', message: err.message},
        });
    }
}