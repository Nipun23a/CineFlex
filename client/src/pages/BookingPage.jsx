import React, { useState, useEffect, useMemo } from "react";
import { Calendar, Clock, MapPin, Ticket, Star, Filter, Search, Eye, X, CreditCard, Download, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { getBookingById, getBookingByUser } from "../utils/api.js";

// Map backend paymentStatus -> your UI status
const mapStatus = (paymentStatus) => {
    if (paymentStatus === "paid") return "completed";
    if (paymentStatus === "failed") return "cancelled";
    return "confirmed"; // pending
};
const toSeatCode = (x) => {
    if (!x) return null;
    if (typeof x === "string") {
        const m = x.toUpperCase().match(/^([A-Z]+)\s*-?\s*(\d+)$/);
        return m ? `${m[1]}${m[2]}` : null;
    }
    if (Array.isArray(x)) return null; // handled by walker
    if (typeof x === "object" && x.row != null && x.number != null) {
        return `${String(x.row).toUpperCase()}${x.number}`;
    }
    return null;
};

const flattenSeatCodes = (seats) => {
    if (!Array.isArray(seats)) return [];
    const out = [];
    const walk = (arr) => {
        arr.forEach((el) => {
            if (Array.isArray(el)) walk(el);
            else {
                const code = toSeatCode(el);
                if (code) out.push(code);
            }
        });
    };
    walk(seats);
    return out;
};


// Format booking from backend into the UI shape you already use
const mapBookingFromApi = (b) => {
    const st = b?.showtime || {};
    const mv = st?.movie || b?.movie || {};
    const th = b?.theater || st?.theater || {};

    const seatsCodes = flattenSeatCodes(b?.seats);
    const status =
        b?.paymentStatus === "paid" ? "completed" :
            b?.paymentStatus === "failed" ? "cancelled" :
                "confirmed"; // pending => confirmed

    return {
        id: String(b._id || b.id || ""),
        movie: {
            title: mv.title || "Untitled",
            poster: mv.posterUrl || "https://via.placeholder.com/100x150/1a1a1a/yellow?text=Movie",
            rating: mv.rating ?? "—",
            genre: Array.isArray(mv.genre) ? mv.genre.join(", ") : (mv.genre || "—"),
            duration: mv.duration ? `${mv.duration} mins` : "—",
            language: mv.language || "—",
            format: st.format || "—",
        },
        cinema: th?.name || "—",
        cinemaAddress: th?.location || "—",
        date: st?.date,
        time: st?.startTime || "—",
        seats: seatsCodes,
        total: Number(b?.totalPrice || 0),
        status,
        paymentMethod: b?.paymentMethod || "stripe",
        // REMOVE transactionId
        // transactionId: b?.transactionId,

        bookedAt: b?.createdAt,
        customerInfo: {
            name: b?.customer_name || b?.user?.name || "—",
            email: b?.customer_email || b?.user?.email || "—",
            phone: b?.customer_phone || "—",
        },
        qrCodeData: b?.code || String(b?._id || "").slice(-8).toUpperCase(), // booking code used for QR
        bookingCode: b?.code || String(b?._id || "").slice(-8).toUpperCase(),
    };
};

const BookingsPage = () => {
    const { user } = useAuth();
    const userId = user?._id || user?.id;

    const [bookings, setBookings] = useState([]);
    const [qrDataUrl, setQrDataUrl] = useState(null);

    const [filteredBookings, setFilteredBookings] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Fetch bookings for the logged-in user
    useEffect(() => {
        let mounted = true;
        const fetchBookings = async () => {
            if (!userId) return;
            setLoading(true);
            try {
                const res = await getBookingByUser(userId);
                const list = Array.isArray(res.data) ? res.data : res.data?.bookings || res.data || [];
                const mapped = list.map(mapBookingFromApi);
                if (mounted) {
                    setBookings(mapped);
                    setFilteredBookings(mapped);
                }
            } catch (e) {
                console.error(e);
                if (mounted) {
                    setBookings([]);
                    setFilteredBookings([]);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchBookings();
        return () => { mounted = false; };
    }, [userId]);

    // Filter + search
    useEffect(() => {
        let filtered = bookings;
        if (filterStatus !== "all") {
            filtered = filtered.filter((b) => b.status === filterStatus);
        }
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (b) =>
                    b.movie.title.toLowerCase().includes(q) ||
                    (b.cinema || "").toLowerCase().includes(q) ||
                    (b.id || "").toLowerCase().includes(q)
            );
        }
        setFilteredBookings(filtered);
    }, [bookings, filterStatus, searchTerm]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return "—";
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            confirmed: "bg-green-500 bg-opacity-20 text-white border-green-500",
            completed: "bg-blue-500 bg-opacity-20 text-white border-blue-500",
            cancelled: "bg-red-500 bg-opacity-20 text-white border-red-500",
        };
        const statusLabels = {
            confirmed: "Confirmed",
            completed: "Completed",
            cancelled: "Cancelled",
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusStyles[status]}`}>
        {statusLabels[status]}
      </span>
        );
    };

    const getPaymentMethodLabel = (method) => {
        const labels = { stripe: "Card", paypal: "PayPal", premises: "Pay at Cinema" };
        return labels[method] || method || "—";
    };

    const handleViewDetails = async (booking) => {
        try {
            const { data } = await getBookingById(booking.id); // optional refetch
            const mapped = mapBookingFromApi(data || booking);
            setSelectedBooking(mapped);
            // Generate QR from bookingCode (or qrCodeData)
            const url = await QRCode.toDataURL(mapped.bookingCode, { width: 256, margin: 1 });
            setQrDataUrl(url);
            setShowModal(true);
        } catch {
            const mapped = mapBookingFromApi(booking);
            setSelectedBooking(mapped);
            const url = await QRCode.toDataURL(mapped.bookingCode, { width: 256, margin: 1 });
            setQrDataUrl(url);
            setShowModal(true);
        }
    };


    const closeModal = () => {
        setShowModal(false);
        setSelectedBooking(null);
    };

    const handleDownloadTicket = async () => {
        if (!selectedBooking) return;

        // make sure we have a QR image
        let qr = qrDataUrl;
        if (!qr) {
            qr = await QRCode.toDataURL(selectedBooking.bookingCode, { width: 300, margin: 1 });
            setQrDataUrl(qr);
        }

        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const pad = 32;
        let y = pad;

        // Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("CineFlexx Ticket", pad, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        y += 22;
        doc.text(`Booking Code: ${selectedBooking.bookingCode}`, pad, y);
        y += 18;
        doc.text(`Booked on: ${new Date(selectedBooking.bookedAt).toLocaleString()}`, pad, y);

        // Divider
        y += 16;
        doc.setDrawColor(200, 200, 200);
        doc.line(pad, y, 595 - pad, y);
        y += 24;

        // Movie & show info
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(selectedBooking.movie.title, pad, y);
        y += 18;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Cinema: ${selectedBooking.cinema}`, pad, y); y += 16;
        doc.text(`Address: ${selectedBooking.cinemaAddress}`, pad, y); y += 16;
        doc.text(`Date: ${new Date(selectedBooking.date).toLocaleDateString()}`, pad, y); y += 16;
        doc.text(`Time: ${selectedBooking.time}`, pad, y); y += 16;

        // Seats & price
        const seatsLine = selectedBooking.seats.join(", ");
        doc.text(`Seats: ${seatsLine}`, pad, y); y += 16;
        doc.text(`Total: $${Number(selectedBooking.total || 0).toFixed(2)}`, pad, y); y += 24;

        // Customer
        doc.setFont("helvetica", "bold");
        doc.text("Customer", pad, y);
        doc.setFont("helvetica", "normal");
        y += 18;
        doc.text(`Name: ${selectedBooking.customerInfo.name}`, pad, y); y += 16;
        doc.text(`Email: ${selectedBooking.customerInfo.email}`, pad, y); y += 16;
        doc.text(`Phone: ${selectedBooking.customerInfo.phone}`, pad, y); y += 24;

        // QR on the right
        const qrSize = 140;
        const qrX = 595 - pad - qrSize; // right side
        const qrY = 140;
        doc.addImage(qr, "PNG", qrX, qrY, qrSize, qrSize);

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text("Please present this ticket and QR code at the cinema entrance.", pad, 812 - pad);

        doc.save(`ticket-${selectedBooking.bookingCode}.pdf`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading your bookings...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">My Bookings</h1>
                    <p className="text-gray-400">View and manage all your movie ticket bookings</p>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-gray-800 rounded-xl p-6 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by movie, cinema, or booking ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-yellow-500 focus:outline-none"
                            />
                        </div>

                        {/* Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:border-yellow-500 focus:outline-none"
                            >
                                <option value="all">All Bookings</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Bookings List */}
                {filteredBookings.length === 0 ? (
                    <div className="text-center py-16">
                        <Ticket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
                        <p className="text-gray-400">
                            {searchTerm || filterStatus !== "all"
                                ? "Try adjusting your search or filter criteria."
                                : "You haven't made any bookings yet."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredBookings.map((booking) => (
                            <div key={booking.id} className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-750 transition-colors">
                                <div className="p-6">
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* Movie Poster and Basic Info */}
                                        <div className="flex gap-4 flex-shrink-0">
                                            <img
                                                src={booking.movie.poster}
                                                alt={booking.movie.title}
                                                className="w-24 h-36 object-cover rounded-lg"
                                            />
                                            <div className="flex flex-col justify-between">
                                                <div>
                                                    <h3 className="text-xl font-bold mb-1">{booking.movie.title}</h3>
                                                    <p className="text-gray-400 text-sm mb-2">{booking.movie.genre}</p>
                                                    <div className="flex items-center gap-2">
                                                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                        <span className="text-yellow-500 font-semibold">{booking.movie.rating}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {getStatusBadge(booking.status)}
                                                    <span className="text-xs text-gray-500">#{booking.id}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Booking Details */}
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {/* Date & Time */}
                                            <div className="space-y-2">
                                                <div className="flex items-center text-gray-400">
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    <span className="text-sm">Date & Time</span>
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{formatDate(booking.date)}</div>
                                                    <div className="text-sm text-gray-400">{booking.time}</div>
                                                </div>
                                            </div>

                                            {/* Cinema & Seats */}
                                            <div className="space-y-2">
                                                <div className="flex items-center text-gray-400">
                                                    <MapPin className="w-4 h-4 mr-2" />
                                                    <span className="text-sm">Cinema & Seats</span>
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{booking.cinema}</div>
                                                    <div className="text-sm text-gray-400">
                                                        Seats: {booking.seats.join(", ")}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Payment Info */}
                                            <div className="space-y-2">
                                                <div className="flex items-center text-gray-400">
                                                    <Ticket className="w-4 h-4 mr-2" />
                                                    <span className="text-sm">Payment</span>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-yellow-500">
                                                        ${booking.total.toFixed(2)}
                                                    </div>
                                                    <div className="text-sm text-gray-400">
                                                        {getPaymentMethodLabel(booking.paymentMethod)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex-shrink-0 flex items-center">
                                            <button
                                                onClick={() => handleViewDetails(booking)}
                                                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View Details
                                            </button>
                                        </div>
                                    </div>

                                    {/* Booking Date */}
                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                        <p className="text-xs text-gray-500">
                                            Booked on {new Date(booking.bookedAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination note */}
                {filteredBookings.length > 0 && (
                    <div className="mt-8 text-center">
                        <p className="text-gray-400">
                            Showing {filteredBookings.length} of {bookings.length} bookings
                        </p>
                    </div>
                )}
            </div>

            {/* Booking Details Modal */}
            {showModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-700">
                            <h2 className="text-2xl font-bold">Booking Details</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Movie Info */}
                            <div className="flex gap-6 mb-8">
                                <img
                                    src={selectedBooking.movie.poster}
                                    alt={selectedBooking.movie.title}
                                    className="w-32 h-48 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold mb-2">{selectedBooking.movie.title}</h3>
                                    <div className="space-y-2 text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                            <span className="text-yellow-500 font-semibold">{selectedBooking.movie.rating}</span>
                                            <span className="text-gray-400">• {selectedBooking.movie.genre}</span>
                                        </div>
                                        <p><span className="text-gray-400">Duration:</span> {selectedBooking.movie.duration}</p>
                                        <p><span className="text-gray-400">Language:</span> {selectedBooking.movie.language}</p>
                                    </div>
                                    <div className="mt-4">{getStatusBadge(selectedBooking.status)}</div>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-gray-700 rounded-lg p-4">
                                    <h4 className="font-semibold mb-3 flex items-center">
                                        <Calendar className="w-5 h-5 mr-2 text-yellow-500" /> Show Details
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Date:</span>
                                            <span>{formatDate(selectedBooking.date)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Time:</span>
                                            <span>{selectedBooking.time}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-700 rounded-lg p-4">
                                    <h4 className="font-semibold mb-3 flex items-center">
                                        <MapPin className="w-5 h-5 mr-2 text-yellow-500" /> Cinema Details
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <div className="font-medium">{selectedBooking.cinema}</div>
                                            <div className="text-gray-400 text-xs">{selectedBooking.cinemaAddress}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-700 rounded-lg p-4">
                                    <h4 className="font-semibold mb-3 flex items-center">
                                        <Ticket className="w-5 h-5 mr-2 text-yellow-500" /> Seat Information
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Seats:</span>
                                            <span>{selectedBooking.seats.join(", ")}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Quantity:</span>
                                            <span>{selectedBooking.seats.length} ticket(s)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-700 rounded-lg p-4">
                                    <h4 className="font-semibold mb-3 flex items-center">
                                        <CreditCard className="w-5 h-5 mr-2 text-yellow-500" /> Payment Information
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Method:</span>
                                            <span>{getPaymentMethodLabel(selectedBooking.paymentMethod)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Price breakdown (optional if you store per-ticket price/fee) */}
                            <div className="bg-gray-700 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold mb-3">Total</h4>
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Total:</span>
                                    <span className="text-yellow-500">${Number(selectedBooking.total || 0).toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-gray-700 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold mb-3">Customer Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-400">Name:</span>
                                        <div className="font-medium">{selectedBooking.customerInfo.name}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Email:</span>
                                        <div className="font-medium">{selectedBooking.customerInfo.email}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Phone:</span>
                                        <div className="font-medium">{selectedBooking.customerInfo.phone}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Booking Code:</span>
                                        <div className="font-mono font-medium text-yellow-500">{selectedBooking.bookingCode}</div>
                                    </div>
                                </div>
                            </div>

                            {/* QR + Actions */}
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="text-center">
                                    <img src={qrDataUrl || selectedBooking.qrCode} alt="QR Code"
                                         className="w-32 h-32 mx-auto mb-2"/>
                                    <p className="text-xs text-gray-400">Booking Code: {selectedBooking.bookingCode}</p>
                                </div>

                                <div className="flex-1 space-y-3">
                                    <button
                                        onClick={handleDownloadTicket}
                                        className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black py-3 px-4 rounded-lg font-semibold transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download Ticket
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-700 text-center">
                                <p className="text-xs text-gray-500">
                                    Booked on {new Date(selectedBooking.bookedAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingsPage;
