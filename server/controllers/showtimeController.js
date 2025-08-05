import Showtime from '../models/Showtime.js';
import Movie from '../models/Movie.js';
import Theater from '../models/Theater.js';


export const createShowtime = async (req, res) => {
    try {
        const { movie, theater, screen, date, startTime, totalSeats, price } = req.body;

        // Check if movie exists
        const movieExists = await Movie.findById(movie);
        if (!movieExists) return res.status(404).json({ message: 'Movie not found' });

        // Check if theater exists
        const theaterExists = await Theater.findById(theater);
        if (!theaterExists) return res.status(404).json({ message: 'Theater not found' });

        const showtime = new Showtime({
            movie,
            theater,
            screen,
            date,
            startTime,
            totalSeats,
            bookedSeats: [],
            price
        });

        await showtime.save();
        res.status(201).json({ message: 'Showtime created', showtime });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create showtime', error: err.message });
    }
};


export const getAllShowtimes = async (req, res) => {
    try {
        const showtimes = await Showtime.find()
            .populate('movie')
            .populate('theater') // NEW
            .sort({ date: 1, startTime: 1 });
        res.status(200).json(showtimes);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch showtimes', error: err.message });
    }
};

export const getShowtimeById = async (req, res) => {
    try {
        const showtime = await Showtime.findById(req.params.id).populate('movie');
        if (!showtime) return res.status(404).json({ message: 'Showtime not found' });

        res.status(200).json(showtime);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get showtime', error: err.message });
    }
};

// Update a showtime
export const updateShowtime = async (req, res) => {
    try {
        const { theater, movie } = req.body;

        if (theater) {
            const theaterExists = await Theater.findById(theater);
            if (!theaterExists) return res.status(404).json({ message: 'Theater not found' });
        }

        if (movie) {
            const movieExists = await Movie.findById(movie);
            if (!movieExists) return res.status(404).json({ message: 'Movie not found' });
        }

        const updatedShowtime = await Showtime.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('movie')
            .populate('theater');

        if (!updatedShowtime) return res.status(404).json({ message: 'Showtime not found' });

        res.status(200).json({ message: 'Showtime updated', showtime: updatedShowtime });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update showtime', error: err.message });
    }
};


// Delete a showtime
export const deleteShowtime = async (req, res) => {
    try {
        const deleted = await Showtime.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Showtime not found' });

        res.status(200).json({ message: 'Showtime deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete showtime', error: err.message });
    }
};
