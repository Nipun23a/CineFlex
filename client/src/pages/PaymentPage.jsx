// src/pages/PaymentPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ArrowLeft, CreditCard, MapPin, Calendar, Clock, Ticket, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {confirmStripeBooking, createBooking, createStripeIntent} from "../utils/api.js";

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const stripe = useStripe();
    const elements = useElements();

    const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||'');

    // 1) Read booking payload from router state or sessionStorage (for refresh/login round trip)
    const navState = location.state || {};
    const [persisted, setPersisted] = useState(() => {
        try {
            const raw = sessionStorage.getItem('pendingBooking');
            return raw ? JSON.parse(raw) : null;
        } catch (_) {
            return null;
        }
    });

    const bookingData = useMemo(() => {
        const merged = {
            showtimeId:navState.showtimeId || persisted?.showtimeId,
            movie: navState.movie || persisted?.movie,
            date: navState.date || persisted?.date,
            cinema: navState.cinema || persisted?.cinema,
            time: navState.time || persisted?.time,
            seats: navState.seats || persisted?.seats || [],
            total: typeof navState.total === 'number' ? navState.total
                : typeof persisted?.total === 'number' ? persisted.total
                    : 0
        };
        return merged;
    }, [navState, persisted]);

    // 2) If not logged in, save payload and send to login with redirect back to /payment
    useEffect(() => {
        const hasAll = bookingData.movie && bookingData.date && bookingData.cinema && bookingData.time && bookingData.seats?.length;
        if (!hasAll) return; // let the next guard handle missing fields

        if (!user) {
            sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
            navigate(`/login?redirect=${encodeURIComponent('/payment')}`, { replace: true });
        }
    }, [user, bookingData, navigate]);

    // 3) If payload is missing, send back to home (or seat page)
    useEffect(() => {
        const hasAll = bookingData.movie && bookingData.date && bookingData.cinema && bookingData.time && bookingData.seats?.length;
        if (!hasAll) {
            navigate('/', { replace: true });
        }
    }, [bookingData, navigate]);

    // -------- existing component state --------
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentComplete, setPaymentComplete] = useState(false);
    const [error, setError] = useState('');
    const [customerInfo, setCustomerInfo] = useState({
        email: '',
        phone: '',
        firstName: '',
        lastName: ''
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const validateBasicInfo = () => {
        const { email, phone, firstName, lastName } = customerInfo;
        if (!email || !email.includes('@')) { setError('Please enter a valid email address'); return false; }
        if (!phone.trim()) { setError('Please enter your phone number'); return false; }
        if (!firstName.trim() || !lastName.trim()) { setError('Please enter your full name'); return false; }
        return true;
    };
    const handlePayment = async () => {
        setError('');
        setIsProcessing(true);

        try {


            switch (selectedPaymentMethod) {
                case 'stripe':
                {
                    if (!validateBasicInfo()) { setIsProcessing(false); return; }
                    if (!stripe || !elements) { setIsProcessing(false); setError('Stripe not ready.'); return; }

                    // 1) Create a PaymentIntent on the server
                    const { data: piData } = await createStripeIntent({
                        showtime: bookingData.showtimeId,
                        seats: bookingData.seats,
                        customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`.trim(),
                        customer_email: customerInfo.email,
                        customer_phone: customerInfo.phone,
                    });

                    if (!piData?.clientSecret) {
                        setIsProcessing(false);
                        setError('Failed to start payment. Please try again.');
                        return;
                    }

                    // 2) Confirm card on the client using the CardElement
                    const cardEl = elements.getElement(CardElement);
                    const result = await stripe.confirmCardPayment(piData.clientSecret, {
                        payment_method: {
                            card: cardEl,
                            billing_details: {
                                name: `${customerInfo.firstName} ${customerInfo.lastName}`.trim(),
                                email: customerInfo.email,
                                phone: customerInfo.phone,
                            },
                        },
                    });

                    if (result.error) {
                        setIsProcessing(false);
                        setError(result.error.message || 'Payment failed.');
                        return;
                    }

                    if (result.paymentIntent?.status === 'succeeded') {
                        // 3) Tell backend to create the booking for this successful PaymentIntent
                        await confirmStripeBooking(result.paymentIntent.id);

                        setPaymentComplete(true);
                        sessionStorage.removeItem('pendingBooking');
                        return; // prevent the generic success block
                    }

                    setIsProcessing(false);
                    setError(`Payment not completed (status: ${result.paymentIntent?.status || 'unknown'}).`);
                    return;
                }

                case 'premises':
                    { if (!validateBasicInfo()) { setIsProcessing(false); return; }

                        console.log(bookingData.seats);
                        const payload = {
                            showtime: bookingData.showtimeId,     // or showtimeId field works too
                            theater: bookingData.theaterId,       // optional; controller can derive from showtime
                            seats: bookingData.seats,             // e.g. ["A5","A6"] is OK now
                            totalPrice: Number(bookingData.total || 0),
                            customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`.trim(),
                            customer_email: customerInfo.email,
                            customer_phone: customerInfo.phone
                        };

                    // 2) Very light guard
                    if (!payload.showtime || !Array.isArray(payload.seats) || !payload.seats[0]?.length) {
                        setIsProcessing(false);
                        setError('Missing booking info (showtime or seats).');
                        return;
                    }

                    // 3) Call backend ONLY for premises
                    const { data } = await createBooking(payload);

                    // 4) Success UI
                    setPaymentComplete(true);
                    sessionStorage.removeItem('pendingBooking');
                    console.log('Booking created:', data?.booking);
                    return; } // prevent running the generic success block below

                default:
                    setError('Please select a payment method');
                    setIsProcessing(false);
                    return;
            }

            // For non-premises (e.g., stripe) you’re just simulating payment here.
            // eslint-disable-next-line no-unreachable
        } catch (err) {
            setError(err?.response?.data?.message || err.message || 'Something went wrong');
        } finally {
            setIsProcessing(false);
        }
    };


    const goBack = () => {
        navigate(-1);
    };

    const restartPayment = () => {
        setPaymentComplete(false);
        setSelectedPaymentMethod('');
        setError('');
    };

    // ======= UI (unchanged, but reading from bookingData) =======
    if (paymentComplete) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Payment Successful!</h2>
                    <p className="text-gray-400 mb-2">Your tickets have been booked successfully.</p>
                    <p className="text-sm text-gray-500 mb-6">Confirmation details will be sent to your email.</p>

                    <div className="bg-gray-800 rounded-lg p-4 mb-6 text-left">
                        <h3 className="font-semibold mb-2">Booking Details</h3>
                        <div className="text-sm text-gray-300 space-y-1">
                            <div><strong>Movie:</strong> {bookingData.movie?.title}</div>
                            <div><strong>Date:</strong> {formatDate(bookingData.date)}</div>
                            <div><strong>Time:</strong> {bookingData.time}</div>
                            <div><strong>Cinema:</strong> {bookingData.cinema}</div>
                            <div><strong>Seats:</strong> {bookingData.seats?.join(', ')}</div>
                            <div><strong>Total:</strong> LKR{Number(bookingData.total || 0).toFixed(2)}</div>
                        </div>
                    </div>

                    <button
                        onClick={restartPayment}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Make Another Booking
                    </button>
                </div>
            </div>
        );
    }

    return (
            <div className="min-h-screen bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <button onClick={goBack} className="flex items-center text-gray-400 hover:text-white mb-8">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Seat Selection
                    </button>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Payment Form */}
                        <div className="flex-1">
                            <div className="bg-gray-800 p-6 rounded-xl">
                                <h2 className="text-3xl font-bold mb-6">Complete Your Payment</h2>

                                {error && (
                                    <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-6 flex items-center">
                                        <AlertCircle className="w-5 h-5 mr-3 text-red-500" />
                                        <span className="text-red-400">{error}</span>
                                    </div>
                                )}

                                {/* Customer Information */}
                                <div className="mb-8">
                                    <h3 className="text-xl font-semibold mb-4">Customer Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <input
                                            type="text"
                                            placeholder="First Name"
                                            value={customerInfo.firstName}
                                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-yellow-500 focus:outline-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Last Name"
                                            value={customerInfo.lastName}
                                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-yellow-500 focus:outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            value={customerInfo.email}
                                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-yellow-500 focus:outline-none"
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Phone Number"
                                            value={customerInfo.phone}
                                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-yellow-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Payment Methods */}
                                <div className="mb-8">
                                    <h3 className="text-xl font-semibold mb-4">Payment Method</h3>

                                    {/* Stripe Option */}
                                    <div className="mb-4">
                                        <label className="flex items-center p-4 border border-gray-600 rounded-lg cursor-pointer hover:border-yellow-500 transition-colors">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="stripe"
                                                checked={selectedPaymentMethod === 'stripe'}
                                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                                className="mr-3"
                                            />
                                            <CreditCard className="w-5 h-5 mr-3 text-blue-500" />
                                            <div>
                                                <div className="font-semibold">Credit/Debit Card</div>
                                                <div className="text-sm text-gray-400">Secure payment via Stripe</div>
                                            </div>
                                        </label>
                                    </div>
                                    {/* Pay at Premises Option */}
                                    <div className="mb-4">
                                        <label className="flex items-center p-4 border border-gray-600 rounded-lg cursor-pointer hover:border-yellow-500 transition-colors">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="premises"
                                                checked={selectedPaymentMethod === 'premises'}
                                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                                className="mr-3"
                                            />
                                            <MapPin className="w-5 h-5 mr-3 text-green-500" />
                                            <div>
                                                <div className="font-semibold">Pay at Cinema</div>
                                                <div className="text-sm text-gray-400">Pay when you arrive at the cinema</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Card Details (shown only for Stripe) */}
                                {selectedPaymentMethod === 'stripe' && (
                                    <div className="mb-8">
                                        <h3 className="text-xl font-semibold mb-4">Card Details</h3>
                                        {/* Stripe CardElement (handles card number/expiry/cvc securely) */}
                                        <div className="p-3 bg-gray-700 border border-gray-600 rounded-lg">
                                            <CardElement options={{ hidePostalCode: true }} />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">
                                            Your card details are securely processed by Stripe and never touch our servers.
                                        </p>
                                    </div>
                                )}

                                {selectedPaymentMethod === 'premises' && (
                                    <div className="mb-8 p-4 bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-lg">
                                        <div className="flex items-start">
                                            <AlertCircle className="w-5 h-5 mr-3 text-yellow-500 mt-0.5" />
                                            <div>
                                                <h4 className="font-semibold text-w mb-2">Pay at Cinema Instructions</h4>
                                                <p className="text-sm text-white">
                                                    Please arrive at least 30 minutes before showtime to complete your payment at the box office.
                                                    Bring a valid ID and your booking confirmation. Payment can be made via cash or card at the cinema.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:w-1/3">
                            <div className="bg-gray-800 rounded-xl p-6 sticky top-6">
                                <h3 className="text-xl font-bold mb-6">Order Summary</h3>

                                <div className="space-y-6">
                                    <div className="border-b border-gray-700 pb-4">
                                        <h4 className="font-semibold">{bookingData.movie?.title}</h4>
                                        <div className="text-gray-400 text-sm mt-2 space-y-1">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                {bookingData.date ? formatDate(bookingData.date) : ''}
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 mr-2" />
                                                {bookingData.time}
                                            </div>
                                            <div className="flex items-center">
                                                <MapPin className="w-4 h-4 mr-2" />
                                                {bookingData.cinema}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-b border-gray-700 pb-4">
                                        <h4 className="font-semibold mb-2">Selected Seats</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {bookingData.seats?.map(seat => (
                                                <div key={seat} className="px-3 py-1 rounded-full bg-yellow-500 bg-opacity-20 text-sm">
                                                    {seat}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-b border-gray-700 pb-4">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-gray-400">Tickets ({bookingData.seats?.length || 0})</span>
                                            <span>LKR {Math.max((bookingData.total || 0) - 500, 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-gray-400">Service Fee</span>
                                            <span>LKR 500</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>LKR {Number(bookingData.total || 0).toFixed(2)}</span>
                                    </div>

                                    <button
                                        onClick={handlePayment}
                                        disabled={!selectedPaymentMethod || isProcessing}
                                        className={`
                    w-full py-4 rounded-lg font-semibold text-lg mt-4
                    transition-all duration-200 flex items-center justify-center
                    ${selectedPaymentMethod && !isProcessing
                                            ? 'bg-yellow-500 text-black hover:bg-yellow-600'
                                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
                  `}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Ticket className="w-5 h-5 mr-2" />
                                                {selectedPaymentMethod === 'premises' ? 'Confirm Booking' : 'Complete Payment'}
                                            </>
                                        )}
                                    </button>

                                    {selectedPaymentMethod && (
                                        <div className="text-xs text-gray-400 text-center">
                                            {selectedPaymentMethod === 'stripe' && 'Secured by Stripe'}
                                            {selectedPaymentMethod === 'paypal' && 'Secured by PayPal'}
                                            {selectedPaymentMethod === 'premises' && 'Pay at cinema counter'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default PaymentPage;
