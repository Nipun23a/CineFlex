import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen text-white" style={{ backgroundColor: '#121212', fontFamily: 'Poppins, sans-serif' }}>
            <Navbar />
            <main>{children}</main>
            <Footer />
        </div>
    );
};

export default MainLayout;