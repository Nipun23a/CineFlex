import axios from "axios";

const API_URL = 'http://localhost:5000/api';

// Get token from localStorage or sessionStorage
const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');

// Create a single axios instance
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
    },
});

// ===================== AUTH APIs =====================

// Login
export const loginUser = async (userData) => {
    return await axiosInstance.post('/auth/login', userData);
};

// Register
export const registerUser = async (userData) => {
    return await axiosInstance.post('/auth/register', userData);
};

// Update Password
export const updatePassword = async (passwordData) => {
    return await axiosInstance.put('/auth/update-password', passwordData);
};


// ===================== MOVIE APIs =====================

// Create Movie (Admin only)
export const createMovie = async (movieData) => {
    return await axiosInstance.post('/movies', movieData);
};

// Get All Movies
export const getAllMovies = async () => {
    return await axiosInstance.get('/movies');
};

// Get Movie by ID
export const getMovieById = async (id) => {
    return await axiosInstance.get(`/movies/${id}`);
};

// Update Movie (Admin only)
export const updateMovie = async (id, movieData) => {
    return await axiosInstance.put(`/movies/${id}`, movieData);
};

// Delete Movie (Admin only)
export const deleteMovie = async (id) => {
    return await axiosInstance.delete(`/movies/${id}`);
};

