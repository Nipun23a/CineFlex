import mongoose from 'mongoose';

const showtimeSchema = new mongoose.Schema({
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    screen: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // e.g., "18:00"
    totalSeats: { type: Number, required: true },
    bookedSeats: [{ type: Number }], // e.g., [1, 2, 5]
    price: { type: Number, required: true }
});

export default mongoose.model('Showtime', showtimeSchema);
