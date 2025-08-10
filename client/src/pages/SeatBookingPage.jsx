// src/pages/SeatBookingPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Ticket,Calendar,Clock,MapPin } from 'lucide-react';
import {getAllSeatForShowTime} from "../utils/api.js";

const SeatBookingPage = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { showtimeId, price,movie, date, cinema, time} = location.state || {};
    console.log(showtimeId);

    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [rows, setRows] = useState(8);
    const [cols, setCols] = useState(12);

    const [bookedCodes, setBookedCodes] = useState(new Set());
    const [loadingBooked, setLoadingBooked] = useState(false);

    // Redirect if no booking info
    useEffect(() => {
        if (!movie || !date || !cinema || !time) {
            navigate('/');
        }
    }, [movie, date, cinema, time, navigate]);

    useEffect(() => {
        if (!showtimeId) return;

        let isMounted = true;
        setLoadingBooked(true);
        getAllSeatForShowTime(showtimeId)
            .then(({ data }) => {
                // backend returns { codes: ["A1","B2",...], seats: [{row,number,code}] }
                const codes =
                    data?.codes ??
                    (Array.isArray(data?.seats)
                        ? data.seats.map(s => s.code || `${s.row}${s.number}`)
                        : []);
                if (isMounted) setBookedCodes(new Set(codes));
            })
            .catch(err => {
                console.error('Failed to load booked seats', err);
                if (isMounted) setBookedCodes(new Set());
            })
            .finally(() => isMounted && setLoadingBooked(false));

        return () => { isMounted = false; };
    }, [showtimeId]);

    useEffect(() => {
        const rowNames = ['A','B','C','D','E','F','G','H'];

        const grid = rowNames.slice(0, rows).map(r =>
            Array.from({ length: cols }, (_, c) => {
                const code = `${r}${c + 1}`;
                const isBooked = bookedCodes.has(code);
                return {
                    id: code,
                    row: r,
                    number: c + 1,
                    status: isBooked ? 'booked' : 'available',
                    isSelected: false,
                };
            })
        );

        setSeats(grid);
        setSelectedSeats([]); // clear selections if layout or bookings changed
    }, [rows, cols, bookedCodes]);

    const handleSeatClick = (rowIndex, colIndex) => {
        const seat = seats[rowIndex][colIndex];
        if (seat.status !== 'available') return; // can't select booked

        const newSeats = seats.map((row, r) =>
            row.map((s, c) =>
                r === rowIndex && c === colIndex ? { ...s, isSelected: !s.isSelected } : s
            )
        );
        setSeats(newSeats);

        // use the seat code for selected list
        const code = seat.id; // e.g., "A7"
        setSelectedSeats(prev =>
            !seat.isSelected ? [...prev, code] : prev.filter(id => id !== code)
        );
    };

    const getSeatColor = (status, isSelected) => {
        if (isSelected) return 'bg-yellow-500 border-yellow-500';
        if (status === 'booked') return 'bg-red-500 border-red-500 cursor-not-allowed';
        return 'bg-gray-800 border-gray-600 hover:border-yellow-500';
    };

    const getSeatLabel = (rowIndex, colIndex) => {
        if (colIndex === 0) return `${seats[rowIndex][colIndex].row}`;
        return '';
    };

    const calculateTotal = () => {
        return selectedSeats.length * 15; // $15 per seat
    };

    const handleProceedToPayment = () => {
        navigate('/payment', {
            state: {
                movie,
                date,
                cinema,
                time,
                seats: selectedSeats,
                total: calculateTotal() + 2.50
            }
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-400 hover:text-white mb-8"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Movie
                </button>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Theater Layout */}
                    <div className="flex-1">
                        <div className="bg-gray-800 p-6 rounded-xl mb-8">
                            <h2 className="text-3xl font-bold mb-2">{movie.title}</h2>
                            <div className="flex flex-wrap items-center gap-4 mb-6 text-gray-300">
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span>{formatDate(date)}</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2" />
                                    <span>{time}</span>
                                </div>
                                <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    <span>{cinema}</span>
                                </div>
                            </div>

                            <div className="text-center mb-10">
                                <div className="w-full h-4 bg-gradient-to-b from-yellow-500 to-transparent rounded-t-lg opacity-50"></div>
                                <div className="text-gray-400 font-medium mt-2">SCREEN</div>
                            </div>

                            {loadingBooked && (
                                <div className="text-center text-gray-400 mb-4">Loading booked seats…</div>
                            )}

                            <div className="space-y-4">
                                {seats.map((row, rowIndex) => (
                                    <div key={rowIndex} className="flex items-center gap-4">
                                        <div className="w-8 text-center font-medium text-gray-400">
                                            {getSeatLabel(rowIndex, 0)}
                                        </div>

                                        <div className="flex gap-2 flex-wrap">
                                            {row.map((seat, colIndex) => (
                                                <button
                                                    key={`${rowIndex}-${colIndex}`}
                                                    onClick={() => handleSeatClick(rowIndex, colIndex)}
                                                    disabled={seat.status === 'booked'}
                                                    className={`
                            w-10 h-10 flex items-center justify-center rounded
                            border-2 transition-colors
                            ${getSeatColor(seat.status, seat.isSelected)}
                          `}
                                                >
                                                    {colIndex + 1}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="w-8 text-center font-medium text-gray-400">
                                            {getSeatLabel(rowIndex, 0)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 flex flex-wrap justify-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-gray-800 border-2 border-gray-600 rounded"></div>
                                    <span className="text-gray-400">Available</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-yellow-500 border-yellow-500 rounded"></div>
                                    <span className="text-gray-400">Selected</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-red-500 border-red-500 rounded"></div>
                                    <span className="text-gray-400">Booked</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Summary */}
                    <div className="lg:w-1/3">
                        <div className="bg-gray-800 rounded-xl p-6 sticky top-6">
                            <h3 className="text-xl font-bold mb-6">Booking Summary</h3>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                                    <div>
                                        <h4 className="font-semibold">{movie.title}</h4>
                                        <p className="text-gray-400 text-sm">
                                            {formatDate(date)} | {time}
                                        </p>
                                        <p className="text-gray-400 text-sm">{cinema}</p>
                                    </div>
                                    <div className="text-yellow-500 font-medium">$15.00</div>
                                </div>

                                <div className="border-b border-gray-700 pb-4">
                                    <h4 className="font-semibold mb-2">Selected Seats</h4>
                                    {selectedSeats.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedSeats.map(code => (
                                                <div key={code} className="px-3 py-1 rounded-full bg-yellow-500 bg-opacity-20 text-sm">
                                                    {code}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-400">Select seats to continue</p>
                                    )}
                                </div>

                                <div className="border-b border-gray-700 pb-4">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-gray-400">Tickets ({selectedSeats.length})</span>
                                        <span>${selectedSeats.length * 15}.00</span>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-gray-400">Service Fee</span>
                                        <span>$2.50</span>
                                    </div>
                                </div>

                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>${(selectedSeats.length * 15 + 2.5).toFixed(2)}</span>
                                </div>

                                <button
                                    onClick={handleProceedToPayment}
                                    disabled={selectedSeats.length === 0}
                                    className={`
                    w-full py-4 rounded-lg font-semibold text-lg mt-4
                    transition-all duration-200 flex items-center justify-center
                    ${selectedSeats.length > 0
                                        ? 'bg-yellow-500 text-black hover:bg-yellow-600'
                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
                  `}
                                >
                                    <Ticket className="w-5 h-5 mr-2" />
                                    Proceed to Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SeatBookingPage;