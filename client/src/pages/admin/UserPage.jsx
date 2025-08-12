import { useCallback, useEffect, useMemo, useState } from "react";
import { Users, Plus, Loader2, Mail, CalendarClock, Shield, ShieldCheck } from "lucide-react";

import EmptyState from "../../components/ui/EmptyState.jsx";
// (No confirm dialog needed here)

import { getAllUsers, createAdmin } from "../../utils/api.js"; // adjust path if needed

const toDate = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    return Number.isNaN(date.getTime()) ? "—" : date.toISOString().slice(0, 10);
};

const RoleBadge = ({ role }) => {
    const base = "px-2 py-1 rounded-lg text-xs border";
    if (role === "admin")
        return <span className={`${base} bg-emerald-500/15 border-emerald-500/25 text-emerald-300 inline-flex items-center gap-1`}><ShieldCheck className="w-3.5 h-3.5" /> Admin</span>;
    return <span className={`${base} bg-white/10 border-white/15 text-white/80 inline-flex items-center gap-1`}><Shield className="w-3.5 h-3.5" /> User</span>;
};

function CreateAdminModal({ open, onClose, onCreated }) {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;
        setForm({ name: "", email: "", password: "" });
        setErrors({});
        setSubmitting(false);
    }, [open]);

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = "Name is required";
        if (!form.email.trim()) e.email = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = "Enter a valid email";
        if (!form.password) e.password = "Password is required";
        else if (form.password.length < 6) e.password = "Min 6 characters";
        return e;
    };

    const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        const eobj = validate();
        setErrors(eobj);
        if (Object.keys(eobj).length) return;

        setSubmitting(true);
        try {
            await createAdmin({
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
            });
            onCreated?.();
            onClose();
        } catch (err) {
            setErrors((prev) => ({
                ...prev,
                _server: err?.response?.data?.message || "Failed to create admin",
            }));
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <>
            <div className="fixed inset-0 z-[60] bg-black/50" onClick={onClose} />
            <div className="fixed inset-0 z-[70] grid place-items-center p-4">
                <div className="w-full max-w-md rounded-2xl bg-[#161616] border border-white/10">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                        <h2 className="text-base font-semibold">Create New Admin</h2>
                        <button className="p-2 rounded-lg hover:bg-white/5" onClick={onClose} aria-label="Close">✕</button>
                    </div>

                    {errors._server && (
                        <div className="mx-5 mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                            {errors._server}
                        </div>
                    )}

                    <form onSubmit={submit} className="px-5 pt-4 pb-5 grid gap-4">
                        <div>
                            <label className="text-sm text-white/70">Full Name *</label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={change}
                                placeholder="Jane Admin"
                                className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                            />
                            {errors.name && <p className="text-xs text-red-300 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="text-sm text-white/70">Email *</label>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={change}
                                placeholder="admin@example.com"
                                className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                            />
                            {errors.email && <p className="text-xs text-red-300 mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="text-sm text-white/70">Password *</label>
                            <input
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={change}
                                placeholder="••••••••"
                                className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                            />
                            {errors.password && <p className="text-xs text-red-300 mt-1">{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08]">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-60"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Create Admin
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [errText, setErrText] = useState("");
    const [loading, setLoading] = useState(true);

    const [open, setOpen] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setErrText("");
        try {
            const res = await getAllUsers();
            setUsers(Array.isArray(res.data) ? res.data : res.data?.users || []);
        } catch (err) {
            setErrText(err?.response?.data?.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const rows = useMemo(() => users, [users]);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Users</h2>
                    <p className="text-sm text-white/60">All registered users and admins</p>
                </div>
                <button
                    onClick={() => setOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
                >
                    <Plus className="w-4 h-4" /> Create New Admin
                </button>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04]">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                        <tr className="text-left text-xs uppercase tracking-wider text-white/60 border-b border-white/10">
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Created</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-10 text-center text-white/70">
                                    <div className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading users...</div>
                                </td>
                            </tr>
                        ) : errText ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-10">
                                    <div className="mx-auto max-w-md rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                                        {errText}
                                    </div>
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4">
                                    <EmptyState
                                        title="No users found"
                                        description="Create an admin to get started."
                                        actionLabel="Create Admin"
                                        onAction={() => setOpen(true)}
                                        Icon={Users}
                                    />
                                </td>
                            </tr>
                        ) : (
                            rows.map((u) => {
                                const id = u._id || u.id;
                                const initials = String(u.name || "?")
                                    .split(" ")
                                    .map((s) => s[0])
                                    .slice(0, 2)
                                    .join("")
                                    .toUpperCase();

                                return (
                                    <tr key={id} className="border-t border-white/10 hover:bg-white/[0.02]">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-white/[0.08] border border-white/10 grid place-items-center text-sm font-semibold">
                                                    {initials}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white/90">{u.name}</div>
                                                    <div className="text-xs text-white/60">ID: {String(id).slice(-8).toUpperCase()}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-sm text-white/80">
                        <span className="inline-flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                            {u.email}
                        </span>
                                        </td>

                                        <td className="px-4 py-3 text-sm">
                                            <RoleBadge role={u.role} />
                                        </td>

                                        <td className="px-4 py-3 text-sm text-white/80">
                        <span className="inline-flex items-center gap-2">
                          <CalendarClock className="w-4 h-4" />
                            {toDate(u.createdAt)}
                        </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Admin Modal */}
            <CreateAdminModal open={open} onClose={() => setOpen(false)} onCreated={fetchUsers} />
        </div>
    );
}
