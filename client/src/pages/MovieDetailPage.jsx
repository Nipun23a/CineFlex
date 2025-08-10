import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Clock, Calendar, Film, Play, Heart, Share2, ChevronUp, ChevronDown, X } from "lucide-react";
import {getShowTimeByMovie} from "../utils/api.js";
import {findTmdbMovieId, getTmdbCast, getTmdbReviews} from "../utils/tmdb.js";

const MoviePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [movie, setMovie] = useState(null);
    const [showtimesData, setShowtimesData] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedCinema, setSelectedCinema] = useState('');
    const [selectedTime, setSelectedTime] = useState(null);

    const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);
    const [showFullCast, setShowFullCast] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [tmdbCast, setTmdbCast] = useState([]);
    const [tmdbReviews,setTmdbReviews] = useState([]);
    const [tmdbLoading,setTmdbLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getShowTimeByMovie(id);
                const data = response.data;

                if (Array.isArray(data) && data.length > 0) {
                    setMovie(data[0].movie);
                    setShowtimesData(data);

                    const defaultDate = new Date(data[0].date).toISOString().split("T")[0];
                    const defaultCinema = data[0].theater?.name ?? '';
                    setSelectedDate(defaultDate);
                    setSelectedCinema(defaultCinema);
                }
            } catch (error) {
                console.error("Failed to fetch showtimes", error);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        const hydrateTmdb = async () => {
            if (!movie?.title) return;
            setTmdbLoading(true);
            try {
                const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : undefined;
                const tmdbId = await findTmdbMovieId(movie.title, year);
                if (!tmdbId) {
                    setTmdbCast([]);
                    setTmdbReviews([]);
                    return;
                }
                const [cast, reviews] = await Promise.all([
                    getTmdbCast(tmdbId, { limit: 18 }),
                    getTmdbReviews(tmdbId),
                ]);
                setTmdbCast(cast);
                setTmdbReviews(reviews);
            } catch (e) {
                console.error("TMDB fetch failed", e);
            } finally {
                setTmdbLoading(false);
            }
        };
        hydrateTmdb();
    }, [movie]);


    const handleShowtimeClick = () => {
        if (!selectedTime) {
            alert("Please select a showtime first");
            return;
        }

        navigate("/seat-booking", {
            state: {
                movie,
                date: selectedDate,
                cinema: selectedCinema,
                time: selectedTime,
            },
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };

    const formatDuration = (minutes) => {
        if (!minutes && minutes !== 0) return "—";
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const getYouTubeId = (url) => {
        if (!url) return null;
        try {
            const u = new URL(url);
            if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
            if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
            return null;
        } catch {
            return null;
        }
    };

    const groupedShowtimes = showtimesData.reduce((acc, st) => {
        const date = new Date(st.date).toISOString().split("T")[0];
        if (!acc[date]) acc[date] = {};
        const name = st.theater?.name ?? "Unknown Theater";
        if (!acc[date][name]) acc[date][name] = [];
        acc[date][name].push(st.startTime);
        return acc;
    }, {});

    const showtimes = groupedShowtimes;

    if (!movie) {
        return (
            <div className="text-white flex justify-center items-center min-h-screen">
                <p className="text-lg">Loading movie information...</p>
            </div>
        );
    }

    const heroUrl = movie.backdropUrl || movie.posterUrl || "";
    const ytId = getYouTubeId(movie.trailerUrl);

    return (
        <>
            {/* Hero Section */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10"></div>
                <img
                    src={heroUrl}
                    alt={movie.title}
                    className="w-full h-96 md:h-[600px] object-cover"
                />

                <div className="absolute inset-0 z-20 flex items-end">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
                        <div className="flex flex-col lg:flex-row items-start lg:items-end gap-8">
                            <div className="flex-shrink-0">
                                <img
                                    src={movie.posterUrl}
                                    alt={movie.title}
                                    className="w-48 md:w-64 rounded-xl shadow-2xl"
                                />
                            </div>

                            <div className="flex-1">
                                {/* Genres & Cert (cert optional) */}
                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                    {(movie.genre ?? []).map((g, idx) => (
                                        <span key={idx} className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#EF233C' }}>
                      {g}
                    </span>
                                    ))}
                                </div>

                                <h1 className="text-4xl md:text-6xl font-bold mb-2">{movie.title}</h1>

                                <div className="flex flex-wrap items-center gap-6 mb-6 text-gray-300">
                                    {!!movie.rating && (
                                        <div className="flex items-center">
                                            <Star className="w-5 h-5 mr-2" style={{ color: '#FFD700' }} fill="currentColor" />
                                            <span className="text-xl font-semibold text-white">{movie.rating}</span>
                                            <span className="ml-1">/10</span>
                                        </div>
                                    )}

                                    {!!movie.duration && (
                                        <div className="flex items-center">
                                            <Clock className="w-5 h-5 mr-2" />
                                            <span>{formatDuration(movie.duration)}</span>
                                        </div>
                                    )}

                                    {!!movie.releaseDate && (
                                        <div className="flex items-center">
                                            <Calendar className="w-5 h-5 mr-2" />
                                            <span>{new Date(movie.releaseDate).getFullYear()}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <a
                                        href="#showtimes"
                                        className="px-8 py-4 rounded-lg font-semibold text-black text-lg hover:scale-105 transform transition-all duration-200 shadow-lg flex items-center justify-center"
                                        style={{ backgroundColor: '#FFD700' }}
                                    >
                                        <Film className="w-5 h-5 mr-2" />
                                        Book Tickets
                                    </a>

                                    {ytId && (
                                        <button
                                            onClick={() => setIsTrailerPlaying(true)}
                                            className="px-8 py-4 rounded-lg font-semibold text-white text-lg border-2 border-white hover:bg-white hover:text-black transition-all duration-200 flex items-center justify-center"
                                        >
                                            <Play className="w-5 h-5 mr-2" />
                                            Watch Trailer
                                        </button>
                                    )}

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
                            <p className="text-gray-300 leading-relaxed">{movie.description || "No description available."}</p>
                        </section>

                        {/* Cast (static demo as before) */}
                        <section>
                            <h2 className="text-2xl font-bold mb-6">Cast</h2>
                            {tmdbLoading && <p className="text-gray-400">Loading cast…</p>}

                            {!tmdbLoading && (
                                <>
                                    <div
                                        className={`grid grid-cols-2 md:grid-cols-3 gap-6 ${!showFullCast ? 'max-h-96 overflow-hidden' : ''}`}>
                                        {(tmdbCast.length ? tmdbCast : []).slice(0, showFullCast ? tmdbCast.length : 6).map(actor => (
                                            <div key={actor.id} className="text-center">
                                                {actor.imageUrl ? (
                                                    <img
                                                        src={actor.imageUrl}
                                                        alt={actor.name}
                                                        className="w-24 h-24 rounded-full mx-auto mb-3 object-cover"
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-24 h-24 rounded-full mx-auto mb-3 bg-gray-700 flex items-center justify-center">
                                                        <span
                                                            className="text-white text-lg">{actor.name?.[0] ?? "?"}</span>
                                                    </div>
                                                )}
                                                <h3 className="font-semibold text-white">{actor.name}</h3>
                                                {actor.character &&
                                                    <p className="text-sm text-gray-400">{actor.character}</p>}
                                            </div>
                                        ))}
                                    </div>

                                    {tmdbCast.length > 6 && (
                                        <button
                                            onClick={() => setShowFullCast(!showFullCast)}
                                            className="mt-6 flex items-center mx-auto px-6 py-3 rounded-lg border border-gray-600 hover:border-gray-400 transition-colors"
                                        >
                                            {showFullCast ? (
                                                <>Show Less <ChevronUp className="w-4 h-4 ml-2"/></>
                                            ) : (
                                                <>Show All Cast <ChevronDown className="w-4 h-4 ml-2"/></>
                                            )}
                                        </button>
                                    )}

                                    {!tmdbCast.length && <p className="text-gray-400">No cast found.</p>}
                                </>
                            )}
                        </section>


                        {/* Reviews (static demo) */}
                        <section>
                            <h2 className="text-2xl font-bold mb-6">User Reviews</h2>
                            {tmdbLoading && <p className="text-gray-400">Loading reviews…</p>}

                            {!tmdbLoading && (tmdbReviews.length ? (
                                <div className="space-y-6">
                                    {tmdbReviews.map(r => (
                                        <div key={r.id} className="p-6 rounded-xl" style={{backgroundColor: '#1E1E2F'}}>
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 className="font-semibold">{r.author || "Anonymous"}</h3>
                                                    {r.createdAt && (
                                                        <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                                                    )}
                                                </div>
                                                {r.rating !== null && r.rating !== undefined && (
                                                    <div className="flex items-center">
                                                        <Star className="w-4 h-4 mr-1" style={{color: '#FFD700'}}
                                                              fill="currentColor"/>
                                                        <span>{r.rating}/10</span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-gray-300 whitespace-pre-wrap">
                                                {r.content.length > 600 ? r.content.slice(0, 600) + "…" : r.content}
                                            </p>
                                            {r.url && (
                                                <a
                                                    href={r.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-block mt-3 text-sm text-yellow-400 hover:underline"
                                                >
                                                    Read full review on TMDB
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400">No reviews found.</p>
                            ))}
                        </section>

                    </div>

                    {/* Right Column - Booking & Info */}
                    <div className="space-y-8">
                        {/* Movie Info (only existing fields) */}
                        <div className="p-6 rounded-xl" style={{backgroundColor: '#1E1E2F'}}>
                            <h3 className="text-xl font-bold mb-6">Movie Information</h3>
                            <div className="space-y-4">
                                {(movie.genre?.length > 0) && (
                                    <div>
                                        <span className="text-gray-400">Genres:</span>
                                        <span className="ml-2 text-white">{movie.genre.join(', ')}</span>
                                    </div>
                                )}
                                {movie.language && (
                                    <div>
                                        <span className="text-gray-400">Language:</span>
                                        <span className="ml-2 text-white">{movie.language}</span>
                                    </div>
                                )}
                                {!!movie.duration && (
                                    <div>
                                        <span className="text-gray-400">Duration:</span>
                                        <span className="ml-2 text-white">{formatDuration(movie.duration)}</span>
                                    </div>
                                )}
                                {!!movie.releaseDate && (
                                    <div>
                                        <span className="text-gray-400">Release:</span>
                                        <span className="ml-2 text-white">
                      {new Date(movie.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                                    </div>
                                )}
                                {!!movie.rating && (
                                    <div>
                                        <span className="text-gray-400">Rating:</span>
                                        <span className="ml-2 text-white">{movie.rating}/10</span>
                                    </div>
                                )}
                                {movie.createdAt && (
                                    <div>
                                        <span className="text-gray-400">Added:</span>
                                        <span className="ml-2 text-white">
                      {new Date(movie.createdAt).toLocaleDateString('en-US')}
                    </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Showtimes */}
                        <div id="showtimes" className="p-6 rounded-xl" style={{ backgroundColor: '#1E1E2F' }}>
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
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Select Time</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {(showtimes[selectedDate]?.[selectedCinema] || []).map((time, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedTime(time)}
                                            className={`p-3 rounded-lg border text-center font-medium transition-all duration-200 ${
                                                selectedTime === time
                                                    ? 'bg-yellow-500 border-yellow-500 text-black'
                                                    : 'border-gray-600 hover:border-yellow-500'
                                            }`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleShowtimeClick}
                                disabled={!selectedTime}
                                className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
                                    selectedTime
                                        ? 'bg-yellow-500 text-black hover:scale-[1.02] hover:bg-yellow-600'
                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                Continue to Seat Selection
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trailer Modal */}
            {isTrailerPlaying && ytId && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
                    <div className="relative w-full max-w-4xl aspect-video">
                        <button
                            onClick={() => setIsTrailerPlaying(false)}
                            className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors"
                        >
                            <X size={32} />
                        </button>
                        <iframe
                            className="w-full h-full rounded-lg"
                            src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                            title="Trailer"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}
        </>
    );
};


export default MoviePage;