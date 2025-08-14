import Stripe from "stripe";
import Booking from '../models/Booking.js';
import Showtime from '../models/Showtime.js';
import Theater from '../models/Theater.js';
import mongoose from "mongoose";
import {clearLocksFor, getIo, isLockedByOther} from "../ws.js";



const parseSeatString = (s) => {
    const m = String(s).toUpperCase().match(/^([A-Z]+)\s*-?\s*(\d+)$/);
    return m ? { row: m[1], number: Number(m[2]) } : null;
};

const normalizeSeatsToGroups = (seats) => {
    if (!Array.isArray(seats)) return [];
    // If already [[{row,number}], ...]
    if (Array.isArray(seats[0])) {
        return seats.map(group =>
            (group || [])
                .map(x => (typeof x === 'string' ? parseSeatString(x) : x))
                .filter(Boolean)
        ).filter(g => g.length);
    }
    // If [{row,number}] or ["A5"]
    const flat = seats
        .map(x => (typeof x === 'string' ? parseSeatString(x) : x))
        .filter(Boolean);
    return flat.length ? [flat] : [];
};

const toCodes = (seatGroups) =>
    seatGroups.flat().map(s => `${String(s.row).toUpperCase()}${Number(s.number)}`);


export const createBooking = async (req, res) => {
    try {
        // Accept both showtime/showtimeId and theater/theaterId/cinemaId
        const showtimeId = req.body.showtime || req.body.showtimeId;
        let theaterId = req.body.theater || req.body.theaterId || req.body.cinemaId;

        // Normalize seats into array-of-arrays of {row, number}
        const seatsGroups = normalizeSeatsToGroups(req.body.seats);

        if (!showtimeId || seatsGroups.length === 0) {
            return res.status(400).json({ message: 'Missing Information (showtime or seats).' });
        }

        if (!mongoose.isValidObjectId(showtimeId)) {
            return res.status(400).json({ message: 'Invalid showtime id.' });
        }
        if (theaterId && !mongoose.isValidObjectId(theaterId)) {
            return res.status(400).json({ message: 'Invalid theater id.' });
        }

        // Fetch showtime (and theater if provided)
        const showtime = await Showtime.findById(showtimeId).lean();
        if (!showtime) {
            return res.status(400).json({ message: 'Showtime not found.' });
        }

        // If theaterId missing, derive from showtime
        if (!theaterId) {
            theaterId = String(showtime.theater || '');
            if (!theaterId) {
                return res.status(400).json({ message: 'Theater not provided and not linked to showtime.' });
            }
        }

        const theater = await Theater.findById(theaterId).lean();
        if (!theater) {
            return res.status(400).json({ message: 'Theater not found.' });
        }

        // Ensure showtime belongs to theater
        if (showtime.theater?.toString && showtime.theater.toString() !== String(theaterId)) {
            return res.status(400).json({ message: 'Showtime does not belong to this theater.' });
        }

        // Simple conflict check (works with nested seats)
        const flatSeats = seatsGroups.flat();
        const userId = req.user?.id || '';
        const selectedCodes = flatSeats.map(s => `${String(s.row).toUpperCase()}${Number(s.number)}`);
        for (const code of selectedCodes) {
            if (isLockedByOther(showtimeId, code, userId)) {
                return res.status(409).json({ message: `Seat ${code} is temporarily locked by another user.` });
            }
        }

        const orConds = flatSeats.map(s => ({
            seats: { $elemMatch: { $elemMatch: { row: s.row, number: s.number } } }
        }));

        const conflict = await Booking.findOne({
            showtime: showtimeId,
            theater: theaterId,
            paymentStatus: { $in: ['pending', 'paid'] },
            $or: orConds
        }).lean();

        if (conflict) {
            return res.status(409).json({ message: 'One or more seats already booked.' });
        }

        // Price: trust client if provided; else compute from showtime.price * seat count
        const clientTotal = req.body.totalPrice;
        const computedTotal = Number(showtime.price || 0) * flatSeats.length;
        const totalPrice = (clientTotal && Number(clientTotal) > 0)
            ? Number(clientTotal)
            : computedTotal;

        const booking = await Booking.create({
            user: req.user?.id,
            customer_name: req.body.customer_name,
            customer_email: req.body.customer_email,
            customer_phone: req.body.customer_phone,
            showtime: showtimeId,
            theater: theaterId,
            seats: seatsGroups,             // keep array-of-arrays
            totalPrice,
            paymentStatus: 'pending'
        });

        return res.status(201).json({ message: 'Booking created.', booking });
    } catch (error) {
        console.error('Create Booking Error:', error);
        return res.status(500).json({ message: 'Failed to create booking' });
    }
};

