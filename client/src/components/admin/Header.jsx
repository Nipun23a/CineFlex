import {useLocation} from "react-router-dom";
import {Menu} from "lucide-react";

const Header = ({onMenu}) => {
    const location = useLocation();
    const title = (()=>{
        const parts = location.pathname.split('/').filter(Boolean);
        const last = parts[parts.length -1] || "dashboard";
        return last.charAt(0).toUpperCase() +  last.slice(1);
    })();

    return (
        <header className="h-16 flex items-center gap-3 px-4 lg:px-6 border-b border-white/5 bg-[#141414]">
            <button className="lg:hidden p-2 rounded-lg hover:bg-white/5" onClick={onMenu}>
                <Menu className="w-5 h-5 text-white"/>
            </button>
            <h1 className="text-base font-semibold tracking-wide text-white">{title}</h1>
            <div className="ml-auto flex items-center gap-2">
                {/* room for admin actions/profile */}
                <div className="text-sm text-white/70">Admin</div>
                <div className="h-8 w-8 rounded-full bg-white/10 border border-white/10"/>
            </div>
        </header>
    );
};

export default Header;