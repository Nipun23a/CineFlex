import mongoose from 'mongoose';

const showtimeSchema = new mongoose.Schema({
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    theater: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true }, // NEW
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    totalSeats: { type: Number, required: true },
    bookedSeats: [{ type: Number }],
    price: { type: Number, required: true }
});

export default mongoose.model('Showtime', showtimeSchema);
