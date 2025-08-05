import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Showtime from '../models/Showtime.js';
import Movie from '../models/Movie.js';
import Theater from '../models/Theater.js';

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

const seedShowtimes = async () => {
    await connectDB();

    try {
        await Showtime.deleteMany(); // clear old data

        const movies = await Movie.find();
        const theaters = await Theater.find();

        if (movies.length === 0 || theaters.length === 0) {
            console.log('No movies or theaters found. Seed those first.');
            process.exit(1);
        }

        const showtimes = [];

        for (const theater of theaters) {
            for (const screen of theater.screens) {
                const randomMovie = movies[Math.floor(Math.random() * movies.length)];

                const showtime = {
                    movie: randomMovie._id,
                    theater: theater._id,
                    screen: screen.name,
                    date: new Date(), // today
                    startTime: '18:00',
                    totalSeats: screen.totalSeats,
                    bookedSeats: [],
                    price: Math.floor(Math.random() * 200 + 300),
                };

                showtimes.push(showtime);
            }
        }

        await Showtime.insertMany(showtimes);
        console.log('Showtimes seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

export default seedShowtimes;
