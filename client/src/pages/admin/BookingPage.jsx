import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Calendar, Clock, Ticket, User, Mail, Phone, DollarSign, RefreshCcw } from "lucide-react";

import EmptyState from "../../components/ui/EmptyState.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";

import { getAllBooking, updatePaymentStatusApi, PAYMENT_STATUSES } from "../../utils/api.js";

const toDate = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toISOString().slice(0, 10); // yyyy-mm-dd
};

const seatsToString = (seats) => {
    if (!Array.isArray(seats) || seats.length === 0) return "—";
    return seats.map((s) => `${String(s.row || "").toUpperCase()}${s.number}`).join(", ");
};

const formatCurrency = (n) =>
    n == null ? "—" : Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });

const StatusBadge = ({ status }) => {
    const base = "px-2 py-1 rounded-lg text-xs border";
    if (status === "paid") return <span className={`${base} bg-emerald-500/15 border-emerald-500/25 text-emerald-300`}>Paid</span>;
    if (status === "failed") return <span className={`${base} bg-red-500/15 border-red-500/25 text-red-300`}>Failed</span>;
    return <span className={`${base} bg-white/10 border-white/15 text-white/80`}>Pending</span>;
};

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errText, setErrText] = useState("");

    // per-row status select state
    const [pendingStatus, setPendingStatus] = useState({}); // { [bookingId]: "paid" | "pending" | "failed" }

    // confirm dialog
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [targetBooking, setTargetBooking] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        setErrText("");
        try {
            const res = await getAllBooking();
            const list = Array.isArray(res.data) ? res.data : res.data?.bookings || [];
            setBookings(list);
        } catch (err) {
            setErrText(err?.response?.data?.message || "Failed to load bookings");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);

    const rows = useMemo(() => bookings, [bookings]);

    const onSelectStatus = (booking, value) => {
        const id = booking._id || booking.id;
        setPendingStatus((prev) => ({ ...prev, [id]: value }));
    };

    const openConfirm = (booking) => {
        setTargetBooking(booking);
        setConfirmOpen(true);
    };

    const commitStatusChange = async () => {
        if (!targetBooking) return;
        const id = targetBooking._id || targetBooking.id;
        const newStatus = pendingStatus[id];

        if (!newStatus || newStatus === targetBooking.paymentStatus) {
            setConfirmOpen(false);
            setTargetBooking(null);
            return;
        }

        setSaving(true);
        try {
            const { data } = await updatePaymentStatusApi(id, newStatus);
            // update row optimistically using returned booking
            const updated = data?.booking;
            setBookings((prev) =>
                prev.map((b) => (String(b._id || b.id) === String(id) ? (updated || { ...b, paymentStatus: newStatus }) : b))
            );
            setConfirmOpen(false);
            setTargetBooking(null);
        } catch (err) {
            setErrText(err?.response?.data?.message || "Failed to update payment status");
        } finally {
            setSaving(false);
        }
    };

    const labelFor = (b) => {
        const mTitle = b?.showtime?.movie?.title || b?.movie?.title; // fallback if server populates differently
        const tName = b?.theater?.name || b?.showtime?.theater?.name || "Unknown theater";
        return `${mTitle || "Unknown movie"} at ${tName}`;
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Bookings</h2>
                    <p className="text-sm text-white/60">View and update payment status</p>
                </div>
                <button
                    onClick={fetchBookings}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
                    title="Refresh"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04]">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                        <tr className="text-left text-xs uppercase tracking-wider text-white/60 border-b border-white/10">
                            <th className="px-4 py-3">Booking</th>
                            <th className="px-4 py-3">Movie / Theater</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Start</th>
                            <th className="px-4 py-3">Seats</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Total</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-10 text-center text-white/70">
                                    <div className="inline-flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading bookings...
                                    </div>
                                </td>
                            </tr>
                        ) : errText ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-10">
                                    <div className="mx-auto max-w-md rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                                        {errText}
                                    </div>
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-4">
                                    <EmptyState
                                        title="No bookings yet"
                                        description="Bookings will appear here once customers place orders."
                                        actionLabel={null}
                                        onAction={null}
                                    />
                                </td>
                            </tr>
                        ) : (
                            rows.map((b) => {
                                const id = b._id || b.id;
                                const st = b.showtime || {};
                                const selected = pendingStatus[id] ?? b.paymentStatus;

                                return (
                                    <tr key={id} className="border-t border-white/10 hover:bg-white/[0.02]">
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-medium">{String(id).slice(-8).toUpperCase()}</div>
                                            <div className="text-xs text-white/60">{new Date(b.createdAt).toLocaleString()}</div>
                                        </td>

                                        <td className="px-4 py-3 text-sm">
                                            <div className="text-white/90">{b?.showtime?.movie?.title || b?.movie?.title || "—"}</div>
                                            <div className="text-white/60">{b?.theater?.name || st?.theater?.name || "—"}</div>
                                        </td>

                                        <td className="px-4 py-3 text-sm text-white/80">
                        <span className="inline-flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                            {toDate(st.date)}
                        </span>
                                        </td>

                                        <td className="px-4 py-3 text-sm text-white/80">
                        <span className="inline-flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                            {st.startTime || "—"}
                        </span>
                                        </td>

                                        <td className="px-4 py-3 text-sm text-white/80">
                        <span className="inline-flex items-center gap-2">
                          <Ticket className="w-4 h-4" />
                            {seatsToString(b.seats)}
                        </span>
                                        </td>

                                        <td className="px-4 py-3 text-sm text-white/80">
                                            <div className="inline-flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                {b.customer_name}
                                            </div>
                                            <div className="inline-flex items-center gap-1 text-white/60">
                                                <Mail className="w-4 h-4" />
                                                {b.customer_email}
                                            </div>
                                            <div className="inline-flex items-center gap-1 text-white/60">
                                                <Phone className="w-4 h-4" />
                                                {b.customer_phone}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-sm text-white/80">
                        <span className="inline-flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                            {formatCurrency(b.totalPrice)}
                        </span>
                                        </td>

                                        <td className="px-4 py-3 text-sm">
                                            <div className="mb-1">
                                                <StatusBadge status={b.paymentStatus} />
                                            </div>
                                            <select
                                                value={selected}
                                                onChange={(e) => onSelectStatus(b, e.target.value)}
                                                className="w-full rounded-lg bg-white/[0.06] border border-white/10 px-2 py-1 text-xs outline-none"
                                            >
                                                {PAYMENT_STATUSES.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </td>

                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => openConfirm(b)}
                                                disabled={(pendingStatus[id] ?? b.paymentStatus) === b.paymentStatus}
                                                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-50 text-sm"
                                                title="Update payment status"
                                            >
                                                Update
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirm change */}
            <ConfirmDialog
                open={confirmOpen}
                title="Update payment status?"
                description={
                    targetBooking
                        ? `Change payment status for ${labelFor(targetBooking)} to "${pendingStatus[targetBooking._id || targetBooking.id]}".`
                        : ""
                }
                confirmLabel="Update"
                cancelLabel="Cancel"
                variant="default"
                onConfirm={commitStatusChange}
                onCancel={() => { setConfirmOpen(false); setTargetBooking(null); }}
                loading={saving}
            />
        </div>
    );
}
