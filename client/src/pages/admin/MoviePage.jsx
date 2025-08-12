import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllMovies, createMovie, updateMovie, deleteMovie } from "../../utils/api.js";
import { Plus, Loader2, Pencil, Trash2, AlertCircle, X, Star ,Film} from "lucide-react";
import EmptyState from "../../components/ui/EmptyState.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";

// Helpers
const yearOf = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? "-" : d.getFullYear();
};
const toDateInput = (d) => {
    if (!d) return "";
    const date = typeof d === "string" ? new Date(d) : d;
    if (Number.isNaN(date?.getTime())) return "";
    return date.toISOString().slice(0, 10);
};
/** Reusable Create/Edit Modal (same form) */
function MovieFormModal({ open, mode = "create", initial = null, onClose, onSaved }) {
    const [form, setForm] = useState({
        title: "",
        description: "",
        genre: "",
        duration: "",
        releaseDate: "",
        language: "",
        rating: "",
        posterUrl: "",
        trailerUrl: "",
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;
        if (mode === "edit" && initial) {
            setForm({
                title: initial.title || "",
                description: initial.description || "",
                genre: Array.isArray(initial.genre) ? initial.genre.join(", ") : (initial.genre || ""),
                duration: initial.duration ?? "",
                releaseDate: toDateInput(initial.releaseDate),
                language: initial.language || "",
                rating: initial.rating ?? "",
                posterUrl: initial.posterUrl || "",
                trailerUrl: initial.trailerUrl || "",
            });
        } else {
            setForm({
                title: "",
                description: "",
                genre: "",
                duration: "",
                releaseDate: "",
                language: "",
                rating: "",
                posterUrl: "",
                trailerUrl: "",
            });
        }
        setErrors({});
        setSubmitting(false);
    }, [open, mode, initial]);

    const validate = () => {
        const e = {};
        if (!form.title.trim()) e.title = "Title is required";
        if (!form.releaseDate) e.releaseDate = "Release date is required";
        if (!form.duration) e.duration = "Duration (mins) is required";
        if (form.rating !== "" && (Number(form.rating) < 0 || Number(form.rating) > 10)) {
            e.rating = "Rating must be between 0 and 10";
        }
        return e;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const eobj = validate();
        setErrors(eobj);
        if (Object.keys(eobj).length) return;

        const payload = {
            title: form.title.trim(),
            description: form.description.trim(),
            genre: form.genre ? form.genre.split(",").map((g) => g.trim()).filter(Boolean) : [],
            duration: Number(form.duration),
            releaseDate: form.releaseDate,
            language: form.language.trim(),
            rating: form.rating === "" ? undefined : Number(form.rating),
            posterUrl: form.posterUrl.trim(),
            trailerUrl: form.trailerUrl.trim(),
        };

        setSubmitting(true);
        try {
            if (mode === "edit" && initial) {
                const id = initial._id || initial.id;
                await updateMovie(id, payload);
            } else {
                await createMovie(payload);
            }
            onSaved?.();
            onClose();
        } catch (err) {
            setErrors((prev) => ({
                ...prev,
                _server: err?.response?.data?.message || `Failed to ${mode === "edit" ? "update" : "create"} movie`,
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
                        <h2 className="text-base font-semibold">
                            {mode === "edit" ? "Edit Movie" : "Add New Movie"}
                        </h2>
                        <button className="p-2 rounded-lg hover:bg-white/5" onClick={onClose} aria-label="Close">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {errors._server && (
                        <div className="mx-5 mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                            {errors._server}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="px-5 pt-4 pb-5 grid gap-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-white/70">Title *</label>
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                                    placeholder="Movie title"
                                />
                                {errors.title && <p className="text-xs text-red-300 mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="text-sm text-white/70">Release Date *</label>
                                <input
                                    type="date"
                                    name="releaseDate"
                                    value={form.releaseDate}
                                    onChange={handleChange}
                                    className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                                />
                                {errors.releaseDate && <p className="text-xs text-red-300 mt-1">{errors.releaseDate}</p>}
                            </div>

                            <div>
                                <label className="text-sm text-white/70">Duration (mins) *</label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={form.duration}
                                    onChange={handleChange}
                                    min={1}
                                    className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                                    placeholder="148"
                                />
                                {errors.duration && <p className="text-xs text-red-300 mt-1">{errors.duration}</p>}
                            </div>

                            <div>
                                <label className="text-sm text-white/70">Genres (comma separated)</label>
                                <input
                                    name="genre"
                                    value={form.genre}
                                    onChange={handleChange}
                                    className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                                    placeholder="Action, Adventure"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-white/70">Language</label>
                                <input
                                    name="language"
                                    value={form.language}
                                    onChange={handleChange}
                                    className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                                    placeholder="English"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-white/70">Rating (0–10)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="10"
                                    name="rating"
                                    value={form.rating}
                                    onChange={handleChange}
                                    className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                                    placeholder="8.4"
                                />
                                {errors.rating && <p className="text-xs text-red-300 mt-1">{errors.rating}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm text-white/70">Poster URL</label>
                                <input
                                    name="posterUrl"
                                    value={form.posterUrl}
                                    onChange={handleChange}
                                    className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm text-white/70">Trailer URL</label>
                                <input
                                    name="trailerUrl"
                                    value={form.trailerUrl}
                                    onChange={handleChange}
                                    className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                                    placeholder="https://youtube.com/..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm text-white/70">Description</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                                    placeholder="Short synopsis"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-60"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                {mode === "edit" ? "Update Movie" : "Create Movie"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
export default function AdminMoviesPage() {
    const [movies, setMovies] = useState([]);
    const [open, setOpen] = useState(false);           // form modal
    const [editTarget, setEditTarget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errText, setErrText] = useState("");

    const [showDelete, setShowDelete] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchMovies = useCallback(async () => {
        setLoading(true);
        setErrText("");
        try {
            const res = await getAllMovies();
            setMovies(Array.isArray(res.data) ? res.data : res.data?.movies || []);
        } catch (err) {
            setErrText(err?.response?.data?.message || "Failed to load movies");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMovies(); }, [fetchMovies]);

    const rows = useMemo(() => movies, [movies]);

    const openCreate = () => { setEditTarget(null); setOpen(true); };
    const openEdit = (m) => { setEditTarget(m); setOpen(true); };

    const confirmDelete = (m) => { setDeleteTarget(m); setShowDelete(true); };
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const id = deleteTarget._id || deleteTarget.id;
            await deleteMovie(id);
            setShowDelete(false);
            setDeleteTarget(null);
            fetchMovies();
        } catch (err) {
            setErrText(err?.response?.data?.message || "Failed to delete movie");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header row */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Movies</h2>
                    <p className="text-sm text-white/60">Manage all movies in your catalog</p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
                >
                    <Plus className="w-4 h-4" />
                    Add New
                </button>
            </div>

            {/* Table card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04]">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                        <tr className="text-left text-xs uppercase tracking-wider text-white/60 border-b border-white/10">
                            <th className="px-4 py-3">Poster</th>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Genres</th>
                            <th className="px-4 py-3">Duration</th>
                            <th className="px-4 py-3">Release</th>
                            <th className="px-4 py-3">Rating</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-10 text-center text-white/70">
                                    <div className="inline-flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading movies...
                                    </div>
                                </td>
                            </tr>
                        ) : errText ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-10">
                                    <div className="mx-auto max-w-md rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                                        {errText}
                                    </div>
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4">
                                    <EmptyState
                                        title="No movies found"
                                        description="Add your first movie to get started."
                                        actionLabel="Add New Movie"
                                        onAction={openCreate}
                                        Icon={Film}
                                    />
                                </td>
                            </tr>
                        ) : (
                            rows.map((m) => (
                                <tr key={m._id || m.id} className="border-t border-white/10 hover:bg-white/[0.02]">
                                    <td className="px-4 py-3">
                                        <div className="h-14 w-10 rounded-md overflow-hidden bg-white/5 border border-white/10">
                                            {m.posterUrl ? (
                                                <img src={m.posterUrl} alt={m.title} className="h-full w-full object-cover" loading="lazy" />
                                            ) : null}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{m.title}</div>
                                        <div className="text-xs text-white/60 line-clamp-1">{m.description}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-white/80">
                                        {Array.isArray(m.genre) ? m.genre.join(", ") : m.genre || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-white/80">{m.duration ? `${m.duration}m` : "-"}</td>
                                    <td className="px-4 py-3 text-sm text-white/80">{yearOf(m.releaseDate)}</td>
                                    <td className="px-4 py-3 text-sm text-white/80">
                                        {m.rating != null ? (
                                            <span className="inline-flex items-center gap-1">
                          <Star className="w-4 h-4" />
                                                {Number(m.rating).toFixed(1)}
                        </span>
                                        ) : "-"}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="inline-flex items-center gap-2">
                                            <button
                                                onClick={() => openEdit(m)}
                                                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.06] hover:bg-white/[0.12] inline-flex items-center gap-1.5 text-sm"
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(m)}
                                                className="px-3 py-1.5 rounded-lg border border-white/10 bg-red-500/15 hover:bg-red-500/25 inline-flex items-center gap-1.5 text-sm"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
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

            {/* Create/Edit modal */}
            <MovieFormModal
                open={open}
                mode={editTarget ? "edit" : "create"}
                initial={editTarget}
                onClose={() => setOpen(false)}
                onSaved={fetchMovies}
            />

            {/* Delete confirm */}
            <ConfirmDialog
                open={showDelete}
                title={`Delete “${deleteTarget?.title || "this movie"}”?`}
                description="Are you sure you want to delete this movie? This action cannot be undone."
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
