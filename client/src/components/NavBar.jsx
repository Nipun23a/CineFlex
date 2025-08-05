import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout, loading } = useAuth();

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-gray-800"
             style={{ backgroundColor: 'rgba(18, 18, 18, 0.9)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <div className="text-2xl font-bold">
                            <span className="text-white">Cine</span>
                            <span style={{ color: '#EF233C' }}>Flex</span>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            <a href="#" className="px-3 py-2 text-sm font-medium" style={{ color: '#EF233C' }}>Home</a>
                            <a href="/movies"
                               className="text-white hover:text-red-400 px-3 py-2 text-sm font-medium">Movies</a>

                            {user ? (
                                <>
                                    <a href="/bookings"
                                       className="text-white hover:text-red-400 px-3 py-2 text-sm font-medium">Bookings</a>
                                    <a href="/profile"
                                       className="text-white hover:text-red-400 px-3 py-2 text-sm font-medium">Profile</a>
                                    <button
                                        onClick={logout}
                                        className="text-white hover:text-red-400 px-3 py-2 text-sm font-medium border border-red-500 rounded-md hover:bg-red-500 transition-all">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <a href="/login"
                                   className="text-white hover:text-red-400 px-3 py-2 text-sm font-medium border border-red-500 rounded-md hover:bg-red-500 transition-all">
                                    Login
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-white hover:text-red-400 p-2"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-800" style={{ backgroundColor: '#1E1E2F' }}>
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <a href="#" className="block px-3 py-2 text-base font-medium"
                           style={{ color: '#EF233C' }}>Home</a>
                        <a href="#"
                           className="text-white hover:text-red-400 block px-3 py-2 text-base font-medium">Movies</a>

                        {user ? (
                            <>
                                <a href="/bookings"
                                   className="text-white hover:text-red-400 block px-3 py-2 text-base font-medium">Bookings</a>
                                <a href="/profile"
                                   className="text-white hover:text-red-400 block px-3 py-2 text-base font-medium">Profile</a>
                                <button
                                    onClick={logout}
                                    className="w-full text-white border border-red-500 hover:bg-red-500 block px-3 py-2 text-base font-medium rounded-md transition-all">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <a href="/login"
                               className="text-white border border-red-500 hover:bg-red-500 block px-3 py-2 text-base font-medium rounded-md transition-all">
                                Login
                            </a>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}
export default Navbar;