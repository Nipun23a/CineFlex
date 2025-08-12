import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Loader2, Pencil, Trash2, Calendar, Clock, Film, Building2, Ticket, DollarSign } from "lucide-react";

import EmptyState from "../../components/ui/EmptyState.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";

import { getAllShowTimes, createShowTime, updateShowTime, deleteShowTime,getAllMovies,getAllTheater } from "../../utils/api.js";

const toDateInput = (d) => {
    if (!d) return "";
    const date = typeof d === "string" ? new Date(d) : d;
    if (Number.isNaN(date?.getTime())) return "";
    return date.toISOString().slice(0, 10);
};

const fmtCurrency = (n) => (n == null ? "-" : Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 }));

/** Create/Edit Modal (same form) */
function ShowtimeFormModal({ open, mode = "create", initial = null, onClose, onSaved, movies = [], theaters = [] }) {
    const [form, setForm] = useState({
        movie: "",
        theater: "",
        date: "",
        startTime: "",
        totalSeats: "",
        price: "",
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;
        if (mode === "edit" && initial) {
            const movieId = typeof initial.movie === "string" ? initial.movie : initial.movie?._id || initial.movie?.id || "";
            const theaterId = typeof initial.theater === "string" ? initial.theater : initial.theater?._id || initial.theater?.id || "";
            setForm({
                movie: movieId,
                theater: theaterId,
                date: toDateInput(initial.date),
                startTime: initial.startTime || "",
                totalSeats: initial.totalSeats ?? "",
                price: initial.price ?? "",
            });
        } else {
            setForm({ movie: "", theater: "", date: "", startTime: "", totalSeats: "", price: "" });
        }
        setErrors({});
        setSubmitting(false);
    }, [open, mode, initial]);

    const validate = () => {
        const e = {};
        if (!form.movie) e.movie = "Movie is required";
        if (!form.theater) e.theater = "Theater is required";
        if (!form.date) e.date = "Date is required";
        if (!form.startTime) e.startTime = "Start time is required";
        if (form.totalSeats === "" || Number(form.totalSeats) <= 0) e.totalSeats = "Total seats must be > 0";
        if (form.price === "" || Number(form.price) < 0) e.price = "Price must be ≥ 0";
        return e;
    };

    const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const eobj = validate();
        setErrors(eobj);
        if (Object.keys(eobj).length) return;

        const payload = {
            movie: form.movie,
            theater: form.theater,
            date: form.date,                 // ISO yyyy-mm-dd from <input type="date">
            startTime: form.startTime,       // "HH:MM"
            totalSeats: Number(form.totalSeats),
            price: Number(form.price),
        };

        setSubmitting(true);
        try {
            if (mode === "edit" && initial) {
                const id = initial._id || initial.id;
                await updateShowTime(id, payload);
            } else {
                await createShowTime(payload);
            }
            onSaved?.();
            onClose();
        } catch (err) {
            setErrors((prev) => ({
                ...prev,
                _server: err?.response?.data?.message || `Failed to ${mode === "edit" ? "update" : "create"} showtime`,
            }));
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <>
            <div className="fixed inset-0 z-[60] bg-black/50" onClick={onClose} />
            <div className="fixed z-[70] inset-0 grid place-items-center p-4">
                <div className="w-full max-w-2xl rounded-2xl bg-[#161616] border border-white/10">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                        <h2 className="text-base font-semibold">{mode === "edit" ? "Edit Showtime" : "Add New Showtime"}</h2>
                        <button className="p-2 rounded-lg hover:bg-white/5" onClick={onClose} aria-label="Close">✕</button>
                    </div>

                    {errors._server && (
                        <div className="mx-5 mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                            {errors._server}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="px-5 pt-4 pb-5 grid gap-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-white/70">Movie *</label>
                                <select
                                    value={form.movie}
                                    onChange={(e) => setField("movie", e.target.value)}
                                    className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none"
                                >
                                    <option value="">Select movie</option>
                                    {movies.map((m) => (
                                        <option key={m._id || m.id} value={m._id || m.id}>{m.title}</option>
                                    ))}
                                </select>
                                {errors.movie && <p className="text-xs text-red-300 mt-1">{errors.movie}</p>}
                            </div>

                            <div>
                                <label className="text-sm text-white/70">Theater *</label>
                                <select
                                    value={form.theater}
                                    onChange={(e) => setField("theater", e.target.value)}
                                    className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none"
                                >
                                    <option value="">Select theater</option>
                                    {theaters.map((t) => (
                                        <option key={t._id || t.id} value={t._id || t.id}>{t.name}</option>
                                    ))}
                                </select>
                                {errors.theater && <p className="text-xs text-red-300 mt-1">{errors.theater}</p>}
                            </div>

                            <div>
                                <label className="text-sm text-white/70">Date *</label>
                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={(e) => setField("date", e.target.value)}
                                    className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none"
                                />
                                {errors.date && <p className="text-xs text-red-300 mt-1">{errors.date}</p>}
                            </div>

                            <div>
                                <label className="text-sm text-white/70">Start Time *</label>
                                <input
                                    type="time"
                                    value={form.startTime}
                                    onChange={(e) => setField("startTime", e.target.value)}
                                    className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none"
                                />
                                {errors.startTime && <p className="text-xs text-red-300 mt-1">{errors.startTime}</p>}
                            </div>

                            <div>
                                <label className="text-sm text-white/70">Total Seats *</label>
                                <input
                                    type="number" min="1"
                                    value={form.totalSeats}
                                    onChange={(e) => setField("totalSeats", e.target.value)}
                                    placeholder="120"
                                    className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none"
                                />
                                {errors.totalSeats && <p className="text-xs text-red-300 mt-1">{errors.totalSeats}</p>}
                            </div>

                            <div>
                                <label className="text-sm text-white/70">Price *</label>
                                <input
                                    type="number" step="0.01" min="0"
                                    value={form.price}
                                    onChange={(e) => setField("price", e.target.value)}
                                    placeholder="1500"
                                    className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none"
                                />
                                {errors.price && <p className="text-xs text-red-300 mt-1">{errors.price}</p>}
                            </div>
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
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                {mode === "edit" ? "Update Showtime" : "Create Showtime"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default function AdminShowtimesPage() {
    const [showtimes, setShowtimes] = useState([]);
    const [movies, setMovies] = useState([]);
    const [theaters, setTheaters] = useState([]);

    const [loading, setLoading] = useState(true);
    const [errText, setErrText] = useState("");

    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);

    const [showDelete, setShowDelete] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setErrText("");
        try {
            const [stRes, mRes, tRes] = await Promise.all([
                getAllShowTimes(),
                getAllMovies(),
                getAllTheater(),
            ]);
            const st = Array.isArray(stRes.data) ? stRes.data : stRes.data?.showtimes || [];
            setShowtimes(st);
            setMovies(Array.isArray(mRes.data) ? mRes.data : mRes.data?.movies || []);
            setTheaters(Array.isArray(tRes.data) ? tRes.data : tRes.data?.theaters || []);
        } catch (err) {
            setErrText(err?.response?.data?.message || "Failed to load showtimes");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const movieMap = useMemo(() => {
        const map = new Map();
        movies.forEach((m) => map.set(m._id || m.id, m.title));
        return map;
    }, [movies]);

    const theaterMap = useMemo(() => {
        const map = new Map();
        theaters.forEach((t) => map.set(t._id || t.id, t.name));
        return map;
    }, [theaters]);

    const rows = useMemo(() => showtimes, [showtimes]);

    const nameOfMovie = (m) => (typeof m === "string" ? movieMap.get(m) : m?.title) || "—";
    const nameOfTheater = (t) => (typeof t === "string" ? theaterMap.get(t) : t?.name) || "—";
    const bookedCount = (st) => Array.isArray(st.bookedSeats) ? st.bookedSeats.length : 0;
    const available = (st) => Number(st.totalSeats || 0) - bookedCount(st);

    const openCreate = () => { setEditTarget(null); setFormOpen(true); };
    const openEdit = (st) => { setEditTarget(st); setFormOpen(true); };

    const confirmDelete = (st) => { setDeleteTarget(st); setShowDelete(true); };
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const id = deleteTarget._id || deleteTarget.id;
            await deleteShowTime(id);
            setShowDelete(false);
            setDeleteTarget(null);
            fetchAll();
        } catch (err) {
            setErrText(err?.response?.data?.message || "Failed to delete showtime");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Showtimes</h2>
                    <p className="text-sm text-white/60">Manage all movie showtimes</p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
                >
                    <Plus className="w-4 h-4" /> Add New
                </button>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04]">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                        <tr className="text-left text-xs uppercase tracking-wider text-white/60 border-b border-white/10">
                            <th className="px-4 py-3">Movie</th>
                            <th className="px-4 py-3">Theater</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Start</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-10 text-center text-white/70">
                                    <div className="inline-flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Loading showtimes...
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
                                        title="No showtimes found"
                                        description="Add your first showtime to get started."
                                        actionLabel="Add New Showtime"
                                        onAction={openCreate}
                                        Icon={Calendar}
                                    />
                                </td>
                            </tr>
                        ) : (
                            rows.map((st) => (
                                <tr key={st._id || st.id} className="border-t border-white/10 hover:bg-white/[0.02]">
                                    <td className="px-4 py-3 text-sm text-white/90">
                      <span className="inline-flex items-center gap-2">
                        <Film className="w-4 h-4" />
                          {nameOfMovie(st.movie)}
                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-white/80">
                      <span className="inline-flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                          {nameOfTheater(st.theater)}
                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-white/80">
                                        {toDateInput(st.date)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-white/80">
                      <span className="inline-flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                          {st.startTime}
                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-white/80">
                      <span className="inline-flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                          {fmtCurrency(st.price)}
                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="inline-flex items-center gap-2">
                                            <button
                                                onClick={() => openEdit(st)}
                                                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.06] hover:bg-white/[0.12] inline-flex items-center gap-1.5 text-sm"
                                            >
                                                <Pencil className="w-4 h-4" /> Edit
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(st)}
                                                className="px-3 py-1.5 rounded-lg border border-white/10 bg-red-500/15 hover:bg-red-500/25 inline-flex items-center gap-1.5 text-sm"
                                            >
                                                <Trash2 className="w-4 h-4" /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal + Confirm */}
            <ShowtimeFormModal
                open={formOpen}
                mode={editTarget ? "edit" : "create"}
                initial={editTarget}
                onClose={() => setFormOpen(false)}
                onSaved={fetchAll}
                movies={movies}
                theaters={theaters}
            />

            <ConfirmDialog
                open={showDelete}
                title={`Delete showtime?`}
                description={`Are you sure you want to delete ${
                    nameOfMovie(deleteTarget?.movie)
                } at ${nameOfTheater(deleteTarget?.theater)} on ${toDateInput(deleteTarget?.date)} ${deleteTarget?.startTime || ""}?`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => { setShowDelete(false); setDeleteTarget(null); }}
                loading={deleting}
            />
        </div>
    );
}
