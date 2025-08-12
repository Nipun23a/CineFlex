import { useCallback, useEffect, useMemo, useState } from "react";
import { createTheater, getAllTheater, updateTheater, deleteTheater } from "../../utils/api.js";
import { Plus, Loader2, Pencil, Trash2, X, Building2, MapPin } from "lucide-react";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";

/** Create/Edit Theater Modal (same form for both) */
function TheaterFormModal({ open, mode = "create", initial = null, onClose, onSaved }) {
    const [form, setForm] = useState({
        name: "",
        location: "",
        rows: "",
        seatsPerRow: "",
        screens: [{ name: "", totalSeats: "" }],
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;
        if (mode === "edit" && initial) {
            setForm({
                name: initial.name || "",
                location: initial.location || "",
                rows: initial.rows ?? "",
                seatsPerRow: initial.seatsPerRow ?? "",
                screens:
                    Array.isArray(initial.screens) && initial.screens.length
                        ? initial.screens.map((s) => ({
                            name: s?.name || "",
                            totalSeats: s?.totalSeats ?? "",
                        }))
                        : [{ name: "", totalSeats: "" }],
            });
        } else {
            setForm({ name: "", location: "", rows: "", seatsPerRow: "", screens: [{ name: "", totalSeats: "" }] });
        }
        setErrors({});
        setSubmitting(false);
    }, [open, mode, initial]);

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = "Name is required";
        if (!form.location.trim()) e.location = "Location is required";
        if (form.rows === "" || Number(form.rows) < 0) e.rows = "Rows must be 0 or more";
        if (form.seatsPerRow === "" || Number(form.seatsPerRow) < 0) e.seatsPerRow = "Seats/row must be 0 or more";
        const cleaned = (form.screens || []).filter((s) => s.name.trim() || s.totalSeats !== "");
        cleaned.forEach((s, i) => {
            if (s.name.trim() && (s.totalSeats === "" || Number(s.totalSeats) <= 0)) {
                e[`screens.${i}.totalSeats`] = "Total seats must be > 0";
            }
        });
        return e;
    };

    const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));
    const setScreenField = (i, key, value) =>
        setForm((f) => ({
            ...f,
            screens: f.screens.map((s, idx) => (idx === i ? { ...s, [key]: value } : s)),
        }));
    const addScreen = () => setForm((f) => ({ ...f, screens: [...f.screens, { name: "", totalSeats: "" }] }));
    const removeScreen = (i) =>
        setForm((f) => ({ ...f, screens: f.screens.filter((_, idx) => idx !== i) }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const eobj = validate();
        setErrors(eobj);
        if (Object.keys(eobj).length) return;

        const payload = {
            name: form.name.trim(),
            location: form.location.trim(),
            rows: form.rows === "" ? 0 : Number(form.rows),
            seatsPerRow: form.seatsPerRow === "" ? 0 : Number(form.seatsPerRow),
            screens: (form.screens || [])
                .map((s) => ({
                    name: s.name.trim(),
                    totalSeats: s.totalSeats === "" ? undefined : Number(s.totalSeats),
                }))
                .filter((s) => s.name && s.totalSeats && s.totalSeats > 0),
        };

        setSubmitting(true);
        try {
            if (mode === "edit" && initial) {
                const id = initial._id || initial.id;
                await updateTheater(id, payload);
            } else {
                await createTheater(payload);
            }
            onSaved?.();
            onClose();
        } catch (err) {
            setErrors((prev) => ({
                ...prev,
                _server: err?.response?.data?.message || `Failed to ${mode === "edit" ? "update" : "create"} theater`,
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
                        <h2 className="text-base font-semibold">{mode === "edit" ? "Edit Theater" : "Add New Theater"}</h2>
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
                                <label className="text-sm text-white/70">Name *</label>
                                <input
                                    className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                                    placeholder="CineFlexx Downtown"
                                    value={form.name}
                                    onChange={(e) => setField("name", e.target.value)}
                                />
                                {errors.name && <p className="text-xs text-red-300 mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="text-sm text-white/70">Location *</label>
                                <input
                                    className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                                    placeholder="123 Main St, City"
                                    value={form.location}
                                    onChange={(e) => setField("location", e.target.value)}
                                />
                                {errors.location && <p className="text-xs text-red-300 mt-1">{errors.location}</p>}
                            </div>

                            <div>
                                <label className="text-sm text-white/70">Rows *</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                                    placeholder="10"
                                    value={form.rows}
                                    onChange={(e) => setField("rows", e.target.value)}
                                />
                                {errors.rows && <p className="text-xs text-red-300 mt-1">{errors.rows}</p>}
                            </div>

                            <div>
                                <label className="text-sm text-white/70">Seats per Row *</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="mt-1 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                                    placeholder="12"
                                    value={form.seatsPerRow}
                                    onChange={(e) => setField("seatsPerRow", e.target.value)}
                                />
                                {errors.seatsPerRow && <p className="text-xs text-red-300 mt-1">{errors.seatsPerRow}</p>}
                            </div>
                        </div>

                        {/* Screens (optional) */}
                        <div className="mt-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-white/70">Screens (optional)</label>
                                <button type="button" onClick={addScreen} className="text-sm px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10">
                                    Add Screen
                                </button>
                            </div>

                            <div className="mt-2 space-y-2">
                                {form.screens.map((s, i) => (
                                    <div key={i} className="grid md:grid-cols-[1fr_12rem_auto] gap-2">
                                        <input
                                            placeholder="Screen A"
                                            className="rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                                            value={s.name}
                                            onChange={(e) => setScreenField(i, "name", e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="Total seats"
                                            className="rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                                            value={s.totalSeats}
                                            onChange={(e) => setScreenField(i, "totalSeats", e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeScreen(i)}
                                            className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10"
                                        >
                                            Remove
                                        </button>
                                        {errors[`screens.${i}.totalSeats`] && (
                                            <p className="md:col-span-3 text-xs text-red-300">{errors[`screens.${i}.totalSeats`]}</p>
                                        )}
                                    </div>
                                ))}
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
                                {mode === "edit" ? "Update Theater" : "Create Theater"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default function AdminTheatersPage() {
    const [theaters, setTheaters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errText, setErrText] = useState("");

    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);

    const [showDelete, setShowDelete] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchTheaters = useCallback(async () => {
        setLoading(true);
        setErrText("");
        try {
            const res = await getAllTheater();
            setTheaters(Array.isArray(res.data) ? res.data : res.data?.theaters || []);
        } catch (err) {
            setErrText(err?.response?.data?.message || "Failed to load theaters");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTheaters(); }, [fetchTheaters]);

    const rows = useMemo(() => theaters, [theaters]);
    const openCreate = () => { setEditTarget(null); setFormOpen(true); };
    const openEdit = (t) => { setEditTarget(t); setFormOpen(true); };

    const confirmDelete = (t) => { setDeleteTarget(t); setShowDelete(true); };
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const id = deleteTarget._id || deleteTarget.id;
            await deleteTheater(id);
            setShowDelete(false);
            setDeleteTarget(null);
            fetchTheaters();
        } catch (err) {
            setErrText(err?.response?.data?.message || "Failed to delete theater");
        } finally {
            setDeleting(false);
        }
    };

    const capacity = (t) => (Number(t?.rows || 0) * Number(t?.seatsPerRow || 0));
    const screenCount = (t) => (Array.isArray(t?.screens) ? t.screens.length : 0);
    const screenSeats = (t) =>
        Array.isArray(t?.screens) ? t.screens.reduce((sum, s) => sum + (Number(s?.totalSeats) || 0), 0) : 0;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Theaters</h2>
                    <p className="text-sm text-white/60">Manage all theaters and screens</p>
                </div>
                <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10">
                    <Plus className="w-4 h-4" /> Add New
                </button>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04]">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                        <tr className="text-left text-xs uppercase tracking-wider text-white/60 border-b border-white/10">
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Location</th>
                            <th className="px-4 py-3">Rows</th>
                            <th className="px-4 py-3">Seats/Row</th>
                            <th className="px-4 py-3">Capacity</th>
                            <th className="px-4 py-3">Screens</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-10 text-center text-white/70">
                                    <div className="inline-flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Loading theaters...
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
                                        title="No theater found"
                                        description="Add your first theater to get started."
                                        actionLabel="Add New Theater"
                                        onAction={openCreate}
                                        Icon={Building2}
                                    />
                                </td>
                            </tr>
                        ) : (
                            rows.map((t) => (
                                <tr key={t._id || t.id} className="border-t border-white/10 hover:bg-white/[0.02]">
                                    <td className="px-4 py-3">
                                        <div className="font-medium inline-flex items-center gap-2">
                                            <Building2 className="w-4 h-4" />
                                            {t.name}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-white/80">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                          {t.location}
                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-white/80">{t.rows ?? "-"}</td>
                                    <td className="px-4 py-3 text-sm text-white/80">{t.seatsPerRow ?? "-"}</td>
                                    <td className="px-4 py-3 text-sm text-white/80">{capacity(t)}</td>
                                    <td className="px-4 py-3 text-sm text-white/80">
                                        {screenCount(t)}{screenCount(t) ? ` • ${screenSeats(t)} seats` : ""}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="inline-flex items-center gap-2">
                                            <button
                                                onClick={() => openEdit(t)}
                                                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.06] hover:bg-white/[0.12] inline-flex items-center gap-1.5 text-sm"
                                            >
                                                <Pencil className="w-4 h-4" /> Edit
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(t)}
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
            <TheaterFormModal
                open={formOpen}
                mode={editTarget ? "edit" : "create"}
                initial={editTarget}
                onClose={() => setFormOpen(false)}
                onSaved={fetchTheaters}
            />

            <ConfirmDialog
                open={showDelete}
                title={`Delete “${deleteTarget?.title || "this theater"}”?`}
                description="Are you sure you want to delete this theater? This action cannot be undone."
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
