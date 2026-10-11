import express from "express";
import cors from 'cors';
import statusRouter from './routes/status';


const app = express();

app.use(cors())

app.use('/api', statusRouter);

const PORT = 3000

app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`)
})