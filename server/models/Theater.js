import mongoose from 'mongoose';

const theaterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    rows: { type: Number, default: 0 },
    seatsPerRow: { type: Number, default: 0 },
    screens: [{ name: String, totalSeats: Number }]
});

export default mongoose.model('Theater', theaterSchema);
