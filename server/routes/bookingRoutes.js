import express from "express";
import {auth} from "../middleware/auth.js";
import {
    createBooking,
    createBookingStripe,
    getAllBookings, getBookingById,
    getBookingsByUserId, updatePaymentStatus
} from "../controllers/bookingController.js";
import {isAdmin} from "../middleware/isAdmin.js";

const router = express.Router();

router.post('/',auth,createBooking);
router.post('/stripe-booking',auth,createBookingStripe);
router.get('/',auth,isAdmin,getAllBookings);
router.get('/user/:userId',auth,getBookingsByUserId);
router.get('/:id',auth,getBookingById);
router.put('/update-payment-status/:bookingId',auth,isAdmin,updatePaymentStatus);

export default router;