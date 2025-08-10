import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import showtimeRoutes from './routes/showtimeRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import theaterRoutes from './routes/theaterRoutes.js';
import runSeeders from "./seeders/index.js";
import {createShowtime} from "./controllers/showtimeController.js";
import {Server} from "socket.io";



dotenv.config();
connectDB().then(async () => {
    await runSeeders(); // 👈 Call only once after DB connection
});



const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));



app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/theaters', theaterRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
