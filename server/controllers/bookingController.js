import Stripe from "stripe";
import Booking from '../models/Booking.js';
import Showtime from '../models/Showtime.js';
import Theater from '../models/Theatre.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createBooking = async (req, res) => {
    try {
        const { userId, showtimeId, seats } = req.body;

        const showtime = await Showtime.findById(showtimeId).populate('movie theater');
        if (!showtime) return res.status(404).json({ message: 'Showtime not found' });

        // Check if seats are available
        const isSeatTaken = seats.some(seat => showtime.bookedSeats.includes(seat));
        if (isSeatTaken) return res.status(400).json({ message: 'Some selected seats are already booked' });

        const totalPrice = seats.length * showtime.price;

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${showtime.movie.title} - ${showtime.theater.name}`,
                        description: `Seats: ${seats.join(', ')}`,
                    },
                    unit_amount: showtime.price * 100, // in cents
                },
                quantity: seats.length,
            }],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/booking-success`,
            cancel_url: `${process.env.CLIENT_URL}/booking-failure`,
        });

        // Create Booking with 'pending' payment status
        const booking = new Booking({
            user: userId,
            showtime: showtime._id,
            theater: showtime.theater._id,
            seats,
            totalPrice,
            paymentStatus: 'pending',
        });

        await booking.save();

        res.status(200).json({ sessionUrl: session.url, bookingId: booking._id });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create booking', error: err.message });
    }
};

export const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
        const event = stripe.webhooks.constructEvent(
            req.rawBody,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            // Assume metadata includes bookingId
            const bookingId = session.metadata?.bookingId;
            if (bookingId) {
                await Booking.findByIdAndUpdate(bookingId, {
                    paymentStatus: 'paid'
                });

                // Optional: Add booked seats to Showtime
                const booking = await Booking.findById(bookingId);
                await Showtime.findByIdAndUpdate(booking.showtime, {
                    $push: { bookedSeats: { $each: booking.seats } }
                });
            }
        }

        res.status(200).send('Webhook received');
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};