import { Pool } from "pg";
import {env} from './env';

export const pool = new Pool({
    connectionString: env.databaseUrl,
    max: 10,
});

export async function pingDatabase(): Promise<boolean>{
    try{
        await pool.query('SELECT 1')
        return true;

    }catch{
        return false
    }
}
