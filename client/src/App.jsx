
import './App.css'
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom';
import MainLayout from "./layouts/MainLayout.jsx";
import HomePage from "./pages/HomePage.jsx";

import MovieDetailPage from "./pages/MovieDetailPage.jsx";
import AllMoviePage from "./pages/AllMoviePage.jsx";
import {LogIn} from "lucide-react";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import {AuthProvider} from "./context/AuthContext.jsx";
import SeatBookingPage from "./pages/SeatBookingPage.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import {loadStripe} from "@stripe/stripe-js";
import {Elements} from "@stripe/react-stripe-js";
import BookingsPage from "./pages/BookingPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function App() {

    return (
        <Elements stripe={stripePromise}>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <MainLayout>
                                    <HomePage />
                                </MainLayout>
                            }
                        />
                        <Route
                            path="/movies"
                            element={
                                <MainLayout>
                                    <AllMoviePage/>
                                </MainLayout>
                            }
                        />
                        <Route
                            path="/movies/:id"
                            element={
                                <MainLayout>
                                    <MovieDetailPage/>
                                </MainLayout>
                            }
                        />
                        <Route
                            path="/seat-booking"
                            element={<MainLayout><SeatBookingPage /></MainLayout>}
                        />
                        <Route
                            path="/bookings"
                            element={<MainLayout><BookingsPage/></MainLayout>}
                        />
                        <Route
                            path="/profile"
                            element={<MainLayout><ProfilePage/></MainLayout>}
                        />
                        <Route
                            path="/payment"
                            element={<MainLayout><PaymentPage/></MainLayout>}
                        />
                        {/* Admin*/}
                        <Route
                            path="/admin"
                            element={
                                <AdminLayout>
                                    <AdminDashboard/>
                                </AdminLayout>
                            }
                        />
                        {/* Auth */}
                        <Route
                            path='/login'
                            element={
                                <MainLayout>
                                    <LoginPage/>
                                </MainLayout>
                            }
                        />
                        <Route
                            path='/register'
                            element={
                                <MainLayout>
                                    <RegisterPage/>
                                </MainLayout>
                            }
                        />
                    </Routes>
                </Router>
            </AuthProvider>
        </Elements>
    )
}

export default App
