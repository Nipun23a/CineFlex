import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import User from "../models/User.js";
import Showtime from "../models/Showtime.js";

export const getDashboardOverview = async (req, res) => {
    try {
        // ----- Stats -----
        const [totalBookings, totalUsers, totalMovies, revenueAgg] = await Promise.all([
            Booking.countDocuments({}),                 // total bookings
            User.countDocuments({}),                    // total users
            Movie.countDocuments({}),                   // total movies
            Booking.aggregate([
                { $match: { paymentStatus: "paid" } },
                { $group: { _id: null, total: { $sum: "$totalPrice" } } },
            ]),
        ]);

        const totalRevenue = revenueAgg?.[0]?.total || 0;

        // ----- Daily bookings for last 7 days -----
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - 6);
        start.setHours(0, 0, 0, 0);

        const dailyAgg = await Booking.aggregate([
            { $match: { createdAt: { $gte: start } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    value: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Fill missing days + map to Mon..Sun
        const labels = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        const map = new Map(dailyAgg.map(d => [d._id, d.value]));
        const daily = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const key = d.toISOString().slice(0,10);
            daily.push({ label: labels[d.getDay()], value: map.get(key) || 0 });
        }

        // ----- Top Movies (by paid bookings/revenue) -----
        const topMovies = await Booking.aggregate([
            { $match: { paymentStatus: "paid" } },
            { $lookup: { from: "showtimes", localField: "showtime", foreignField: "_id", as: "st" } },
            { $unwind: "$st" },
            { $group: { _id: "$st.movie", bookings: { $sum: 1 }, revenue: { $sum: "$totalPrice" } } },
            { $lookup: { from: "movies", localField: "_id", foreignField: "_id", as: "movie" } },
            { $unwind: "$movie" },
            {
                $project: {
                    _id: 0,
                    id: "$movie._id",
                    title: "$movie.title",
                    rating: "$movie.rating",
                    bookings: 1,
                    revenue: 1,
                }
            },
            { $sort: { bookings: -1 } },
            { $limit: 5 },
        ]);

        // ----- Recent Activity (mixed feed) -----
        const [latestBookings, latestMovies, latestUsers, latestShowtimes] = await Promise.all([
            Booking.find({}).sort({ createdAt: -1 }).limit(5)
                .populate({ path: "showtime", populate: [{ path: "movie", select: "title" }, { path: "theater", select: "name" }] })
                .select("customer_name seats createdAt showtime"),
            Movie.find({}).sort({ createdAt: -1 }).limit(5).select("title createdAt"),
            User.find({}).sort({ createdAt: -1 }).limit(5).select("name createdAt"),
            Showtime.find({}).sort({ date: -1, startTime: 1 }).limit(5)
                .populate("movie", "title").populate("theater", "name")
                .select("date startTime movie theater createdAt"),
        ]);

        const activities = [
            ...latestBookings.map(b => ({
                type: "booking",
                user: b.customer_name,
                action: `booked ${b.seats?.length || 0} seat(s) for ${b?.showtime?.movie?.title || "a movie"}`,
                at: b.createdAt
            })),
            ...latestMovies.map(m => ({
                type: "movie",
                user: "Admin",
                action: `added new movie '${m.title}'`,
                at: m.createdAt
            })),
            ...latestUsers.map(u => ({
                type: "user",
                user: u.name,
                action: "created an account",
                at: u.createdAt
            })),
            ...latestShowtimes.map(s => ({
                type: "showtime",
                user: "Admin",
                action: `updated showtimes for ${s?.theater?.name || "a theater"} — ${s?.movie?.title || "Movie"} (${s.startTime})`,
                at: s.createdAt || s.date
            })),
        ]
            .sort((a, b) => new Date(b.at) - new Date(a.at))
            .slice(0, 10)
            .map((a, i) => ({ id: i + 1, ...a }));

        // ----- Respond -----
        res.json({
            stats: {
                totalRevenue,
                totalBookings,
                totalUsers,
                totalMovies,
            },
            dailyBookings: daily,      // [{label:'Mon', value: 12}, ...]
            topMovies,                 // [{id,title,bookings,rating,revenue}, ...]
            activities,                // unified recent activity feed
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to load dashboard", error: err.message });
    }
};
