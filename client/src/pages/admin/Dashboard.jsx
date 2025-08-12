// Chart Component (Simple bar representation)
import StatsCard from "../../components/admin/StatsCard.jsx";
import {useState} from "react";
import {DollarSign, Film, Ticket, Users,User,Calendar,Clock,Eye,CalendarClock,Building2,Play,Star} from "lucide-react";

const SimpleChart = ({ data, title }) => {
    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <div className="bg-[#181818] border border-white/5 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">{title}</h3>
            <div className="space-y-3">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <span className="text-white/60 text-sm w-12">{item.label}</span>
                        <div className="flex-1 bg-white/5 rounded-full h-2">
                            <div
                                className="h-2 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                                style={{ width: `${(item.value / maxValue) * 100}%` }}
                            />
                        </div>
                        <span className="text-white text-sm font-medium w-8">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Recent Activity Component
const RecentActivity = () => {
    const activities = [
        { id: 1, type: "booking", user: "John Doe", action: "booked tickets for Avengers", time: "2 min ago" },
        { id: 2, type: "movie", user: "Admin", action: "added new movie 'Spider-Man'", time: "1 hour ago" },
        { id: 3, type: "user", user: "Jane Smith", action: "created new account", time: "2 hours ago" },
        { id: 4, type: "showtime", user: "Admin", action: "updated showtimes for Theater 1", time: "3 hours ago" },
    ];

    const getIcon = (type) => {
        switch (type) {
            case 'booking': return <Ticket className="w-4 h-4 text-emerald-400" />;
            case 'movie': return <Film className="w-4 h-4 text-blue-400" />;
            case 'user': return <User className="w-4 h-4 text-purple-400" />;
            case 'showtime': return <Calendar className="w-4 h-4 text-orange-400" />;
            default: return <Clock className="w-4 h-4 text-white/60" />;
        }
    };

    return (
        <div className="bg-[#181818] border border-white/5 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                        <div className="p-2 bg-white/5 rounded-lg">
                            {getIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                            <p className="text-white text-sm">
                                <span className="font-medium">{activity.user}</span> {activity.action}
                            </p>
                            <p className="text-white/60 text-xs mt-1">{activity.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Top Movies Component
const TopMovies = () => {
    const movies = [
        { id: 1, title: "Avengers: Endgame", bookings: 1250, rating: 4.8, revenue: "$125,000" },
        { id: 2, title: "Spider-Man: No Way Home", bookings: 980, rating: 4.7, revenue: "$98,000" },
        { id: 3, title: "The Batman", bookings: 756, rating: 4.5, revenue: "$75,600" },
        { id: 4, title: "Top Gun: Maverick", bookings: 642, rating: 4.6, revenue: "$64,200" },
    ];

    return (
        <div className="bg-[#181818] border border-white/5 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Top Performing Movies</h3>
            <div className="space-y-4">
                {movies.map((movie) => (
                    <div key={movie.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                        <div className="w-12 h-16 bg-white/10 rounded-lg flex items-center justify-center">
                            <Play className="w-5 h-5 text-white/60" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-white font-medium">{movie.title}</h4>
                            <div className="flex items-center gap-4 mt-1">
                                <span className="text-white/60 text-sm">{movie.bookings} bookings</span>
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="text-white/60 text-sm">{movie.rating}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-white font-semibold">{movie.revenue}</p>
                            <p className="text-emerald-400 text-sm">Revenue</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Main Dashboard Component
const AdminDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const statsData = [
        { title: "Total Revenue", value: "$48,592", change: "+12.5%", icon: DollarSign, trend: 'up' },
        { title: "Total Bookings", value: "2,847", change: "+8.2%", icon: Ticket, trend: 'up' },
        { title: "Active Users", value: "1,249", change: "+15.3%", icon: Users, trend: 'up' },
        { title: "Total Movies", value: "156", change: "+5.1%", icon: Film, trend: 'up' },
    ];

    const chartData = [
        { label: "Mon", value: 45 },
        { label: "Tue", value: 67 },
        { label: "Wed", value: 89 },
        { label: "Thu", value: 56 },
        { label: "Fri", value: 123 },
        { label: "Sat", value: 134 },
        { label: "Sun", value: 98 },
    ];

    return (
        <>
            {/* Welcome Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome back, Admin</h2>
                <p className="text-white/60">Here's what's happening with CineFlexx today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {statsData.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <SimpleChart data={chartData} title="Daily Bookings This Week" />
                <RecentActivity />
            </div>

            {/* Top Movies */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <TopMovies />

                {/* Quick Actions */}
                <div className="bg-[#181818] border border-white/5 rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-left">
                            <Film className="w-6 h-6 text-emerald-400 mb-2" />
                            <p className="text-white font-medium">Add Movie</p>
                            <p className="text-white/60 text-sm">Create new movie listing</p>
                        </button>
                        <button className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-left">
                            <CalendarClock className="w-6 h-6 text-blue-400 mb-2" />
                            <p className="text-white font-medium">Schedule Show</p>
                            <p className="text-white/60 text-sm">Add new showtime</p>
                        </button>
                        <button className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-left">
                            <Building2 className="w-6 h-6 text-purple-400 mb-2" />
                            <p className="text-white font-medium">Manage Theaters</p>
                            <p className="text-white/60 text-sm">Update theater info</p>
                        </button>
                        <button className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-left">
                            <Eye className="w-6 h-6 text-orange-400 mb-2" />
                            <p className="text-white font-medium">View Reports</p>
                            <p className="text-white/60 text-sm">Analytics & insights</p>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;