import express from "express";
import {auth} from "../middleware/auth.js";
import {
    confirmStripeAndCreateBooking,
    createBooking, createStripePaymentIntent,
    getAllBookings, getBookedSeatsByShowtime, getBookingById,
    getBookingsByUserId, updatePaymentStatus
} from "../controllers/bookingController.js";
import {isAdmin} from "../middleware/isAdmin.js";

const router = express.Router();

router.post('/',auth,createBooking);
router.get('/',auth,isAdmin,getAllBookings);
router.post('/payment/create-intent',auth,createStripePaymentIntent);
router.post('/payment/confirm',auth,confirmStripeAndCreateBooking);
router.get('/user/:userId',auth,getBookingsByUserId);
router.get('/showtimes/:showtimeId/booked-seats',getBookedSeatsByShowtime);
router.get('/:id',auth,getBookingById);
router.put('/update-payment-status/:bookingId',auth,isAdmin,updatePaymentStatus);

export default router;