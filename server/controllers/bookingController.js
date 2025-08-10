import Stripe from "stripe";
import Booking from '../models/Booking.js';
import Showtime from '../models/Showtime.js';
import Theater from '../models/Theater.js';

//const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createBooking = async (req, res) => {
    try {
        const { userId, showtimeId, seats } = req.body;

        const showtime = await Showtime.findById(showtimeId).populate('theater');
        if (!showtime) return res.status(404).json({ message: 'Showtime not found' });

        // Check seat availability
        const alreadyBooked = showtime.bookedSeats;
        const isConflict = seats.some(seat => alreadyBooked.includes(seat));
        if (isConflict) {
            return res.status(400).json({ message: 'One or more selected seats are already booked' });
        }

        const totalPrice = seats.length * showtime.price;

        // Create booking
        const booking = new Booking({
            user: userId,
            showtime: showtime._id,
            theater: showtime.theater._id,
            seats,
            totalPrice,
            paymentStatus: 'pending'
        });

        await booking.save();

        // Update showtime's bookedSeats
        showtime.bookedSeats.push(...seats);
        await showtime.save();

        res.status(201).json({ message: 'Booking created successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create booking', error: error.message });
    }
};


/*export const createBookingStripe = async (req, res) => {
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
};*/

export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name email')
            .populate('showtime')
            .populate('theater')
            .sort({ createdAt: -1 });

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get all bookings', error: error.message });
    }
};

export const getBookingsByUserId = async (req, res) => {
    try {
        const userId = req.params.id;
        const bookings = await Booking.find({user:userId})
        .populate('showtime').populate('theater').sort({createdAt: -1});
        return res.status(200).json(bookings);
    }catch (error){
        res.status(500).json({ message: 'Failed to get bookings', error: error.message });
    }
}

export const getBookingById = async (req, res) => {
    try {
        const bookingId = req.params.id;

        const booking = await Booking.findById(bookingId)
            .populate('user', 'name email')
            .populate('showtime')
            .populate('theater');

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get booking', error: error.message });
    }
};

export const updatePaymentStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['pending', 'paid', 'failed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid payment status' });
        }

        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { paymentStatus: status },
            { new: true }
        ).populate('user showtime theater');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json({ message: 'Payment status updated', booking });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update payment status', error: error.message });
    }
};

export const getBookedSeatsByShowtime = async (req, res) => {
    try {
        const { showtimeId } = req.params;
        const includePending = req.query.includePending === 'true';
        const statuses = includePending ? ['paid', 'pending'] : ['paid'];

        const bookings = await Booking.find(
            { showtime: showtimeId, paymentStatus: { $in: statuses } },
        )
            .select('seats -_id')
            .lean();

        const codesSet = new Set();
        const seats = [];

        const pushSeat = (seat) => {
            if (!seat || seat.row == null || seat.number == null) return;
            const code = `${seat.row}${seat.number}`;
            if (!codesSet.has(code)) {
                codesSet.add(code);
                seats.push({ row: seat.row, number: seat.number, code });
            }
        };

        for (const b of bookings) {
            const seatField = b.seats || [];
            for (const entry of seatField) {
                if (Array.isArray(entry)) {
                    // array-of-arrays case: [[{row, number}, ...], ...]
                    for (const seat of entry) pushSeat(seat);
                } else {
                    // flat case: [{row, number}, ...]
                    pushSeat(entry);
                }
            }
        }

        res.json({
            showtimeId,
            count: seats.length,
            seats,
            codes: seats.map((s) => s.code),
        });
    } catch (error) {
        console.error('getBookedSeatsByShowtime error:', error);
        res
            .status(500)
            .json({ message: 'Failed to load booked seats', error: error.message });
    }
};
