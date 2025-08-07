import {useMemo, useState} from "react";
import MovieCard from "../components/MovieCard.jsx";
import { Star, Calendar, Clock, Search, Filter, Grid, List, ChevronDown } from 'lucide-react';

const AllMoviePage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('All');
    const [selectedYear, setSelectedYear] = useState('All');
    const [selectedRating, setSelectedRating] = useState('All');
    const [sortBy, setSortBy] = useState('popularity');
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);

    // Sample movies data
    const movies = [
        {
            id: 1,
            title: "Quantum Nexus",
            poster: "https://images.unsplash.com/photo-1489599735946-22bb13d0d6f1?w=400&h=600&fit=crop",
            rating: 8.7,
            year: 2025,
            genre: ["Sci-Fi", "Thriller"],
            duration: 142,
            status: "now-showing",
            popularity: 95
        },
        {
            id: 2,
            title: "Shadow Protocol",
            poster: "https://images.unsplash.com/photo-1460881680858-30d872d5b530?w=400&h=600&fit=crop",
            rating: 8.2,
            year: 2025,
            genre: ["Action", "Thriller"],
            duration: 128,
            status: "now-showing",
            popularity: 88
        },
        {
            id: 3,
            title: "Mystic Gardens",
            poster: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop",
            rating: 7.9,
            year: 2025,
            genre: ["Fantasy", "Adventure"],
            duration: 135,
            status: "now-showing",
            popularity: 82
        },
        {
            id: 4,
            title: "Digital Dreams",
            poster: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop",
            rating: 8.5,
            year: 2025,
            genre: ["Sci-Fi", "Drama"],
            duration: 156,
            status: "now-showing",
            popularity: 91
        },
        {
            id: 5,
            title: "Ocean's Edge",
            poster: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=600&fit=crop",
            rating: 7.6,
            year: 2024,
            genre: ["Adventure", "Drama"],
            duration: 118,
            status: "now-showing",
            popularity: 75
        },
        {
            id: 6,
            title: "Neon Nights",
            poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop",
            rating: 8.1,
            year: 2024,
            genre: ["Crime", "Thriller"],
            duration: 145,
            status: "now-showing",
            popularity: 86
        },
        {
            id: 7,
            title: "Stellar Odyssey",
            poster: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=600&fit=crop",
            rating: 8.9,
            year: 2025,
            genre: ["Sci-Fi", "Adventure"],
            duration: 178,
            status: "coming-soon",
            popularity: 98
        },
        {
            id: 8,
            title: "The Last Kingdom",
            poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
            rating: 8.4,
            year: 2025,
            genre: ["Fantasy", "Action"],
            duration: 162,
            status: "coming-soon",
            popularity: 89
        },
        {
            id: 9,
            title: "Code Red",
            poster: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop",
            rating: 7.8,
            year: 2025,
            genre: ["Action", "Thriller"],
            duration: 134,
            status: "coming-soon",
            popularity: 81
        },
        {
            id: 10,
            title: "Midnight Express",
            poster: "https://images.unsplash.com/photo-1594736797933-d0601ba2fe65?w=400&h=600&fit=crop",
            rating: 8.0,
            year: 2024,
            genre: ["Mystery", "Drama"],
            duration: 127,
            status: "now-showing",
            popularity: 77
        },
        {
            id: 11,
            title: "Aurora Rising",
            poster: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=600&fit=crop",
            rating: 8.6,
            year: 2025,
            genre: ["Sci-Fi", "Adventure"],
            duration: 149,
            status: "coming-soon",
            popularity: 93
        },
        {
            id: 12,
            title: "Silent Echoes",
            poster: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop",
            rating: 7.7,
            year: 2024,
            genre: ["Horror", "Thriller"],
            duration: 112,
            status: "now-showing",
            popularity: 73
        },
        {
            id: 13,
            title: "Phoenix Protocol",
            poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
            rating: 8.3,
            year: 2024,
            genre: ["Action", "Sci-Fi"],
            duration: 141,
            status: "now-showing",
            popularity: 84
        },
        {
            id: 14,
            title: "Crimson Dawn",
            poster: "https://images.unsplash.com/photo-1489599735946-22bb13d0d6f1?w=400&h=600&fit=crop",
            rating: 7.5,
            year: 2023,
            genre: ["Drama", "Romance"],
            duration: 125,
            status: "now-showing",
            popularity: 69
        },
        {
            id: 15,
            title: "Thunder Valley",
            poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop",
            rating: 8.8,
            year: 2025,
            genre: ["Western", "Action"],
            duration: 158,
            status: "coming-soon",
            popularity: 96
        }
    ];

    const genres = ['All', ...new Set(movies.flatMap(movie => movie.genre))];
    const years = ['All', ...new Set(movies.map(movie => movie.year))].sort((a, b) => b - a);
    const ratings = ['All', '8.5+', '8.0+', '7.5+', '7.0+'];

    // Filter and sort movies
    const filteredAndSortedMovies = useMemo(() => {
        let filtered = movies.filter(movie => {
            const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                movie.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesGenre = selectedGenre === 'All' || movie.genre.includes(selectedGenre);
            const matchesYear = selectedYear === 'All' || movie.year === selectedYear;
            const matchesRating = selectedRating === 'All' ||
                (selectedRating === '8.5+' && movie.rating >= 8.5) ||
                (selectedRating === '8.0+' && movie.rating >= 8.0) ||
                (selectedRating === '7.5+' && movie.rating >= 7.5) ||
                (selectedRating === '7.0+' && movie.rating >= 7.0);

            return matchesSearch && matchesGenre && matchesYear && matchesRating;
        });

        // Sort movies
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'popularity':
                    return b.popularity - a.popularity;
                case 'rating':
                    return b.rating - a.rating;
                case 'year':
                    return b.year - a.year;
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'duration':
                    return b.duration - a.duration;
                default:
                    return 0;
            }
        });

        return filtered;
    }, [movies, searchQuery, selectedGenre, selectedYear, selectedRating, sortBy]);

    return (
        <div className="max-w-7xl mx-auto mt-10 mb-10">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">All Movies</h1>
                <p className="text-gray-400 text-lg">Discover your next favorite film</p>
            </div>

            {/* Search and Filters */}
            <div className="mb-8 space-y-6">
                {/* Search Bar */}
                <div className="relative max-w-2xl">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400"/>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 border border-gray-600 rounded-lg leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-white text-lg"
                        style={{backgroundColor: '#1E1E2F'}}
                        placeholder="Search movies by title or genre..."
                    />
                </div>

                {/* Filter Controls */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center px-4 py-2 rounded-lg border border-gray-600 hover:border-gray-400 transition-colors lg:hidden"
                        >
                            <Filter className="w-4 h-4 mr-2"/>
                            Filters
                            <ChevronDown
                                className={`w-4 h-4 ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`}/>
                        </button>

                        <div className={`flex flex-wrap gap-4 ${showFilters ? 'block' : 'hidden lg:flex'}`}>
                            <select
                                value={selectedGenre}
                                onChange={(e) => setSelectedGenre(e.target.value)}
                                className="px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                                style={{backgroundColor: '#1E1E2F'}}
                            >
                                {genres.map(genre => (
                                    <option key={genre} value={genre}>{genre === 'All' ? 'All Genres' : genre}</option>
                                ))}
                            </select>

                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value === 'All' ? 'All' : parseInt(e.target.value))}
                                className="px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                                style={{backgroundColor: '#1E1E2F'}}
                            >
                                {years.map(year => (
                                    <option key={year} value={year}>{year === 'All' ? 'All Years' : year}</option>
                                ))}
                            </select>

                            <select
                                value={selectedRating}
                                onChange={(e) => setSelectedRating(e.target.value)}
                                className="px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                                style={{backgroundColor: '#1E1E2F'}}
                            >
                                {ratings.map(rating => (
                                    <option key={rating}
                                            value={rating}>{rating === 'All' ? 'All Ratings' : rating}</option>
                                ))}
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                                style={{backgroundColor: '#1E1E2F'}}
                            >
                                <option value="popularity">Sort by Popularity</option>
                                <option value="rating">Sort by Rating</option>
                                <option value="year">Sort by Year</option>
                                <option value="title">Sort by Title</option>
                                <option value="duration">Sort by Duration</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-colors ${
                                viewMode === 'grid'
                                    ? 'bg-red-600 text-white'
                                    : 'border border-gray-600 hover:border-gray-400'
                            }`}
                        >
                            <Grid className="w-5 h-5"/>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-red-600 text-white'
                                    : 'border border-gray-600 hover:border-gray-400'
                            }`}
                        >
                            <List className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="mb-6">
                <p className="text-gray-400">
                    Showing {filteredAndSortedMovies.length} of {movies.length} movies
                </p>
            </div>

            {/* Movies Grid/List */}
            {filteredAndSortedMovies.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">🎬</div>
                    <h3 className="text-2xl font-semibold mb-2">No movies found</h3>
                    <p className="text-gray-400">Try adjusting your search criteria or filters</p>
                </div>
            ) : (
                <div className={
                    viewMode === 'grid'
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2"
                        : "space-y-6"
                }>
                    {filteredAndSortedMovies.map((movie) => (
                        <MovieCard
                            key={movie.id}
                            movie={movie}
                            isListView={viewMode === 'list'}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default AllMoviePage;