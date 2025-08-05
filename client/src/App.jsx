
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

function App() {

    return (
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

    )
}

export default App
