import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Theater from '../models/Theater.js';
import Booking from '../models/Booking.js';

import seedUsers from './userSeeder.js';
import seedMovies from './movieSeeder.js';
import seedTheaters from './theaterSeeder.js';
import seedShowtimes from './showtimeSeeder.js';
import seedBookings from './bookingSeeder.js';
import Showtime from "../models/Showtime.js";

const runSeeders = async () => {
    const userCount = await User.countDocuments();
    const movieCount = await Movie.countDocuments();
    const theaterCount = await Theater.countDocuments();
    const showtimeCount = await Showtime.countDocuments();
    const bookingCount = await Booking.countDocuments();

    if (userCount === 0) {
        console.log('Seeding users...');
        await seedUsers();
    }

    if (movieCount === 0) {
        console.log('Seeding movies...');
        await seedMovies();
    }

    if (theaterCount === 0) {
        console.log('Seeding theaters...');
        await seedTheaters();
    }

    if (showtimeCount === 0) {
        console.log('Seeding showtimes...');
        await seedShowtimes();
    }

    if (bookingCount === 0) {
        console.log('Seeding bookings...');
        await seedBookings();
    }

    console.log('All necessary seeders executed.');
};

export default runSeeders;
