import express from 'express';
import cors from 'cors';
import statusRouter from './routes/status.js';
import hotelRouter from './routes/hotelRoutes.js';
import { runMigrations } from './services/tableService.js';
import { seedDatabase } from './services/seedService.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', statusRouter);
app.use('/api/hotels', hotelRouter);

const PORT = 3000;


console.log('🔄 Setting up database tables...');
runMigrations();

console.log('🏨 Seeding hotel mock data...');
seedDatabase(); 


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