export const createStripePaymentIntent = async (req, res) => {
    try {
        const showtimeId = req.body.showtime || req.body.showtimeId;
        let theaterId     = req.body.theater  || req.body.theaterId || req.body.cinemaId;
        const seatGroups  = normalizeSeatsToGroups(req.body.seats);
        const userId      = req.user?.id || '';

        if (!showtimeId || seatGroups.length === 0) {
            return res.status(400).json({ message: 'Missing Information (showtime or seats).' });
        }
        if (!mongoose.isValidObjectId(showtimeId)) {
            return res.status(400).json({ message: 'Invalid showtime id.' });
        }
        if (theaterId && !mongoose.isValidObjectId(theaterId)) {
            return res.status(400).json({ message: 'Invalid theater id.' });
        }

        const showtime = await Showtime.findById(showtimeId).lean();
        if (!showtime) return res.status(400).json({ message: 'Showtime not found.' });

        // Derive theater if not provided
        if (!theaterId) {
            theaterId = String(showtime.theater || '');
            if (!theaterId) return res.status(400).json({ message: 'Theater not provided and not linked to showtime.' });
        }

        const theater = await Theater.findById(theaterId).lean();
        if (!theater) return res.status(400).json({ message: 'Theater not found.' });
        if (showtime.theater?.toString && showtime.theater.toString() !== String(theaterId)) {
            return res.status(400).json({ message: 'Showtime does not belong to this theater.' });
        }

        // Quick conflict check (same as your normal create)
        const flatSeats = seatGroups.flat();
        const selectedCodes = flatSeats.map(s => `${String(s.row).toUpperCase()}${Number(s.number)}`);

// Reject if any seat is locked by another user
        for (const code of selectedCodes) {
            if (isLockedByOther(showtimeId, code, userId)) {
                return res.status(409).json({ message: `Seat ${code} is temporarily locked by another user.` });
            }
        }
        const orConds = flatSeats.map(s => ({
            seats: { $elemMatch: { $elemMatch: { row: s.row, number: s.number } } }
        }));
        const conflict = await Booking.findOne({
            showtime: showtimeId,
            theater : theaterId,
            paymentStatus: { $in: ['pending', 'paid'] },
            $or: orConds
        }).lean();
        if (conflict) {
            return res.status(409).json({ message: 'One or more seats already booked.' });
        }

        // Amount in cents from backend price
        const pricePerSeat = Number(showtime.price || 0);
        if (!(pricePerSeat > 0)) return res.status(400).json({ message: 'Invalid showtime price.' });
        const amount = Math.round(pricePerSeat * flatSeats.length * 100);

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const pi = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
            metadata: {
                userId,
                showtimeId,
                theaterId,
                seats: JSON.stringify(seatGroups),
                customer_name: req.body.customer_name || '',
                customer_email: req.body.customer_email || '',
                customer_phone: req.body.customer_phone || '',
            },
        });

        return res.status(200).json({
            clientSecret: pi.client_secret,
            paymentIntentId: pi.id
        });
    } catch (error) {
        console.error('createStripePaymentIntent error:', error);
        return res.status(500).json({ message: 'Failed to create payment' });
    }
};

