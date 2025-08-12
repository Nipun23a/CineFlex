import { useState } from "react";
import Sidebar from "../components/admin/Sidebar.jsx";
import Header from "../components/admin/Header.jsx";

const AdminLayout = ({ children }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="min-h-screen text-white" style={{ backgroundColor: "#121212", fontFamily: "Poppins, sans-serif" }}>
            {/* Mobile drawer (only on < lg) */}
            <div className="lg:hidden">
                <Sidebar open={open} onClose={() => setOpen(false)} />
            </div>

            <div className="lg:grid lg:grid-cols-[16rem_1fr]">
                {/* Static desktop sidebar (only on >= lg) */}
                <div className="hidden lg:block">
                    <Sidebar open={true} onClose={() => setOpen(false)} />
                </div>

                <div className="min-h-screen flex flex-col">
                    <Header onMenu={() => setOpen(true)} />
                    <main className="p-4 lg:p-6">
                        <div className="mx-auto max-w-7xl space-y-6">{children}</div>
                    </main>
                    <footer className="border-t border-white/5 text-white/60 text-sm p-4 lg:p-6">
                        © {new Date().getFullYear()} CineFlexx Admin
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
