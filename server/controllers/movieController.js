import Movie from '../models/Movie.js';
import {getPosterUrl} from "../config/postUrl.js";


export const createMovie = async (req, res) => {
    try {
        const { title, posterUrl, ...rest } = req.body;
        let finalPosterUrl = posterUrl;
        if (!posterUrl && title) {
            finalPosterUrl = await getPosterUrl(title);
        }

        const movie = new Movie({
            title,
            posterUrl: finalPosterUrl,
            ...rest
        });

        await movie.save();

        res.status(201).json({ message: 'Movie created successfully', movie });
    } catch (err) {
        console.error('Create Movie Error:', err.message);
        res.status(500).json({ message: 'Failed to create movie', error: err.message });
    }
};



export const getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find().sort({ createdAt: -1 });
        res.status(200).json(movies);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch movies', error: err.message });
    }
};


export const getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ message: 'Movie not found' });

        res.status(200).json(movie);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch movie', error: err.message });
    }
};


export const updateMovie = async (req, res) => {
    try {
        const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!movie) return res.status(404).json({ message: 'Movie not found' });

        res.status(200).json({ message: 'Movie updated successfully', movie });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update movie', error: err.message });
    }
};


export const deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findByIdAndDelete(req.params.id);
        if (!movie) return res.status(404).json({ message: 'Movie not found' });

        res.status(200).json({ message: 'Movie deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete movie', error: err.message });
    }
};
