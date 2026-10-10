import { Router } from "express";
import type {Request, Response} from 'express';
import {pingDatabase} from '../config/pool'

const router = Router();

async function getStatus(_req: Request, res: Response): Promise<void>{
    const databaseAwake = await pingDatabase();

    res.status(databaseAwake ? 200 : 503).json({
        status: databaseAwake ? 'ok' : 'degraded',
        databaseAwake: databaseAwake ? 'Awake' : 'down', 
    });
}

router.get('/getStatus', getStatus);

export default router;