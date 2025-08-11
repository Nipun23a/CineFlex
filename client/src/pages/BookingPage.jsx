import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Ticket, Star, Filter, Search, Eye, X, CreditCard, Download, Mail } from 'lucide-react';

const BookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Mock booking data - replace with actual API call
    const mockBookings = [
        {
            id: 'BK001',
            movie: {
                title: 'Spider-Man: No Way Home',
                poster: 'https://via.placeholder.com/100x150/1a1a1a/yellow?text=Movie',
                rating: 8.4,
                genre: 'Action, Adventure',
                duration: '148 mins',
                language: 'English',
                format: 'IMAX 3D'
            },
            cinema: 'CineMax Downtown',
            cinemaAddress: '123 Main Street, Downtown, City 12345',
            screen: 'Screen 3',
            date: '2024-12-15',
            time: '7:30 PM',
            seats: ['A7', 'A8'],
            total: 32.50,
            ticketPrice: 15.00,
            serviceFee: 2.50,
            status: 'confirmed',
            paymentMethod: 'stripe',
            transactionId: 'stripe_1234567',
            bookedAt: '2024-12-10T10:30:00Z',
            customerInfo: {
                name: 'John Doe',
                email: 'john.doe@email.com',
                phone: '+1 (555) 123-4567'
            },
            qrCode: 'https://via.placeholder.com/150x150/000000/ffffff?text=QR+CODE',
            bookingCode: 'SPIDERMAN001'
        },
        {
            id: 'BK002',
            movie: {
                title: 'Dune: Part Two',
                poster: 'https://via.placeholder.com/100x150/1a1a1a/yellow?text=Movie',
                rating: 8.8,
                genre: 'Sci-Fi, Adventure',
                duration: '166 mins',
                language: 'English',
                format: 'Dolby Atmos'
            },
            cinema: 'Starlight Cinema',
            cinemaAddress: '456 Oak Avenue, Midtown, City 54321',
            screen: 'Screen 1',
            date: '2024-12-20',
            time: '9:00 PM',
            seats: ['B5', 'B6', 'B7'],
            total: 47.50,
            ticketPrice: 15.00,
            serviceFee: 2.50,
            status: 'confirmed',
            paymentMethod: 'paypal',
            transactionId: 'paypal_7890123',
            bookedAt: '2024-12-08T15:45:00Z',
            customerInfo: {
                name: 'John Doe',
                email: 'john.doe@email.com',
                phone: '+1 (555) 123-4567'
            },
            qrCode: 'https://via.placeholder.com/150x150/000000/ffffff?text=QR+CODE',
            bookingCode: 'DUNE002'
        },
        {
            id: 'BK003',
            movie: {
                title: 'Oppenheimer',
                poster: 'https://via.placeholder.com/100x150/1a1a1a/yellow?text=Movie',
                rating: 8.6,
                genre: 'Biography, Drama',
                duration: '180 mins',
                language: 'English',
                format: '70mm IMAX'
            },
            cinema: 'Grand Theater',
            cinemaAddress: '789 Park Lane, Uptown, City 67890',
            screen: 'Screen 5',
            date: '2024-12-05',
            time: '6:00 PM',
            seats: ['C10', 'C11'],
            total: 32.50,
            ticketPrice: 15.00,
            serviceFee: 2.50,
            status: 'completed',
            paymentMethod: 'premises',
            transactionId: 'premises_4567890',
            bookedAt: '2024-12-01T12:20:00Z',
            customerInfo: {
                name: 'John Doe',
                email: 'john.doe@email.com',
                phone: '+1 (555) 123-4567'
            },
            qrCode: 'https://via.placeholder.com/150x150/000000/ffffff?text=QR+CODE',
            bookingCode: 'OPPN003'
        },
        {
            id: 'BK004',
            movie: {
                title: 'Avatar: The Way of Water',
                poster: 'https://via.placeholder.com/100x150/1a1a1a/yellow?text=Movie',
                rating: 7.9,
                genre: 'Action, Adventure',
                duration: '192 mins',
                language: 'English',
                format: '3D IMAX'
            },
            cinema: 'Mega Cineplex',
            cinemaAddress: '321 Broadway, Theater District, City 13579',
            screen: 'Screen 2',
            date: '2024-11-28',
            time: '8:30 PM',
            seats: ['D1', 'D2'],
            total: 32.50,
            ticketPrice: 15.00,
            serviceFee: 2.50,
            status: 'completed',
            paymentMethod: 'stripe',
            transactionId: 'stripe_9876543',
            bookedAt: '2024-11-25T09:15:00Z',
            customerInfo: {
                name: 'John Doe',
                email: 'john.doe@email.com',
                phone: '+1 (555) 123-4567'
            },
            qrCode: 'https://via.placeholder.com/150x150/000000/ffffff?text=QR+CODE',
            bookingCode: 'AVATAR004'
        },
        {
            id: 'BK005',
            movie: {
                title: 'The Batman',
                poster: 'https://via.placeholder.com/100x150/1a1a1a/yellow?text=Movie',
                rating: 8.2,
                genre: 'Action, Crime',
                duration: '176 mins',
                language: 'English',
                format: 'Standard 2D'
            },
            cinema: 'CineMax Downtown',
            cinemaAddress: '123 Main Street, Downtown, City 12345',
            screen: 'Screen 4',
            date: '2024-12-25',
            time: '10:00 PM',
            seats: ['F8', 'F9', 'F10', 'F11'],
            total: 62.50,
            ticketPrice: 15.00,
            serviceFee: 2.50,
            status: 'cancelled',
            paymentMethod: 'stripe',
            transactionId: 'stripe_1111111',
            bookedAt: '2024-12-12T14:10:00Z',
            customerInfo: {
                name: 'John Doe',
                email: 'john.doe@email.com',
                phone: '+1 (555) 123-4567'
            },
            qrCode: 'https://via.placeholder.com/150x150/000000/ffffff?text=QR+CODE',
            bookingCode: 'BATMAN005'
        }
    ];

    useEffect(() => {
        // Simulate API call
        const fetchBookings = async () => {
            setLoading(true);
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            setBookings(mockBookings);
            setFilteredBookings(mockBookings);
            setLoading(false);
        };

        fetchBookings();
    }, []);

    useEffect(() => {
        let filtered = bookings;

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(booking => booking.status === filterStatus);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(booking =>
                booking.movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.cinema.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredBookings(filtered);
    }, [bookings, filterStatus, searchTerm]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            confirmed: 'bg-green-500 bg-opacity-20 text-white border-green-500',
            completed: 'bg-blue-500 bg-opacity-20 text-white border-blue-500',
            cancelled: 'bg-red-500 bg-opacity-20 text-white border-red-500'
        };

        const statusLabels = {
            confirmed: 'Confirmed',
            completed: 'Completed',
            cancelled: 'Cancelled'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusStyles[status]}`}>
        {statusLabels[status]}
      </span>
        );
    };

    const getPaymentMethodLabel = (method) => {
        const labels = {
            stripe: 'Card',
            paypal: 'PayPal',
            premises: 'Pay at Cinema'
        };
        return labels[method] || method;
    };

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedBooking(null);
    };

    const handleDownloadTicket = () => {
        // In your actual app, this would generate/download the ticket
        alert('Downloading ticket...');
    };

    const handleResendEmail = () => {
        // In your actual app, this would resend the confirmation email
        alert('Confirmation email sent!');
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
                            {searchTerm || filterStatus !== 'all'
                                ? 'Try adjusting your search or filter criteria.'
                                : 'You haven\'t made any bookings yet.'}
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
                                                        Seats: {booking.seats.join(', ')}
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
                                            Booked on {new Date(booking.bookedAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination could go here if needed */}
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
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Movie Info Section */}
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
                                        <p><span className="text-gray-400">Format:</span> {selectedBooking.movie.format}</p>
                                    </div>
                                    <div className="mt-4">
                                        {getStatusBadge(selectedBooking.status)}
                                    </div>
                                </div>
                            </div>

                            {/* Booking Information Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* Show Details */}
                                <div className="bg-gray-700 rounded-lg p-4">
                                    <h4 className="font-semibold mb-3 flex items-center">
                                        <Calendar className="w-5 h-5 mr-2 text-yellow-500" />
                                        Show Details
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
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Screen:</span>
                                            <span>{selectedBooking.screen}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Cinema Details */}
                                <div className="bg-gray-700 rounded-lg p-4">
                                    <h4 className="font-semibold mb-3 flex items-center">
                                        <MapPin className="w-5 h-5 mr-2 text-yellow-500" />
                                        Cinema Details
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <div className="font-medium">{selectedBooking.cinema}</div>
                                            <div className="text-gray-400 text-xs">{selectedBooking.cinemaAddress}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Seat Information */}
                                <div className="bg-gray-700 rounded-lg p-4">
                                    <h4 className="font-semibold mb-3 flex items-center">
                                        <Ticket className="w-5 h-5 mr-2 text-yellow-500" />
                                        Seat Information
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Seats:</span>
                                            <span>{selectedBooking.seats.join(', ')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Quantity:</span>
                                            <span>{selectedBooking.seats.length} ticket(s)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Information */}
                                <div className="bg-gray-700 rounded-lg p-4">
                                    <h4 className="font-semibold mb-3 flex items-center">
                                        <CreditCard className="w-5 h-5 mr-2 text-yellow-500" />
                                        Payment Information
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Method:</span>
                                            <span>{getPaymentMethodLabel(selectedBooking.paymentMethod)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Transaction ID:</span>
                                            <span className="font-mono text-xs">{selectedBooking.transactionId}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="bg-gray-700 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold mb-3">Price Breakdown</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Tickets ({selectedBooking.seats.length}x):</span>
                                        <span>${(selectedBooking.ticketPrice * selectedBooking.seats.length).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Service Fee:</span>
                                        <span>${selectedBooking.serviceFee.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-gray-600 pt-2 mt-2">
                                        <div className="flex justify-between font-semibold text-lg">
                                            <span>Total:</span>
                                            <span className="text-yellow-500">${selectedBooking.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Information */}
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

                            {/* QR Code and Actions */}
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                {/* QR Code */}
                                <div className="text-center">
                                    <img
                                        src={selectedBooking.qrCode}
                                        alt="QR Code"
                                        className="w-32 h-32 mx-auto mb-2"
                                    />
                                    <p className="text-xs text-gray-400">Scan at cinema entrance</p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex-1 space-y-3">
                                    <button
                                        onClick={handleDownloadTicket}
                                        className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black py-3 px-4 rounded-lg font-semibold transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download Ticket
                                    </button>
                                    <button
                                        onClick={handleResendEmail}
                                        className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-500 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                                    >
                                        <Mail className="w-4 h-4" />
                                        Resend Confirmation
                                    </button>
                                </div>
                            </div>

                            {/* Booking Timestamp */}
                            <div className="mt-6 pt-4 border-t border-gray-700 text-center">
                                <p className="text-xs text-gray-500">
                                    Booked on {new Date(selectedBooking.bookedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
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