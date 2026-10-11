import express from 'express';
import cors from 'cors';
import statusRouter from './routes/status.js';
import { runMigrations } from './services/tableService.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', statusRouter);

const PORT = 3000;

// 1. Run database setup scripts first
console.log('🔄 Setting up database tables...');
await runMigrations(); 

// 2. Start listening once the database is ready
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
