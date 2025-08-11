import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    Mail,
    Phone,
    Shield,
    MapPin,
    Calendar,
    Lock,
    Edit,
    CreditCard,
    Bell,
    Ticket,
    Crown,
    CheckCircle2,
    AlertCircle,
    X,
    Upload,
    Clock,
} from "lucide-react";

// If you already have an AuthContext, you can plug it in here
// import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
    const navigate = useNavigate();
    // const { user } = useAuth();

    // --- Mock user (replace with API or context data) ---
    const mockUser = {
        id: "U-10294",
        name: "John Doe",
        email: "john.doe@email.com",
        phone: "+94 77 123 4567",
        avatar: "https://ui-avatars.com/api/?name=John+Doe&background=1e1e2f&color=fff",
        joinedAt: "2024-05-12T10:20:00Z",
        tier: "Gold",
        city: "Colombo",
        country: "Sri Lanka",
        preferences: {
            promoEmails: true,
            bookingReminders: true,
            smsAlerts: false,
        },
    };

    // --- Mock last bookings (you can pass real bookings or fetch) ---
    const mockRecentBookings = [
        {
            id: "BK145",
            movie: { title: "Dune: Part Two", poster: "https://via.placeholder.com/80x110/1a1a1a/ffffff?text=Poster" },
            cinema: "Savoy 3D",
            date: "2024-12-20",
            time: "09:00 PM",
            seats: ["C5", "C6"],
            total: 4200,
            status: "completed",
            bookedAt: "2024-12-01T12:45:00Z",
        },
        {
            id: "BK146",
            movie: { title: "Oppenheimer", poster: "https://via.placeholder.com/80x110/1a1a1a/ffffff?text=Poster" },
            cinema: "PVR One Galle Face",
            date: "2024-12-28",
            time: "07:30 PM",
            seats: ["B7", "B8"],
            total: 4800,
            status: "confirmed",
            bookedAt: "2024-12-10T09:15:00Z",
        },
    ];

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [recentBookings, setRecentBookings] = useState([]);

    // UI State
    const [activeTab, setActiveTab] = useState("overview"); // overview | details | security | payments | notifications
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({ name: "", phone: "" });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });

    useEffect(() => {
        const load = async () => {
            // Simulate API delay
            await new Promise((r) => setTimeout(r, 600));
            setProfile(mockUser);
            setRecentBookings(mockRecentBookings);
            setEditData({ name: mockUser.name, phone: mockUser.phone });
            setLoading(false);
        };
        load();
    }, []);

    const joinedLabel = useMemo(() => {
        if (!profile?.joinedAt) return "-";
        return new Date(profile.joinedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }, [profile]);

    const handleSaveEdit = () => {
        if (!editData.name.trim()) return alert("Name is required");
        // TODO: call update API
        setProfile((p) => ({ ...p, name: editData.name.trim(), phone: editData.phone.trim() }));
        setShowEditModal(false);
    };

    const handleChangePassword = () => {
        if (!pwd.current || !pwd.next || !pwd.confirm) return alert("Fill all fields");
        if (pwd.next !== pwd.confirm) return alert("New passwords do not match");
        // TODO: call change password API
        setShowPasswordModal(false);
        setPwd({ current: "", next: "", confirm: "" });
        alert("Password updated (mock)");
    };

    const togglePref = (key) => {
        setProfile((p) => ({
            ...p,
            preferences: { ...p.preferences, [key]: !p.preferences[key] },
        }));
        // TODO: persist preference
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
                                    src={profile.avatar}
                                    alt={profile.name}
                                    className="w-28 h-28 rounded-2xl object-cover"
                                />
                                <button
                                    className="absolute -bottom-2 -right-2 bg-yellow-500 text-black rounded-lg px-2 py-1 flex items-center gap-1 text-xs font-semibold hover:bg-yellow-600"
                                    onClick={() => alert("Upload coming soon (mock)")}
                                >
                                    <Upload className="w-3.5 h-3.5" /> Upload
                                </button>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-2xl font-bold">{profile.name}</h2>
                                            <span className="inline-flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-600 px-2 py-0.5 rounded-full">
                        <Crown className="w-3.5 h-3.5" /> {profile.tier}
                      </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                                            <span className="inline-flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> {profile.email}</span>
                                            <span className="inline-flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> {profile.phone}</span>
                                        </div>
                                        <div className="mt-2 text-gray-400 text-sm flex flex-wrap items-center gap-4">
                                            <span className="inline-flex items-center gap-2"><MapPin className="w-4 h-4" /> {profile.city}, {profile.country}</span>
                                            <span className="inline-flex items-center gap-2"><Calendar className="w-4 h-4" /> Joined {joinedLabel}</span>
                                            <span className="inline-flex items-center gap-2"><Shield className="w-4 h-4" /> ID: {profile.id}</span>
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
                                            { key: "payments", label: "Payments" },
                                            { key: "notifications", label: "Notifications" },
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

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                        <StatCard icon={Ticket} label="Total Bookings" value={42} sub="All time" />
                        <StatCard icon={CheckCircle2} label="Completed" value={28} sub="Watched" />
                        <StatCard icon={Clock} label="Upcoming" value={3} sub="This month" />
                    </div>
                </div>

                {/* Content Area */}
                {activeTab === "overview" && (
                    <OverviewSection recentBookings={recentBookings} />
                )}

                {activeTab === "details" && (
                    <DetailsSection profile={profile} />
                )}

                {activeTab === "security" && (
                    <SecuritySection onChangePassword={() => setShowPasswordModal(true)} />)
                }

                {activeTab === "payments" && (
                    <PaymentsSection />
                )}

                {activeTab === "notifications" && (
                    <NotificationsSection prefs={profile.preferences} togglePref={togglePref} />
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
                            <label className="block text-sm text-gray-400 mb-1">Phone</label>
                            <input
                                value={editData.phone}
                                onChange={(e) => setEditData((d) => ({ ...d, phone: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-yellow-500"
                                placeholder="Enter your phone"
                            />
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600" onClick={() => setShowEditModal(false)}>Cancel</button>
                            <button className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-600" onClick={handleSaveEdit}>Save Changes</button>
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
                            <button className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                            <button className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-600" onClick={handleChangePassword}>Update Password</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

/* ------------------------------ Sections ------------------------------ */

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
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
                        <div key={b.id} className="bg-gray-750/50 border border-gray-700 rounded-xl p-4 flex gap-4 items-center">
                            <img src={b.movie.poster} alt={b.movie.title} className="w-16 h-24 object-cover rounded-lg" />
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
                                <div className="font-semibold text-yellow-500">LKR {b.total.toLocaleString()}</div>
                                <div className="text-xs text-gray-500">#{b.id}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Membership Perks */}
        <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Membership Perks</h3>
            <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-yellow-500 mt-0.5" />Priority seat selection</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-yellow-500 mt-0.5" />Early access to premieres</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-yellow-500 mt-0.5" />Exclusive discounts & offers</li>
            </ul>
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
                <Row label="Phone" value={profile.phone} />
                <Row label="City" value={profile.city} />
                <Row label="Country" value={profile.country} />
                <Row label="User ID" value={profile.id} mono />
            </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Activity</h3>
            <div className="space-y-3 text-sm">
                <Row label="Member Since" value={formatDate(profile.joinedAt)} />
                <Row label="Last Sign-in" value="Just now (mock)" />
                <Row label="Two-factor" value="Enabled (mock)" />
            </div>
        </div>
    </div>
);

const SecuritySection = ({ onChangePassword }) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-yellow-500" />Security</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between bg-gray-700 rounded-lg p-4">
                    <div>
                        <div className="font-semibold">Password</div>
                        <div className="text-sm text-gray-400">Choose a strong unique password</div>
                    </div>
                    <button onClick={onChangePassword} className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-600">Change</button>
                </div>
                <div className="flex items-center justify-between bg-gray-700 rounded-lg p-4">
                    <div>
                        <div className="font-semibold">Two-Factor Authentication</div>
                        <div className="text-sm text-gray-400">Protect your account with an extra layer</div>
                    </div>
                    <button onClick={() => alert("Enable 2FA (mock)")} className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-500">Manage</button>
                </div>
            </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Linked Accounts</h3>
            <div className="space-y-3 text-sm">
                <Row label="Google" value="Connected (mock)" />
                <Row label="Apple" value="Not connected" />
            </div>
        </div>
    </div>
);

const PaymentsSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-yellow-500" />Saved Methods</h3>
            <div className="space-y-3">
                <PaymentRow brand="Visa" last4="4242" exp="12/28" primary />
                <PaymentRow brand="Mastercard" last4="5599" exp="05/27" />
                <button onClick={() => alert("Add card (mock)")} className="mt-2 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600">Add new</button>
            </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Billing Address</h3>
            <div className="space-y-2 text-sm text-gray-300">
                <div>123 Flower Road</div>
                <div>Colombo 07</div>
                <div>Sri Lanka</div>
                <button onClick={() => alert("Edit address (mock)")} className="mt-3 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600">Edit</button>
            </div>
        </div>
    </div>
);

const NotificationsSection = ({ prefs, togglePref }) => (
    <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-yellow-500" />Notifications</h3>
        <div className="space-y-3">
            <ToggleRow label="Promotions & Offers" checked={!!prefs.promoEmails} onChange={() => togglePref("promoEmails")} />
            <ToggleRow label="Booking Reminders" checked={!!prefs.bookingReminders} onChange={() => togglePref("bookingReminders")} />
            <ToggleRow label="SMS Alerts" checked={!!prefs.smsAlerts} onChange={() => togglePref("smsAlerts")} />
        </div>
    </div>
);

/* ------------------------------ Elements ------------------------------ */

const Row = ({ label, value, mono }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-700/70 last:border-none">
        <div className="text-gray-400">{label}</div>
        <div className={`ml-4 ${mono ? "font-mono text-yellow-400" : "font-medium"}`}>{value}</div>
    </div>
);

const StatusBadge = ({ status }) => {
    const map = {
        confirmed: "bg-green-500/20 text-green-400 border-green-600",
        completed: "bg-blue-500/20 text-blue-400 border-blue-600",
        cancelled: "bg-red-500/20 text-red-400 border-red-600",
    };
    const label = {
        confirmed: "Confirmed",
        completed: "Completed",
        cancelled: "Cancelled",
    }[status] || status;
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${map[status] || "bg-gray-700 text-gray-300 border-gray-600"}`}>
      {label}
    </span>
    );
};

const PaymentRow = ({ brand, last4, exp, primary }) => (
    <div className="flex items-center justify-between bg-gray-700 rounded-lg p-4">
        <div>
            <div className="font-semibold">{brand} •••• {last4}</div>
            <div className="text-xs text-gray-400">Expires {exp}</div>
        </div>
        <div className="flex items-center gap-2">
            {primary && <span className="text-xs px-2 py-1 rounded-full border border-yellow-600 text-yellow-400 bg-yellow-500/20">Primary</span>}
            <button onClick={() => alert("Set primary (mock)")} className="px-3 py-1.5 rounded-lg bg-gray-600 text-white hover:bg-gray-500 text-sm">Primary</button>
            <button onClick={() => alert("Remove card (mock)")} className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-500 text-sm">Remove</button>
        </div>
    </div>
);

const ToggleRow = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between bg-gray-700 rounded-lg p-4">
        <div className="font-medium">{label}</div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
        </label>
    </div>
);

const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-2xl font-bold">{title}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6">{children}</div>
        </div>
    </div>
);

/* ------------------------------ Utils ------------------------------ */

function formatDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default ProfilePage;
