import mongoose from 'mongoose';

const theaterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    screens: [{ name: String, totalSeats: Number }]
});

export default mongoose.model('Theater', theaterSchema);
