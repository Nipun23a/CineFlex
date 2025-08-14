// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import * as http from 'node:http';

import connectDB from './config/db.js';
import runSeeders from './seeders/index.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import showtimeRoutes from './routes/showtimeRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import theaterRoutes from './routes/theaterRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

import { initWs } from './ws.js'; // our Socket.IO initializer (no Redis)

// -------- env & DB --------
dotenv.config();

await connectDB();

if (process.env.SEED_ON_START === 'true') {
    try {
        await runSeeders();
        console.log('✅ Seeders completed');
    } catch (e) {
        console.error('❌ Seeders failed:', e);
    }
}

// -------- app & middleware --------
const app = express();

app.use(cors({
    origin: process.env.CLIENT_ORIGIN?.split(',') || '*', // set to your frontend URL in .env
    credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// -------- routes --------
app.get('/', (_req, res) => res.send('Hello World!'));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/theaters', theaterRoutes);
app.use('/api/admin', adminRoutes);

// -------- http + websockets --------
const server = http.createServer(app);
initWs(server); // <-- attaches Socket.IO to THIS server

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 HTTP + WebSocket server running on port ${PORT}`);
});

// (optional) graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down...');
    server.close(() => process.exit(0));
});
