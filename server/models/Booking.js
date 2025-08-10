import mongoose from 'mongoose';


const seatSelSchema = new mongoose.Schema(
    {
        row:{type:String,unique:true},
        number:{type:Number,unique:true},
    }
)

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    showtime: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
    theater: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
    seats: [{ type: [seatSelSchema], required: true }],
    totalPrice: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Booking', bookingSchema);
