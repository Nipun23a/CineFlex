import {Building2, CalendarClock, Film, LayoutDashboard, Settings, Ticket, Users,X} from "lucide-react";
import {NavLink} from "react-router-dom";

const Sidebar = ({ open, onClose }) => {
    const navItems = [
        { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
        { to: "/admin/movies", label: "Movies", icon: Film },
        { to: "/admin/theaters", label: "Theaters", icon: Building2 },
        { to: "/admin/showtimes", label: "Showtimes", icon: CalendarClock },
        { to: "/admin/bookings", label: "Bookings", icon: Ticket },
        { to: "/admin/users", label: "Users", icon: Users },
        { to: "/admin/settings", label: "Settings", icon: Settings },
    ];

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`lg:hidden fixed inset-0 z-40 bg-black/40 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />
            {/* Drawer (mobile) / Static column (desktop) */}
            <aside
                className={`
          z-50 lg:z-auto
          lg:relative lg:translate-x-0
          fixed top-0 left-0 h-full
          w-72 lg:w-64
          transition-transform
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          bg-[#181818] border-r border-white/5
          text-white
        `}
                style={{ fontFamily: "Poppins, sans-serif" }}
            >
                <div className="flex items-center justify-between px-5 h-16 border-b border-white/5">
                    <div className="text-xl font-bold tracking-wide">

                            <span className="text-white">Cine</span>
                            <span style={{color: '#EF233C'}}>Flex </span>
                            <span className="text-white/60">Admin</span>
                    </div>
                    <button className="lg:hidden p-2 rounded-lg hover:bg-white/5" onClick={onClose}>
                        <X className="w-5 h-5"/>
                    </button>
                </div>

                <nav className="px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map(({ to, label, icon: Icon, end }, index) => (
                        <button
                            key={to}
                            className={`w-full group flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left
                ${index === 0
                                ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                                : "text-white/80 hover:text-white hover:bg-white/[0.06]"
                            }`}
                        >
                            {Icon ? <Icon className="w-5 h-5 shrink-0" /> : null}
                            <span className="text-sm font-medium">{label}</span>
                            {index === 0 && (
                                <span
                                    className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400/80"
                                    aria-hidden
                                />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="px-4 pb-4 mt-auto">
                    <div className="rounded-xl bg-white/[0.04] border border-white/5 p-3">
                        <div className="text-xs text-white/60">System Status</div>
                        <div className="mt-1 text-sm">All services operational</div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
