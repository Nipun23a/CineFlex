import { useLocation, useNavigate } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import {useAuth} from "../../context/AuthContext.jsx";


const Header = ({ onMenu }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const title = (() => {
        const parts = location.pathname.split("/").filter(Boolean);
        const last = parts[parts.length - 1] || "dashboard";
        return last.charAt(0).toUpperCase() + last.slice(1);
    })();

    const handleSignOut = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <header className="h-16 flex items-center gap-3 px-4 lg:px-6 border-b border-white/5 bg-[#141414]">
            <button
                className="lg:hidden p-2 rounded-lg hover:bg-white/5"
                onClick={onMenu}
            >
                <Menu className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-base font-semibold tracking-wide text-white">
                {title}
            </h1>
            <div className="ml-auto flex items-center gap-4">
                <div className="text-sm text-white/70">Admin</div>
                <div className="h-8 w-8 rounded-full bg-white/10 border border-white/10" />
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors text-sm font-medium"
                >
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
            </div>
        </header>
    );
};

export default Header;
