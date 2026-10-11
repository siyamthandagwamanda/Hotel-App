import express from "express";
import cors from 'cors';

const app = express();

app.use(cors())

const PORT = 3000

app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`)
})