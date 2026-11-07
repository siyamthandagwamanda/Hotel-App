import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import statusRouter from './routes/status';
import hotelRouter from './routes/hotelRoutes';
import authRouter from './routes/authRoutes';
import bookingRouter from './routes/bookingRoutes';
import { runMigrations } from './services/tableService';
import { seedDatabase } from './services/seedService';
import { notFound, errorHandler } from './middleware/errorHandler';

const app = express();

// Render forwards requests through its own server, so trust it to pass on the visitor's real address
app.set('trust proxy', 1);

app.use(cors({ origin: env.clientOrigin }));
app.use(express.json({ limit: '50kb' }));

app.use('/api', statusRouter);
app.use('/api/auth', authRouter);
app.use('/api/hotels', hotelRouter);
app.use('/api/bookings', bookingRouter);

app.use(notFound);
app.use(errorHandler);

async function startServer() {
    try {
        console.log('Setting up database tables...');
        await runMigrations();

        console.log('Seeding hotel data...');
        await seedDatabase();

        app.listen(env.port, () => {
            console.log(`Server is running on port ${env.port}`);
        });
    } catch (error) {
        console.log('Failed to start the server:', error);
        process.exit(1);
    }
}

startServer();