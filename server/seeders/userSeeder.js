import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
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

// Seeder function
const seedUsers = async () => {
    await connectDB();

    try {
        // Clear existing users
        await User.deleteMany();

        // Hash passwords
        const password1 = await bcrypt.hash('Admin@123', 10);
        const password2 = await bcrypt.hash('User@123', 10);

        // Create users
        const users = [
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: password1,
                role: 'admin',
            },
            {
                name: 'Regular User',
                email: 'user@example.com',
                password: password2,
                role: 'user',
            },
        ];

        await User.insertMany(users);
        console.log('Users seeded successfully');
        process.exit();
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

export default seedUsers;
