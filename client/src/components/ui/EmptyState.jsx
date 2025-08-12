import { AlertCircle } from "lucide-react";

export default function EmptyState({
                                       title = "Nothing here yet",
                                       description = "Add your first item to get started.",
                                       actionLabel = "Add New",
                                       onAction,
                                       Icon = AlertCircle,
                                   }) {
    return (
        <div className="text-center py-16">
            <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-white/[0.06] grid place-items-center">
                {Icon ? <Icon className="w-6 h-6 text-white/70" /> : null}
            </div>
            <h3 className="text-white/90 font-semibold">{title}</h3>
            {description ? (
                <p className="text-sm text-white/60 mt-1">{description}</p>
            ) : null}
            {onAction ? (
                <button
                    onClick={onAction}
                    className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
                >
                    {actionLabel}
                </button>
            ) : null}
        </div>
    );
}
