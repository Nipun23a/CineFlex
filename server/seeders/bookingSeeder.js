// seedBookings.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Showtime from '../models/Showtime.js';

dotenv.config();

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const seedBookings = async () => {
    await connectDB();

    try {
        // Use an existing user (prefer the seeded regular user)
        const preferredEmail = 'user@example.com';
        const user =
            (await User.findOne({ email: preferredEmail })) ||
            (await User.findOne({ role: 'user' })) ||
            (await User.findOne());

        if (!user) throw new Error('No existing users found. Run your user seeder first.');

        // Find an existing showtime (newest if available)
        const showtime = await Showtime.findOne().sort({ createdAt: -1 }).select('_id theater price');
        if (!showtime) throw new Error('No showtimes found. Seed or create a showtime first.');
        if (!showtime.theater) throw new Error('Showtime has no theater reference.');

        // Idempotency: clear previous bookings for this showtime
        await Booking.deleteMany({ showtime: showtime._id });

        const seatPrice = Number(showtime.price) || 1000;

        // NOTE: Your current schema defines "seats" as array-of-arrays.
        // Keeping that structure: seats: [[{row, number}, ...]]
        const docs = [
            {
                user: user._id,
                showtime: showtime._id,
                theater: showtime.theater, // reuse theater from showtime
                seats: [[{ row: 'A', number: 5 }, { row: 'A', number: 6 }]],
                totalPrice: seatPrice * 2,
                paymentStatus: 'paid',
            },
            {
                user: user._id,
                showtime: showtime._id,
                theater: showtime.theater,
                seats: [[{ row: 'B', number: 10 }, { row: 'B', number: 11 }]],
                totalPrice: seatPrice * 2,
                paymentStatus: 'pending',
            },
            {
                user: user._id,
                showtime: showtime._id,
                theater: showtime.theater,
                seats: [[{ row: 'C', number: 1 }, { row: 'C', number: 2 }, { row: 'C', number: 3 }]],
                totalPrice: seatPrice * 3,
                paymentStatus: 'paid',
            },
        ];

        await Booking.insertMany(docs);
        console.log(
            `Seeded 3 bookings on rows A/B/C for showtime ${showtime._id.toString()} using theater ${showtime.theater.toString()}.`
        );
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err.message || err);
        process.exit(1);
    }
};

export default seedBookings;
