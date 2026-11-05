import type { Request, Response, NextFunction } from "express";

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
        return;
    }

    // Express reports a malformed JSON body as an error with status 400
    const status = (err as { status?: number }).status;
    if (status === 400) {
        res.status(400).json({
            error: {code: 'BAD_REQUEST', message: 'The request could not be read.'},
        });
        return;
    }

    // Anything else a bug: log the detail on the server, show the visitor nothing sensitive
    console.log(err);
    res.status(500).json({
        error: {code: 'SERVER_ERROR', message: 'Something went wrong. Please try again.'},
    });
}
