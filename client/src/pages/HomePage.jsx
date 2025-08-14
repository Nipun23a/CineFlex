import {useEffect, useState} from "react";
import {Search,Star,Play,ChevronLeft,ChevronRight,Calendar} from "lucide-react";
import {getAllMovies} from "../utils/api.js";
import {useNavigate} from "react-router-dom";

const HomePage = () => {
    const [searchQuery,setSearchQuery] = useState("");
    const [nowShowingIndex,setNowShowingIndex] = useState(0);
    const [movies,setMovies] = useState([]);
    const [featuredMovie,setFeaturedMovie] = useState([]);
    const [nowShowing,setNowShowing] = useState([]);
    const [comingSoon,setComingSoon] = useState([]);
    const navigate = useNavigate();

    const handleNavigate = (id) => {
        navigate(`/movies/${id}`); // 👈 You can change this to match your route pattern
    };


    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await getAllMovies();
                const allMovies = response.data;

                if (allMovies.length > 0){
                    setFeaturedMovie(allMovies[2]);
                }

                const today = new Date();
                const soon = allMovies.filter(movie=>new Date(movie.releaseDate) > today)

                const showing = allMovies.filter(movie => !movie.releaseDate || new Date(movie.releaseDate) <= today);

                setNowShowing(showing);
                setComingSoon(soon);
                setMovies(allMovies);
            }catch (error){
                console.error('Failed to load movies:',error);
            }
        };
        fetchMovies();
    }, []);

    const scrollNowShowing = (direction) => {
        const maxIndex = nowShowing.length - 3;
        if (direction === 'left') {
            setNowShowingIndex(Math.max(0, nowShowingIndex - 1));
        } else {
            setNowShowingIndex(Math.min(maxIndex, nowShowingIndex + 1));
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };


    return(
        <>
            {/* Search Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="relative max-w-2xl mx-auto">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                        style={{ backgroundColor: '#1E1E2F' }}
                        placeholder="Search movies by title or genre..."
                    />
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative max-w-7xl mx-auto sm:px-6 lg:px-8 mb-16">
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10"></div>
                    <img
                        src={featuredMovie.posterUrl}
                        alt={featuredMovie.title}
                        className="w-full h-96 md:h-[500px] object-cover"
                    />
                    <div className="absolute inset-0 z-20 flex items-center">
                        <div className="max-w-2xl ml-8 md:ml-16">
                            <div className="flex items-center mb-4">
                                <Star className="w-5 h-5 mr-2" style={{ color: '#FFD700' }} fill="currentColor" />
                                <span className="text-lg font-semibold">{featuredMovie.rating}/10</span>
                                {featuredMovie.genre?.map((g, index) => (
                                    <span
                                        key={index}
                                        className="ml-2 px-3 py-1 rounded-full text-sm text-white"
                                        style={{ backgroundColor: '#EF233C' }}
                                    >
                                        {g}
                                    </span>
                                ))}

                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold mb-4">{featuredMovie.title}</h1>
                            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
                                {featuredMovie.description}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button className="px-8 py-4 rounded-lg font-semibold text-black text-lg hover:scale-105 transform transition-all duration-200 shadow-lg flex items-center justify-center" style={{ backgroundColor: '#FFD700' }}>
                                    <Play className="w-5 h-5 mr-2" fill="currentColor" />
                                    Book Now
                                </button>
                                <button className="px-8 py-4 rounded-lg font-semibold text-white text-lg border-2 border-white hover:bg-white hover:text-black transition-all duration-200">
                                    Watch Trailer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Now Showing Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold">Now Showing</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => scrollNowShowing('left')}
                            className="p-2 rounded-full border border-gray-600 hover:border-red-500 transition-colors"
                            style={{ backgroundColor: '#1E1E2F' }}
                            disabled={nowShowingIndex === 0}
                        >
                            <ChevronLeft className={`w-5 h-5 ${nowShowingIndex === 0 ? 'text-gray-600' : 'text-white'}`} />
                        </button>
                        <button
                            onClick={() => scrollNowShowing('right')}
                            className="p-2 rounded-full border border-gray-600 hover:border-red-500 transition-colors"
                            style={{ backgroundColor: '#1E1E2F' }}
                            disabled={nowShowingIndex >= nowShowing.length - 3}
                        >
                            <ChevronRight className={`w-5 h-5 ${nowShowingIndex >= nowShowing.length - 3 ? 'text-gray-600' : 'text-white'}`} />
                        </button>
                    </div>
                </div>

                {nowShowing.length === 0 ? (
                    <div className="text-center text-gray-400 py-12 text-lg">🎬 Oops! No movies are currently showing. Check back later!</div>
                ) : (
                    <div className="overflow-hidden">
                        <div
                            className="flex transition-transform duration-300 ease-in-out gap-6"
                            style={{ transform: `translateX(-${nowShowingIndex * (100 / 3)}%)` }}
                        >
                            {nowShowing.map((movie) => (
                                <div key={movie._id} className="flex-none w-full sm:w-1/2 lg:w-1/3">
                                    <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer" style={{ backgroundColor: '#1E1E2F' }}>
                                        <div className="relative">
                                            <img src={movie.posterUrl} alt={movie.title} className="w-full h-80 object-cover" />
                                            <div className="absolute top-4 right-4 flex items-center px-2 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
                                                <Star className="w-4 h-4 mr-1" style={{ color: '#FFD700' }} fill="currentColor" />
                                                {movie.rating}
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-semibold mb-2">{movie.title}</h3>
                                            <p className="text-gray-400 mb-4">{movie.genre?.join(', ')}</p>
                                            <button
                                                onClick={() => handleNavigate(movie._id)}
                                                className="w-full py-3 rounded-lg font-semibold text-black hover:scale-105 transform transition-all duration-200"
                                                style={{backgroundColor: "#FFD700"}}
                                            >
                                                Book Tickets
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Coming Soon Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                <h2 className="text-3xl font-bold mb-8">Coming Soon</h2>
                {comingSoon.length === 0 ? (
                    <div className="text-center text-gray-400 py-12 text-lg">🚀 No upcoming releases yet. Come back soon for more exciting movies!</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {comingSoon.map((movie) => (
                            <div key={movie._id} className="rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer" style={{ backgroundColor: '#1E1E2F' }}>
                                <div className="relative">
                                    <img src={movie.posterUrl} alt={movie.title} className="w-full h-80 object-cover" />
                                    <div className="absolute top-4 left-4 flex items-center px-3 py-1 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: '#EF233C' }}>
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {formatDate(movie.releaseDate)}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-2">{movie.title}</h3>
                                    <p className="text-gray-400 mb-4">{movie.genre?.join(', ')}</p>
                                    <button className="w-full py-3 rounded-lg font-semibold text-white border-2 hover:scale-105 transform transition-all duration-200" style={{ borderColor: '#EF233C', color: '#EF233C' }}>
                                        Notify Me
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}
export default HomePage;