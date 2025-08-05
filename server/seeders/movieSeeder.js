import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Movie from '../models/Movie.js';
import {getPosterUrl} from "../config/postUrl.js"; // adjust if your path is different

dotenv.config();



const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};


const seedMovies = async () => {
    await connectDB();

    try {
        await Movie.deleteMany();

        const moviesData = [
            {
                title: 'Inception',
                description: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
                genre: ['Sci-Fi', 'Action'],
                duration: 148,
                trailerUrl: 'https://youtube.com/watch?v=YoHD9XEInc0',
                rating: 8.8,
                releaseDate: new Date('2010-07-16'),
                language: 'English',
            },
            {
                title: 'The Dark Knight',
                description: 'Batman faces his nemesis, the Joker, who plunges Gotham into anarchy.',
                genre: ['Action', 'Crime', 'Drama'],
                duration: 152,
                trailerUrl: 'https://youtube.com/watch?v=EXeTwQWrcwY',
                rating: 9.0,
                releaseDate: new Date('2008-07-18'),
                language: 'English',
            },
            {
                title: 'Spirited Away',
                description: 'During her family’s move, a 10-year-old girl enters a world ruled by spirits.',
                genre: ['Animation', 'Fantasy', 'Adventure'],
                duration: 125,
                trailerUrl: 'https://youtube.com/watch?v=ByXuk9QqQkk',
                rating: 8.6,
                releaseDate: new Date('2001-07-20'),
                language: 'Japanese',
            },
        ];

        for (const movie of moviesData) {
            const posterUrl = await getPosterUrl(movie.title);
            const movieWithPoster = { ...movie, posterUrl };
            await Movie.create(movieWithPoster);
            console.log(`Seeded: ${movie.title}`);
        }

        console.log('\nMovies seeded with real posters.');
        process.exit();
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

export default seedMovies;