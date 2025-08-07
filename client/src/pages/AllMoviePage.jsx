import {useEffect, useMemo, useState} from "react";
import MovieCard from "../components/MovieCard.jsx";
import { Star, Calendar, Clock, Search, Filter, Grid, List, ChevronDown } from 'lucide-react';
import {getAllMovies} from "../utils/api.js";

const AllMoviePage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('All');
    const [selectedYear, setSelectedYear] = useState('All');
    const [selectedRating, setSelectedRating] = useState('All');
    const [sortBy, setSortBy] = useState('popularity');
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [movies,setMovies] = useState([]);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const res = await getAllMovies();
                setMovies(res.data);
            } catch (error) {
                console.error("Failed to fetch movies", error);
            }
        };

        fetchMovies();
    }, []);


    const genres = useMemo(() => ['All', ...new Set(movies.flatMap(movie => movie.genre || []))], [movies]);
    const years = useMemo(() => ['All', ...new Set(movies.map(movie => movie.year))].sort((a, b) => b - a), [movies]);
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