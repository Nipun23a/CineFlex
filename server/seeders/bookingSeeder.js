import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Showtime from '../models/Showtime.js';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection failed:', err);
        process.exit(1);
    }
};

const seedBookings = async () => {
    await connectDB();

    try {
        await Booking.deleteMany(); // Clear old bookings

        const user = await User.findOne({ role: 'user' });
        const showtime = await Showtime.findOne().populate('theater');

        if (!user || !showtime) {
            console.log('No normal user or showtime found. Please seed them first.');
            process.exit(1);
        }

        // Sample booking data
        const selectedSeats = [5, 6, 7];
        const totalPrice = selectedSeats.length * showtime.price;

        const booking = new Booking({
            user: user._id,
            showtime: showtime._id,
            theater: showtime.theater._id,
            seats: selectedSeats,
            totalPrice,
            paymentStatus: 'paid',
        });

        await booking.save();
        console.log('Booking seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('Booking seeding failed:', err);
        process.exit(1);
    }
};

export default seedBookings;

