
import './App.css'
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom';
import MainLayout from "./layouts/MainLayout.jsx";
import HomePage from "./pages/HomePage.jsx";

import MovieDetailPage from "./pages/MovieDetailPage.jsx";
import AllMoviePage from "./pages/AllMoviePage.jsx";

function App() {

    return (
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
            </Routes>
        </Router>
    )
}

export default App
