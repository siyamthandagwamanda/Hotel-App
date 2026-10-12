import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'; 
import statusRouter from './routes/status.js';
import hotelRouter from './routes/hotelRoutes.js';
import { runMigrations } from './services/tableService.js';
import { seedDatabase } from './services/seedService.js';

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173'
}));

app.use(express.json());

app.use('/api', statusRouter);
app.use('/api/hotels', hotelRouter);

const PORT = process.env.PORT || 4000;

export async function startServer(){
    try{
        console.log('🔄 Setting up database tables...');
        await runMigrations();

        console.log('🏨 Seeding hotel mock data...');
        await seedDatabase(); 

        app.listen(PORT, () => {
          console.log(`Server is running on http://localhost:${PORT}`);
        });
    }catch (error) {
        console.log('Failed to initialize database server:', error)
    }
}

startServer();



