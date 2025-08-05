import React, { useState } from 'react';
import {
    Star,
    Calendar,
    Clock,
    Play,
    Heart,
    Share2,
    Users,
    Film,
    MapPin,
    ChevronDown,
    ChevronUp,
    Menu,
    X,
    ArrowLeft
} from 'lucide-react';

const MoviePage = () => {
    const [selectedDate, setSelectedDate] = useState('2025-08-06');
    const [selectedCinema, setSelectedCinema] = useState('Grand Cinema Downtown');
    const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);
    const [showFullCast, setShowFullCast] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);

    // Movie data
    const movie = {
        id: 1,
        title: "Quantum Nexus",
        tagline: "Reality is just the beginning",
        description: "When reality itself becomes unstable, a quantum physicist must navigate parallel dimensions to save humanity from an interdimensional collapse that threatens all existence. Dr. Sarah Chen discovers that her groundbreaking research has torn holes in the fabric of spacetime, allowing dangerous entities from alternate realities to seep into our world.",
        fullDescription: "As Sarah races against time to repair the quantum rifts, she must confront versions of herself from different timelines, each with their own agenda. With the help of a mysterious interdimensional traveler and her brilliant research team, she embarks on a mind-bending journey through parallel worlds where the laws of physics bend to the will of consciousness itself. The fate of not just our reality, but all possible realities, hangs in the balance.",
        poster: "https://images.unsplash.com/photo-1489599735946-22bb13d0d6f1?w=800&h=1200&fit=crop",
        backdrop: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1920&h=1080&fit=crop",
        rating: 8.7,
        duration: 142,
        releaseDate: "2025-08-01",
        genre: ["Sci-Fi", "Thriller", "Action"],
        director: "Alex Rodriguez",
        writers: ["Sarah Kim", "Michael Chen"],
        language: "English",
        country: "USA",
        budget: "$85M",
        boxOffice: "$324M",
        certification: "PG-13"
    };

    const cast = [
        { name: "Emma Stone", character: "Dr. Sarah Chen", image: "https://images.unsplash.com/photo-1494790108755-2616c047938e?w=200&h=200&fit=crop&crop=face" },
        { name: "Oscar Isaac", character: "Marcus Vale", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face" },
        { name: "Lupita Nyong'o", character: "Dr. Zara Okafor", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face" },
        { name: "Dev Patel", character: "Kai Nakamura", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face" },
        { name: "Tilda Swinton", character: "The Architect", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face" },
        { name: "John Boyega", character: "Agent Torres", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face" }
    ];

    const showtimes = {
        "2025-08-06": {
            "Grand Cinema Downtown": ["10:30 AM", "1:45 PM", "4:15 PM", "7:30 PM", "10:45 PM"],
            "Multiplex North": ["11:00 AM", "2:15 PM", "5:30 PM", "8:45 PM"],
            "Cinema Park West": ["12:00 PM", "3:30 PM", "6:45 PM", "9:15 PM"]
        },
        "2025-08-07": {
            "Grand Cinema Downtown": ["10:30 AM", "1:45 PM", "4:15 PM", "7:30 PM", "10:45 PM"],
            "Multiplex North": ["11:00 AM", "2:15 PM", "5:30 PM", "8:45 PM"],
            "Cinema Park West": ["12:00 PM", "3:30 PM", "6:45 PM", "9:15 PM"]
        },
        "2025-08-08": {
            "Grand Cinema Downtown": ["10:30 AM", "1:45 PM", "4:15 PM", "7:30 PM", "10:45 PM"],
            "Multiplex North": ["11:00 AM", "2:15 PM", "5:30 PM", "8:45 PM"],
            "Cinema Park West": ["12:00 PM", "3:30 PM", "6:45 PM", "9:15 PM"]
        }
    };

    const reviews = [
        { user: "MovieBuff2025", rating: 9, comment: "Mind-bending masterpiece! The visual effects are absolutely stunning and the story keeps you guessing until the very end." },
        { user: "CinemaLover", rating: 8, comment: "Emma Stone delivers an incredible performance. The quantum physics concepts are explained beautifully without dumbing down." },
        { user: "SciFiFan", rating: 9, comment: "Best sci-fi film of the year! The parallel dimension scenes are breathtaking and the ending is perfect." }
    ];

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    return (
        <>
            {/* Hero Section */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10"></div>
                <img
                    src={movie.backdrop}
                    alt={movie.title}
                    className="w-full h-96 md:h-[600px] object-cover"
                />

                <div className="absolute inset-0 z-20 flex items-end">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
                        <div className="flex flex-col lg:flex-row items-start lg:items-end gap-8">
                            <div className="flex-shrink-0">
                                <img
                                    src={movie.poster}
                                    alt={movie.title}
                                    className="w-48 md:w-64 rounded-xl shadow-2xl"
                                />
                            </div>

                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                    {movie.genre.map((g, idx) => (
                                        <span key={idx} className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#EF233C' }}>
                      {g}
                    </span>
                                    ))}
                                    <span className="px-3 py-1 rounded-full text-sm font-medium border border-gray-600">
                    {movie.certification}
                  </span>
                                </div>

                                <h1 className="text-4xl md:text-6xl font-bold mb-2">{movie.title}</h1>
                                <p className="text-xl text-gray-300 mb-4 italic">{movie.tagline}</p>

                                <div className="flex flex-wrap items-center gap-6 mb-6 text-gray-300">
                                    <div className="flex items-center">
                                        <Star className="w-5 h-5 mr-2" style={{ color: '#FFD700' }} fill="currentColor" />
                                        <span className="text-xl font-semibold text-white">{movie.rating}</span>
                                        <span className="ml-1">/10</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="w-5 h-5 mr-2" />
                                        <span>{formatDuration(movie.duration)}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="w-5 h-5 mr-2" />
                                        <span>{new Date(movie.releaseDate).getFullYear()}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button className="px-8 py-4 rounded-lg font-semibold text-black text-lg hover:scale-105 transform transition-all duration-200 shadow-lg flex items-center justify-center" style={{ backgroundColor: '#FFD700' }}>
                                        <Film className="w-5 h-5 mr-2" />
                                        Book Tickets
                                    </button>
                                    <button
                                        onClick={() => setIsTrailerPlaying(true)}
                                        className="px-8 py-4 rounded-lg font-semibold text-white text-lg border-2 border-white hover:bg-white hover:text-black transition-all duration-200 flex items-center justify-center"
                                    >
                                        <Play className="w-5 h-5 mr-2" />
                                        Watch Trailer
                                    </button>
                                    <button
                                        onClick={() => setIsFavorited(!isFavorited)}
                                        className="p-4 rounded-lg border-2 border-gray-600 hover:border-red-500 transition-colors"
                                    >
                                        <Heart className={`w-6 h-6 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                                    </button>
                                    <button className="p-4 rounded-lg border-2 border-gray-600 hover:border-gray-400 transition-colors">
                                        <Share2 className="w-6 h-6 text-gray-400" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column - Movie Details */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Plot */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Plot</h2>
                            <p className="text-gray-300 leading-relaxed mb-4">{movie.description}</p>
                            <p className="text-gray-300 leading-relaxed">{movie.fullDescription}</p>
                        </section>

                        {/* Cast */}
                        <section>
                            <h2 className="text-2xl font-bold mb-6">Cast</h2>
                            <div className={`grid grid-cols-2 md:grid-cols-3 gap-6 ${!showFullCast ? 'max-h-96 overflow-hidden' : ''}`}>
                                {cast.slice(0, showFullCast ? cast.length : 6).map((actor, idx) => (
                                    <div key={idx} className="text-center">
                                        <img
                                            src={actor.image}
                                            alt={actor.name}
                                            className="w-24 h-24 rounded-full mx-auto mb-3 object-cover"
                                        />
                                        <h3 className="font-semibold text-white">{actor.name}</h3>
                                        <p className="text-sm text-gray-400">{actor.character}</p>
                                    </div>
                                ))}
                            </div>
                            {cast.length > 6 && (
                                <button
                                    onClick={() => setShowFullCast(!showFullCast)}
                                    className="mt-6 flex items-center mx-auto px-6 py-3 rounded-lg border border-gray-600 hover:border-gray-400 transition-colors"
                                >
                                    {showFullCast ? (
                                        <>Show Less <ChevronUp className="w-4 h-4 ml-2" /></>
                                    ) : (
                                        <>Show All Cast <ChevronDown className="w-4 h-4 ml-2" /></>
                                    )}
                                </button>
                            )}
                        </section>

                        {/* Reviews */}
                        <section>
                            <h2 className="text-2xl font-bold mb-6">User Reviews</h2>
                            <div className="space-y-6">
                                {reviews.map((review, idx) => (
                                    <div key={idx} className="p-6 rounded-xl" style={{ backgroundColor: '#1E1E2F' }}>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold">{review.user}</h3>
                                            <div className="flex items-center">
                                                <Star className="w-4 h-4 mr-1" style={{ color: '#FFD700' }} fill="currentColor" />
                                                <span>{review.rating}/10</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-300">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Booking & Info */}
                    <div className="space-y-8">
                        {/* Movie Info */}
                        <div className="p-6 rounded-xl" style={{ backgroundColor: '#1E1E2F' }}>
                            <h3 className="text-xl font-bold mb-6">Movie Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-gray-400">Director:</span>
                                    <span className="ml-2 text-white">{movie.director}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Writers:</span>
                                    <span className="ml-2 text-white">{movie.writers.join(', ')}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Language:</span>
                                    <span className="ml-2 text-white">{movie.language}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Country:</span>
                                    <span className="ml-2 text-white">{movie.country}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Budget:</span>
                                    <span className="ml-2 text-white">{movie.budget}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Box Office:</span>
                                    <span className="ml-2 text-white">{movie.boxOffice}</span>
                                </div>
                            </div>
                        </div>

                        {/* Showtimes */}
                        <div className="p-6 rounded-xl" style={{ backgroundColor: '#1E1E2F' }}>
                            <h3 className="text-xl font-bold mb-6">Showtimes</h3>

                            {/* Date Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Select Date</label>
                                <select
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                                    style={{ backgroundColor: '#121212' }}
                                >
                                    {Object.keys(showtimes).map(date => (
                                        <option key={date} value={date}>{formatDate(date)}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Cinema Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Select Cinema</label>
                                <select
                                    value={selectedCinema}
                                    onChange={(e) => setSelectedCinema(e.target.value)}
                                    className="w-full p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                                    style={{ backgroundColor: '#121212' }}
                                >
                                    {Object.keys(showtimes[selectedDate] || {}).map(cinema => (
                                        <option key={cinema} value={cinema}>{cinema}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Showtimes Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {(showtimes[selectedDate]?.[selectedCinema] || []).map((time, idx) => (
                                    <button
                                        key={idx}
                                        className="p-3 rounded-lg border border-gray-600 hover:border-yellow-500 hover:bg-yellow-500 hover:text-black transition-all duration-200 text-center font-medium"
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>

                            <button className="w-full mt-6 py-4 rounded-lg font-semibold text-black text-lg hover:scale-105 transform transition-all duration-200" style={{ backgroundColor: '#FFD700' }}>
                                Continue to Seat Selection
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trailer Modal */}
            {isTrailerPlaying && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
                    <div className="relative w-full max-w-4xl aspect-video">
                        <button
                            onClick={() => setIsTrailerPlaying(false)}
                            className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors"
                        >
                            <X size={32} />
                        </button>
                        <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                                <Play className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-400">Trailer would play here</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MoviePage;