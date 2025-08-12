import { Loader2, AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
                                          open,
                                          title = "Are you sure?",
                                          description = "This action cannot be undone.",
                                          confirmLabel = "Confirm",
                                          cancelLabel = "Cancel",
                                          onConfirm,
                                          onCancel,
                                          loading = false,
                                          variant = "danger", // "danger" | "default"
                                          Icon = AlertTriangle,
                                      }) {
    if (!open) return null;

    const confirmClasses =
        variant === "danger"
            ? "bg-red-500/20 hover:bg-red-500/30"
            : "bg-white/[0.06] hover:bg-white/[0.12]";

    return (
        <>
            <div className="fixed inset-0 z-[60] bg-black/50" onClick={onCancel} />
            <div className="fixed z-[70] inset-0 grid place-items-center p-4">
                <div className="w-full max-w-md rounded-2xl bg-[#161616] border border-white/10 p-5">
                    <div className="flex items-start gap-3">
                        {Icon ? <Icon className="w-5 h-5 mt-0.5 text-white/80" /> : null}
                        <div>
                            <h3 className="text-base font-semibold">{title}</h3>
                            {description ? (
                                <p className="text-sm text-white/70 mt-1">{description}</p>
                            ) : null}
                        </div>
                    </div>

                    <div className="mt-5 flex justify-end gap-2">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className={`px-4 py-2 rounded-xl border border-white/10 disabled:opacity-60 ${confirmClasses}`}
                        >
                            {loading ? <Loader2 className="w-4 h-4 inline animate-spin" /> : confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
