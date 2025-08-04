import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    genre: [String],
    duration: Number, // in minutes
    posterUrl: String,
    trailerUrl: String,
    rating: { type: Number, min: 0, max: 10 },
    releaseDate: Date,
    language: String,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Movie', movieSchema);