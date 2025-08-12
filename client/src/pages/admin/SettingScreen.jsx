import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, User, Mail, Shield, CalendarClock, LogOut, Save, Lock, CheckCircle2, AlertCircle } from "lucide-react";

import { updateUser, updatePassword } from "../../utils/api.js"; // adjust path if needed
import { useAuth } from "../../context/AuthContext.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";

const toDate = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    return Number.isNaN(date.getTime()) ? "—" : date.toISOString().slice(0, 10);
};

export default function AdminSettingsPage() {
    const { user, login, logout } = useAuth();
    const navigate = useNavigate();

    // ---- Profile form ----
    const [pName, setPName] = useState("");
    const [pEmail, setPEmail] = useState("");
    const [pLoading, setPLoading] = useState(false);
    const [pError, setPError] = useState("");
    const [pSuccess, setPSuccess] = useState("");

    // ---- Password form ----
    const [cPass, setCPass] = useState("");
    const [nPass, setNPass] = useState("");
    const [nPass2, setNPass2] = useState("");
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdError, setPwdError] = useState("");
    const [pwdSuccess, setPwdSuccess] = useState("");

    // ---- Logout confirm ----
    const [confirmLogout, setConfirmLogout] = useState(false);

    useEffect(() => {
        if (user) {
            setPName(user.name || "");
            setPEmail(user.email || "");
        }
    }, [user]);

    const profileChanged = useMemo(
        () => (user ? (pName.trim() !== (user.name || "") || pEmail.trim() !== (user.email || "")) : false),
        [user, pName, pEmail]
    );

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setPError("");
        setPSuccess("");
        if (!pName.trim()) return setPError("Name is required");
        if (!pEmail.trim() || !/^\S+@\S+\.\S+$/.test(pEmail.trim())) return setPError("Enter a valid email");

        setPLoading(true);
        try {
            const { data } = await updateUser({ name: pName.trim(), email: pEmail.trim() });
            // update local auth user without changing token
            const tokenLS = localStorage.getItem("token");
            const tokenSS = sessionStorage.getItem("token");
            const rememberMe = !!tokenLS;
            const token = tokenLS || tokenSS || "";
            // server might return updated user object; fallback to submitted data
            const updatedUser = data?.user || { ...(user || {}), name: pName.trim(), email: pEmail.trim() };
            login(updatedUser, token, rememberMe);
            setPSuccess("Profile updated successfully");
        } catch (err) {
            setPError(err?.response?.data?.message || "Failed to update profile");
        } finally {
            setPLoading(false);
        }
    };

    const handleSavePassword = async (e) => {
        e.preventDefault();
        setPwdError("");
        setPwdSuccess("");

        if (!cPass) return setPwdError("Current password is required");
        if (!nPass || nPass.length < 6) return setPwdError("New password must be at least 6 characters");
        if (nPass !== nPass2) return setPwdError("New passwords do not match");

        setPwdLoading(true);
        try {
            await updatePassword({ currentPassword: cPass, newPassword: nPass });
            setPwdSuccess("Password updated successfully");
            setCPass(""); setNPass(""); setNPass2("");
        } catch (err) {
            setPwdError(err?.response?.data?.message || "Failed to update password");
        } finally {
            setPwdLoading(false);
        }
    };

    const doLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Settings</h2>
                    <p className="text-sm text-white/60">Manage your profile, password, and session</p>
                </div>
                <button
                    onClick={() => setConfirmLogout(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>

            {/* Profile Card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        <h3 className="font-semibold">Profile</h3>
                    </div>
                    <div className="text-xs text-white/60 inline-flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Role: <span className="text-white">{user?.role || "user"}</span>
                        <span className="mx-2">•</span>
                        <CalendarClock className="w-4 h-4" />
                        Joined: <span className="text-white">{toDate(user?.createdAt)}</span>
                    </div>
                </div>

                {pError && (
                    <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200 inline-flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> {pError}
                    </div>
                )}
                {pSuccess && (
                    <div className="mb-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200 inline-flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> {pSuccess}
                    </div>
                )}

                <form onSubmit={handleSaveProfile} className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-white/70">Full Name</label>
                        <input
                            value={pName}
                            onChange={(e) => setPName(e.target.value)}
                            placeholder="Your name"
                            className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-white/70">Email</label>
                        <input
                            type="email"
                            value={pEmail}
                            onChange={(e) => setPEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                        />
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={pLoading || !profileChanged}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-50"
                        >
                            {pLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>

            {/* Password Card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Lock className="w-5 h-5" />
                    <h3 className="font-semibold">Password</h3>
                </div>

                {pwdError && (
                    <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200 inline-flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> {pwdError}
                    </div>
                )}
                {pwdSuccess && (
                    <div className="mb-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200 inline-flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> {pwdSuccess}
                    </div>
                )}

                <form onSubmit={handleSavePassword} className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm text-white/70">Current Password</label>
                        <input
                            type="password"
                            value={cPass}
                            onChange={(e) => setCPass(e.target.value)}
                            placeholder="••••••••"
                            className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-white/70">New Password</label>
                        <input
                            type="password"
                            value={nPass}
                            onChange={(e) => setNPass(e.target.value)}
                            placeholder="At least 6 characters"
                            className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-white/70">Confirm New Password</label>
                        <input
                            type="password"
                            value={nPass2}
                            onChange={(e) => setNPass2(e.target.value)}
                            placeholder="Repeat new password"
                            className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                        />
                    </div>

                    <div className="md:col-span-3 flex justify-end">
                        <button
                            type="submit"
                            disabled={pwdLoading}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-50"
                        >
                            {pwdLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Update Password
                        </button>
                    </div>
                </form>
            </div>

            {/* Logout confirm */}
            <ConfirmDialog
                open={confirmLogout}
                title="Logout?"
                description="You will be signed out of the admin dashboard."
                confirmLabel="Logout"
                cancelLabel="Cancel"
                variant="danger"
                onConfirm={doLogout}
                onCancel={() => setConfirmLogout(false)}
                loading={false}
            />
        </div>
    );
}
