// Chart Component (Simple bar representation)
import StatsCard from "../../components/admin/StatsCard.jsx";
import {useEffect, useMemo, useState} from "react";
import {DollarSign, Film, Ticket, Users,User,Calendar,Clock,Eye,CalendarClock,Building2,Play,Star,User as UserIcon} from "lucide-react";
import {getAdminDashboard} from "../../utils/api.js";

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
const RecentActivity = ({ activities = [] }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'booking': return <Ticket className="w-4 h-4 text-emerald-400" />;
            case 'movie':   return <Film className="w-4 h-4 text-blue-400" />;
            case 'user':    return <UserIcon className="w-4 h-4 text-purple-400" />;
            case 'showtime':return <Calendar className="w-4 h-4 text-orange-400" />;
            default:        return <Clock className="w-4 h-4 text-white/60" />;
        }
    };

    const timeAgo = (date) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins} min ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs} hour${hrs>1?'s':''} ago`;
        const days = Math.floor(hrs / 24);
        return `${days} day${days>1?'s':''} ago`;
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
                            <p className="text-white/60 text-xs mt-1">{timeAgo(activity.at)}</p>
                        </div>
                    </div>
                ))}
                {activities.length === 0 && (
                    <div className="text-white/60 text-sm">No recent activity.</div>
                )}
            </div>
        </div>
    );
};


// Top Movies Component
const TopMovies = ({ movies = [] }) => {
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
                                    <span className="text-white/60 text-sm">{movie.rating ?? "—"}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-white font-semibold">
                                {Intl.NumberFormat().format(Math.round(movie.revenue))} LKR
                            </p>
                            <p className="text-emerald-400 text-sm">Revenue</p>
                        </div>
                    </div>
                ))}
                {movies.length === 0 && (
                    <div className="text-white/60 text-sm">No data yet.</div>
                )}
            </div>
        </div>
    );
};

// Main Dashboard Component
const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);
    const [data, setData] = useState({
        stats: { totalRevenue: 0, totalBookings: 0, totalUsers: 0, totalMovies: 0 },
        dailyBookings: [],
        topMovies: [],
        activities: [],
    });

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await getAdminDashboard();
                setData(res.data);
            } catch (e) {
                setErr(e?.response?.data?.message || e.message);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const statsData = useMemo(() => ([
        {
            title: "Total Revenue",
            value: Intl.NumberFormat().format(Math.round(data.stats.totalRevenue)) + "",
            change: "", icon: DollarSign, trend: 'up'
        },
        { title: "Total Bookings", value: String(data.stats.totalBookings), change: "", icon: Ticket, trend: 'up' },
        { title: "Total Users",    value: String(data.stats.totalUsers),    change: "", icon: Users,  trend: 'up' },
        { title: "Total Movies",   value: String(data.stats.totalMovies),   change: "", icon: Film,   trend: 'up' },
    ]), [data]);

    if (loading) return <div className="text-white/80">Loading dashboard…</div>;
    if (err)     return <div className="text-red-400">Failed to load: {err}</div>;

    return (
        <>
            {/* Welcome Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome back, Admin</h2>
                <p className="text-white/60">Here’s what’s happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {statsData.map((stat, idx) => <StatsCard key={idx} {...stat} />)}
            </div>

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                <SimpleChart data={data.dailyBookings} title="Daily Bookings (Last 7 Days)" />
                <RecentActivity activities={data.activities} />
            </div>

            {/* Top Movies + Quick Actions */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                <TopMovies movies={data.topMovies} />

                <div className="bg-[#181818] border border-white/5 rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <a className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-left" href="/admin/movies">
                            <Film className="w-6 h-6 text-emerald-400 mb-2" />
                            <p className="text-white font-medium">Add Movie</p>
                            <p className="text-white/60 text-sm">Create new movie listing</p>
                        </a>
                        <a className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-left" href="/admin/showtimes">
                            <CalendarClock className="w-6 h-6 text-blue-400 mb-2" />
                            <p className="text-white font-medium">Schedule Show</p>
                            <p className="text-white/60 text-sm">Add new showtime</p>
                        </a>
                        <a className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-left" href="/admin/theater">
                            <Building2 className="w-6 h-6 text-purple-400 mb-2" />
                            <p className="text-white font-medium">Manage Theaters</p>
                            <p className="text-white/60 text-sm">Update theater info</p>
                        </a>
                        <a className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-left" href="/admin/users">
                            <User className="w-6 h-6 text-orange-400 mb-2" />
                            <p className="text-white font-medium">View Users</p>
                            <p className="text-white/60 text-sm">Get All Users</p>
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;