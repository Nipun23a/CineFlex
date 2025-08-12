// src/pages/ProfilePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Mail,
    Phone, // kept in case you add later, but not shown in UI
    Shield,
    Calendar,
    Lock,
    Edit,
    Upload,
    Ticket,
    CheckCircle2,
    Clock,
    X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import {
    getUserById,
    updateUser,
    updatePassword,
    getBookingByUser,
} from "../utils/api";

// ------------------------------ Utils ------------------------------
const getAvatarUrl = (name) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name || "User"
    )}&background=1e1e2f&color=fff`;

function formatDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

// ------------------------------ Page ------------------------------
const ProfilePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // from AuthContext (contains id + minimal fields from login)
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [recentBookings, setRecentBookings] = useState([]);

    // UI State
    const [activeTab, setActiveTab] = useState("overview"); // overview | details | security
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({ name: "", email: "" });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });

    // Load full user + bookings
    useEffect(() => {
        const load = async () => {
            if (!user?.id && !user?._id) {
                setLoading(false);
                return;
            }
            try {
                const uid = user.id || user._id;
                const [{ data: userRes }, { data: bookingsRes }] = await Promise.all([
                    getUserById(uid),
                    getBookingByUser(uid),
                ]);

                // userRes expected shape: { _id, name, email, role, createdAt }
                const fullUser = userRes?.user || userRes; // in case your API wraps
                setProfile(fullUser);
                setEditData({ name: fullUser?.name || "", email: fullUser?.email || "" });

                // bookingsRes expected array of bookings (with showtime + theater + movie populated if your API does so)
                const mapped = (bookingsRes?.bookings || bookingsRes || []).map((b) => {
                    // Safely read nested fields with fallbacks
                    const movie =
                        b?.showtime?.movie || b?.movie || { title: "Unknown", poster: "" };
                    const theater =
                        b?.showtime?.theater || b?.theater || { name: "Unknown Theater" };

                    const showDate = b?.showtime?.date || b?.date || b?.createdAt;
                    const showTime = b?.showtime?.startTime || b?.time || "";

                    const seats = Array.isArray(b?.seats)
                        ? b.seats.map((s) =>
                            typeof s === "string"
                                ? s
                                : `${(s?.row || "").toString().toUpperCase()}${s?.number ?? ""}`
                        )
                        : [];

                    return {
                        id: b?._id || b?.id,
                        movie: {
                            title: movie?.title || "Unknown",
                            poster:
                                movie?.posterUrl ||
                                movie?.poster ||
                                "https://via.placeholder.com/80x110/1a1a1a/ffffff?text=Poster",
                        },
                        cinema: theater?.name || "Unknown Theater",
                        date: showDate,
                        time: showTime,
                        seats,
                        total: b?.totalPrice ?? 0,
                        status: normalizeStatus(b?.paymentStatus),
                        bookedAt: b?.createdAt,
                    };
                });

                setRecentBookings(mapped);
            } catch (e) {
                console.error(e);
                alert("Failed to load profile or bookings.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    const joinedLabel = useMemo(() => {
        if (!profile?.createdAt) return "-";
        return new Date(profile.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }, [profile]);

    const handleSaveEdit = async () => {
        if (!editData.name.trim()) return alert("Name is required");
        if (!editData.email.trim()) return alert("Email is required");

        try {
            const payload = {
                _id: profile._id, // or id based on your API requirement
                name: editData.name.trim(),
                email: editData.email.trim(),
            };
            const { data } = await updateUser(payload);
            const updated = data?.user || data || payload;
            setProfile((p) => ({ ...p, ...updated }));
            setShowEditModal(false);
        } catch (e) {
            console.error(e);
            alert("Failed to update profile.");
        }
    };

    const handleChangePassword = async () => {
        if (!pwd.current || !pwd.next || !pwd.confirm) return alert("Fill all fields");
        if (pwd.next !== pwd.confirm) return alert("New passwords do not match");

        try {
            await updatePassword({
                currentPassword: pwd.current,
                newPassword: pwd.next,
            });
            setShowPasswordModal(false);
            setPwd({ current: "", next: "", confirm: "" });
            alert("Password updated");
        } catch (e) {
            console.error(e);
            alert("Failed to update password.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4" />
                    <p className="text-gray-400">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-gray-400">You’re not signed in.</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-600"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">My Profile</h1>
                    <p className="text-gray-400">Manage your account, security and preferences</p>
                </div>

                {/* Top: Profile Card + Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6">
                        <div className="flex flex-col sm:flex-row gap-6">
                            <div className="relative w-28 h-28 flex-shrink-0">
                                <img
                                    src={getAvatarUrl(profile.name)}
                                    alt={profile.name}
                                    className="w-28 h-28 rounded-2xl object-cover"
                                />
                                <button
                                    className="absolute -bottom-2 -right-2 bg-yellow-500 text-black rounded-lg px-2 py-1 flex items-center gap-1 text-xs font-semibold hover:bg-yellow-600"
                                    onClick={() => alert("Upload coming soon")}
                                >
                                    <Upload className="w-3.5 h-3.5" /> Upload
                                </button>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-2xl font-bold">{profile.name}</h2>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                      <span className="inline-flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" /> {profile.email}
                      </span>
                                        </div>
                                        <div className="mt-2 text-gray-400 text-sm flex flex-wrap items-center gap-4">
                      <span className="inline-flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Joined {joinedLabel}
                      </span>
                                            <span className="inline-flex items-center gap-2">
                        <Shield className="w-4 h-4" /> ID: {profile._id}
                      </span>
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0">
                                        <button
                                            onClick={() => setShowEditModal(true)}
                                            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
                                        >
                                            <Edit className="w-4 h-4" /> Edit Profile
                                        </button>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="mt-6">
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { key: "overview", label: "Overview" },
                                            { key: "details", label: "Details" },
                                            { key: "security", label: "Security" },
                                        ].map((t) => (
                                            <button
                                                key={t.key}
                                                onClick={() => setActiveTab(t.key)}
                                                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                                                    activeTab === t.key
                                                        ? "bg-yellow-500 text-black border-yellow-500"
                                                        : "bg-gray-700/60 text-gray-300 border-gray-600 hover:border-yellow-500"
                                                }`}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats (basic sample; you can replace with real aggregates later) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                        <StatCard icon={Ticket} label="Total Bookings" value={recentBookings.length} sub="All time" />
                        <StatCard
                            icon={CheckCircle2}
                            label="Paid"
                            value={recentBookings.filter((b) => b.status === "paid").length}
                            sub="Successful"
                        />
                        <StatCard
                            icon={Clock}
                            label="Pending"
                            value={recentBookings.filter((b) => b.status === "pending").length}
                            sub="Awaiting payment"
                        />
                    </div>
                </div>

                {/* Content Area */}
                {activeTab === "overview" && <OverviewSection recentBookings={recentBookings} />}
                {activeTab === "details" && <DetailsSection profile={profile} />}
                {activeTab === "security" && (
                    <SecuritySection onChangePassword={() => setShowPasswordModal(true)} />
                )}
            </div>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <Modal onClose={() => setShowEditModal(false)} title="Edit Profile">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                            <input
                                value={editData.name}
                                onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-yellow-500"
                                placeholder="Enter your name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Email</label>
                            <input
                                value={editData.email}
                                onChange={(e) => setEditData((d) => ({ ...d, email: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-yellow-500"
                                placeholder="Enter your email"
                                type="email"
                            />
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600"
                                onClick={() => setShowEditModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-600"
                                onClick={handleSaveEdit}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Change Password Modal */}
            {showPasswordModal && (
                <Modal onClose={() => setShowPasswordModal(false)} title="Change Password">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Current Password</label>
                            <input
                                type="password"
                                value={pwd.current}
                                onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-yellow-500"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={pwd.next}
                                    onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-yellow-500"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={pwd.confirm}
                                    onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-yellow-500"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600"
                                onClick={() => setShowPasswordModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-600"
                                onClick={handleChangePassword}
                            >
                                Update Password
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

// ------------------------------ Sections ------------------------------
const StatCard = ({ icon: Icon, label, value, sub }) => (
    <div className="bg-gray-800 rounded-xl p-5 flex items-center justify-between">
        <div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm text-gray-400">{label}</div>
            {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
        </div>
        <div className="w-11 h-11 rounded-xl bg-gray-700/60 border border-gray-600 flex items-center justify-center">
            <Icon className="w-5 h-5 text-yellow-500" />
        </div>
    </div>
);

const OverviewSection = ({ recentBookings }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Recent Bookings</h3>
                <button
                    onClick={() => alert("Go to bookings page")}
                    className="text-sm text-yellow-500 hover:text-yellow-400"
                >
                    View all
                </button>
            </div>
            {recentBookings.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No recent bookings</div>
            ) : (
                <div className="space-y-4">
                    {recentBookings.map((b) => (
                        <div
                            key={b.id}
                            className="bg-gray-750/50 border border-gray-700 rounded-xl p-4 flex gap-4 items-center"
                        >
                            <img
                                src={b.movie.poster}
                                alt={b.movie.title}
                                className="w-16 h-24 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold">{b.movie.title}</h4>
                                    <StatusBadge status={b.status} />
                                </div>
                                <div className="text-sm text-gray-300 mt-1">{b.cinema}</div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {formatDate(b.date)} • {b.time} • Seats: {b.seats.join(", ")}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold text-yellow-500">
                                    LKR {Number(b.total || 0).toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">#{b.id}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);

const DetailsSection = ({ profile }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Personal Details</h3>
            <div className="space-y-3 text-sm">
                <Row label="Full Name" value={profile.name} />
                <Row label="Email" value={profile.email} />
                <Row label="Role" value={profile.role} />
                <Row label="User ID" value={profile._id} mono />
            </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Activity</h3>
            <div className="space-y-3 text-sm">
                <Row label="Member Since" value={formatDate(profile.createdAt)} />
                {/* You can add Last Sign-in here if backend provides it later */}
            </div>
        </div>
    </div>
);

const SecuritySection = ({ onChangePassword }) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-yellow-500" />
                Security
            </h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between bg-gray-700 rounded-lg p-4">
                    <div>
                        <div className="font-semibold">Password</div>
                        <div className="text-sm text-gray-400">Choose a strong unique password</div>
                    </div>
                    <button
                        onClick={onChangePassword}
                        className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-600"
                    >
                        Change
                    </button>
                </div>
            </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Linked Accounts</h3>
            <div className="space-y-3 text-sm">
                <Row label="Google" value="Not connected" />
                <Row label="Apple" value="Not connected" />
            </div>
        </div>
    </div>
);

// ------------------------------ Elements ------------------------------
const Row = ({ label, value, mono }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-700/70 last:border-none">
        <div className="text-gray-400">{label}</div>
        <div className={`ml-4 ${mono ? "font-mono text-yellow-400" : "font-medium"}`}>
            {String(value ?? "-")}
        </div>
    </div>
);

const STATUS_STYLES = {
    confirmed: "bg-green-500/20 text-green-400 border-green-600",
    completed: "bg-blue-500/20 text-blue-400 border-blue-600",
    cancelled: "bg-red-500/20 text-red-400 border-red-600",
    paid: "bg-green-500/20 text-green-400 border-green-600",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-600",
    failed: "bg-red-500/20 text-red-400 border-red-600",
};
const STATUS_LABELS = {
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    paid: "Paid",
    pending: "Pending",
    failed: "Failed",
};

function normalizeStatus(paymentStatus) {
    // Map your booking's `paymentStatus` directly; extend if you add a booking `status`
    const s = (paymentStatus || "").toLowerCase();
    if (["paid", "pending", "failed"].includes(s)) return s;
    return "pending";
}

const StatusBadge = ({ status }) => {
    const cls = STATUS_STYLES[status] || "bg-gray-700 text-gray-300 border-gray-600";
    const label = STATUS_LABELS[status] || status;
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${cls}`}>{label}</span>
    );
};

const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-2xl font-bold">{title}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>
            <div className="p-6">{children}</div>
        </div>
    </div>
);

export default ProfilePage;

