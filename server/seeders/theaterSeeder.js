import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Theater from '../models/Theater.js'; // adjust the path if necessary

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Connection error:', error);
        process.exit(1);
    }
};

const seedTheaters = async () => {
    await connectDB();

    try {
        await Theater.deleteMany(); // Clear old data

        const theaters = [
            {
                name: 'Majestic Cinema',
                location: 'Colombo',
                rows: 10,
                seatsPerRow: 15,
                screens: [
                    { name: 'Screen 1', totalSeats: 150 },
                    { name: 'Screen 2', totalSeats: 100 }
                ]
            },
            {
                name: 'Savoy 3D',
                location: 'Wellawatte',
                rows: 12,
                seatsPerRow: 20,
                screens: [
                    { name: 'Screen A', totalSeats: 240 },
                    { name: 'Screen B', totalSeats: 180 }
                ]
            },
            {
                name: 'Liberty by Scope',
                location: 'Colombo 03',
                rows: 8,
                seatsPerRow: 12,
                screens: [
                    { name: 'Gold Class', totalSeats: 96 },
                    { name: 'Classic', totalSeats: 100 }
                ]
            }
        ];

        await Theater.insertMany(theaters);
        console.log('Theaters seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

export default seedTheaters;