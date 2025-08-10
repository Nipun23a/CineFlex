import { Star, Calendar, Clock } from 'lucide-react';
import {useNavigate} from "react-router-dom";

const MovieCard = ({movie,isListView = false}) => {

    const navigate = useNavigate();
    const isReleased = movie.releaseDate ? new Date(movie.releaseDate) <= new Date() : true;

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const handleNavigate = () => {
        navigate(`/movies/${movie._id}`); // 👈 You can change this to match your route pattern
    };

    return (
        <div
            className="flex gap-6 p-6 rounded-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            style={{backgroundColor: '#1E1E2F'}}>
            <img src={movie.posterUrl} alt={movie.title} className="w-24 h-36 object-cover rounded-lg flex-shrink-0"/>
            <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-white">{movie.title}</h3>
                    <div className="flex items-center px-2 py-1 rounded-full text-sm font-semibold"
                         style={{backgroundColor: 'rgba(0, 0, 0, 0.8)'}}>
                        <Star className="w-4 h-4 mr-1" style={{color: '#FFD700'}} fill="currentColor"/>
                        {movie.rating}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                    {movie.genre.map((g, idx) => (
                        <span key={idx} className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{backgroundColor: '#EF233C', color: 'white'}}>
                  {g}
                </span>
                    ))}
                </div>
                <div className="flex items-center gap-4 text-gray-400 text-sm mb-4">
                    <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1"/>
                        {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'N/A'}
                    </div>
                    <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1"/>
                        {formatDuration(movie.duration)}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isReleased ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'
                    }`}>
                        {isReleased ? 'Now Showing' : 'Coming Soon'}
                    </span>
                </div>
                <button
                    onClick={handleNavigate}
                    className="px-6 py-2 rounded-lg font-semibold text-black hover:scale-105 transform transition-all duration-200"
                    style={{backgroundColor: '#FFD700'}}
                >
                    {isReleased ? 'Book Tickets' : 'Notify Me'}
                </button>
            </div>
        </div>
    )
}

export default MovieCard;