export const confirmStripeAndCreateBooking = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;
        if (!paymentIntentId) return res.status(400).json({ message: 'Missing paymentIntentId.' });

        const pi = await new Stripe(process.env.STRIPE_SECRET_KEY).paymentIntents.retrieve(paymentIntentId);
        if (!pi) return res.status(404).json({ message: 'PaymentIntent not found.' });

        if (pi.status !== 'succeeded') {
            return res.status(400).json({ message: `Payment not completed (status: ${pi.status}).` });
        }

        // Pull metadata to reconstruct booking payload
        const md = pi.metadata || {};
        const showtimeId   = md.showtimeId;
        const theaterId    = md.theaterId;
        const seatsGroups  = JSON.parse(md.seats || '[]');
        const customer_name  = md.customer_name || req.body.customer_name || '';
        const customer_email = md.customer_email || req.body.customer_email || '';
        const customer_phone = md.customer_phone || req.body.customer_phone || '';
        const userId = md.userId || req.user?.id;

        if (!showtimeId || !theaterId || !Array.isArray(seatsGroups) || seatsGroups.length === 0) {
            return res.status(400).json({ message: 'Missing booking metadata in PaymentIntent.' });
        }

        // Final quick conflict check (rare race condition guard)
        const flatSeats = seatsGroups.flat();
        const orConds = flatSeats.map(s => ({
            seats: { $elemMatch: { $elemMatch: { row: s.row, number: s.number } } }
        }));
        const existing = await Booking.findOne({
            showtime: showtimeId,
            theater : theaterId,
            paymentStatus: { $in: ['pending', 'paid'] },
            $or: orConds
        }).lean();
        if (existing) {
            // If someone squeezed in, don’t create a duplicate booking.
            return res.status(409).json({ message: 'Seat conflict after payment. Please contact support.' });
        }

        const showtime = await Showtime.findById(showtimeId).lean();
        if (!showtime) return res.status(400).json({ message: 'Showtime not found.' });

        const totalPrice = Number(pi.amount_received || pi.amount || 0) / 100;

        const booking = await Booking.create({
            user: userId,
            customer_name,
            customer_email,
            customer_phone,
            showtime: showtimeId,
            theater : theaterId,
            seats   : seatsGroups,    // keep array-of-arrays
            totalPrice,
            paymentStatus: 'paid'
        });
        const codes = toCodes(seatsGroups);
        clearLocksFor(showtimeId, codes);
        getIo()?.to(`showtime:${showtimeId}`).emit("seats:booked", { showtimeId, codes });

        return res.status(201).json({ message: 'Booking created.', booking });
    } catch (error) {
        console.error('confirmStripeAndCreateBooking error:', error);
        return res.status(500).json({ message: 'Failed to finalize booking' });
    }
};
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
        const userId = req.params.userId; // <- FIX
        const bookings = await Booking.find({ user: userId })
            .populate({
                path: "showtime",
                populate: [
                    { path: "movie", select: "title posterUrl genre duration language rating" },
                    { path: "theater", select: "name location" },
                ],
            })
            .populate({ path: "theater", select: "name location" }) // (booking also stores theater)
            .sort({ createdAt: -1 });

        return res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Failed to get bookings", error: error.message });
    }
};

export const getBookingById = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const booking = await Booking.findById(bookingId)
            .populate("user", "name email")
            .populate({
                path: "showtime",
                populate: [
                    { path: "movie", select: "title posterUrl genre duration language rating" },
                    { path: "theater", select: "name location" },
                ],
            })
            .populate({ path: "theater", select: "name location" });

        if (!booking) return res.status(404).json({ message: "Booking not found" });
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: "Failed to get booking", error: error.message });
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
        const includePending = req.query.includePending === "true";
        const statuses = includePending ? ["paid", "pending"] : ["paid"];

        // 1️⃣ Get the showtime (only price field)
        const showtime = await Showtime.findById(showtimeId).select("price");
        if (!showtime) {
            return res.status(404).json({ message: "Showtime not found" });
        }

        // 2️⃣ Get booked seats
        const bookings = await Booking.find({
            showtime: showtimeId,
            paymentStatus: { $in: statuses },
        })
            .select("seats -_id")
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

        // 3️⃣ Return price + seat data (no count)
        res.json({
            showtimeId,
            price: showtime.price,
            seats,
            codes: seats.map((s) => s.code),
        });
    } catch (error) {
        console.error("getBookedSeatsByShowtime error:", error);
        res
            .status(500)
            .json({ message: "Failed to load booked seats", error: error.message });
    }
};
