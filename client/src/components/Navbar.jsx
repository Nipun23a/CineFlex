import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkBase =
    "px-3 py-2 text-sm font-medium transition-colors duration-150";
const activeClasses = "text-white border-b-2 border-red-500";
const inactiveClasses = "text-white/90 hover:text-red-400";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout, loading } = useAuth();

    const closeMenu = () => setIsMenuOpen(false);

    const navItem = (to, label) => (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `${linkBase} ${isActive ? activeClasses : inactiveClasses}`
            }
            onClick={closeMenu}
        >
            {label}
        </NavLink>
    );

    return (
        <nav
            className="sticky top-0 z-50 backdrop-blur-md border-b border-gray-800"
            style={{ backgroundColor: "rgba(18, 18, 18, 0.9)" }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo -> home */}
                    <Link to="/" className="flex items-center" onClick={closeMenu}>
                        <div className="text-2xl font-bold">
                            <span className="text-white">Cine</span>
                            <span style={{ color: "#EF233C" }}>Flex</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-6">
                            {navItem("/", "Home")}
                            {navItem("/movies", "Movies")}
                            {user ? (
                                <>
                                    {navItem("/bookings", "Bookings")}
                                    {navItem("/profile", "Profile")}
                                    <button
                                        disabled={loading}
                                        onClick={logout}
                                        className="px-3 py-2 text-sm font-medium border border-red-500 rounded-md text-white hover:bg-red-500"
                                    >
                                        {loading ? "..." : "Logout"}
                                    </button>
                                </>
                            ) : (
                                <NavLink
                                    to="/login"
                                    className={({ isActive }) =>
                                        `${linkBase} ${
                                            isActive ? activeClasses : "text-white border border-red-500 rounded-md hover:bg-red-500"
                                        }`
                                    }
                                >
                                    Login
                                </NavLink>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen((v) => !v)}
                            className="text-white hover:text-red-400 p-2"
                            aria-label="Toggle menu"
                            aria-expanded={isMenuOpen}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div
                    className="md:hidden border-t border-gray-800"
                    style={{ backgroundColor: "#1E1E2F" }}
                >
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navItem("/", "Home")}
                        {navItem("/movies", "Movies")}

                        {user ? (
                            <>
                                {navItem("/bookings", "Bookings")}
                                {navItem("/profile", "Profile")}
                                <button
                                    disabled={loading}
                                    onClick={() => {
                                        logout();
                                        closeMenu();
                                    }}
                                    className="w-full text-white border border-red-500 hover:bg-red-500 block px-3 py-2 text-base font-medium rounded-md transition-all"
                                >
                                    {loading ? "..." : "Logout"}
                                </button>
                            </>
                        ) : (
                            <NavLink
                                to="/login"
                                onClick={closeMenu}
                                className="block text-white border border-red-500 hover:bg-red-500 px-3 py-2 text-base font-medium rounded-md transition-all"
                            >
                                Login
                            </NavLink>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;