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

// ===================== USER APIs =====================
// Create Admin (Admin Only)
export const createAdmin = async (adminData) => {
    return await axiosInstance.post('/user/create-admin', adminData);
}

// Get All User (Admin Only)
export const getAllUsers = async () => {
    return await axiosInstance.get('/user');
}

// Update User Information
export const updateUser = async (userData) => {
    return await axiosInstance.post('/user/update',userData);
}

// Get User ID
export const getUserById = async (id) => {
    return await axiosInstance.get(`/user/${id}`);
}

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


// ===================== THEATER HALL APIs =====================
// Create a Theater (Admin Only)
export const createTheater = async (theaterData) => {
    return await axiosInstance.post('/theaters', theaterData);
}

// Get All
export const getAllTheater = async () =>{
    return await axiosInstance.get('/theaters')
}

// Get Theater By ID
export const getTheaterById = async (id) =>{
    return await axiosInstance.get(`/theaters/${id}`);
}

// Update Theater (Admin Only)
export const updateTheater = async (id, theaterData) => {
    return await axiosInstance.put(`/theaters/${id}`,theaterData);
}

// Delete Theater (Admin Only)
export const deleteTheater = async (id) =>{
    return await axiosInstance.delete(`/theaters/${id}`);
}

// ===================== SHOWTIME APIs =====================

// Create a showtime (Admin Only)
export const createShowTime = async (showTimeData) => {
    return await axiosInstance.post('/showtimes',showTimeData);
}

// Get All Showtime
export const getAllShowTimes = async () => {
    return await axiosInstance.get('/showtimes');
}

// Get Showtime by ID
export const getShowTimeById = async (id) =>{
    return await axiosInstance.get(`/showtimes/${id}`);
}

// Update the Showtime (Admin Only)
export const updateShowTime = async (id,showTimeData) => {
    return await axiosInstance.put(`/showtimes/${id}`,showTimeData)
}

// Delete the Showtime (Admin Only)
export const deleteShowTime = async (id) => {
    return await axiosInstance.delete(`/showtimes/${id}`);
}

// Get Showtime by Movie
export const getShowTimeByMovie = async (movieId) =>{
    return await axiosInstance.get(`/showtimes/movies/${movieId}`);
}

// ===================== BOOKING APIs =====================
// Create Booking
export const createBooking = async (bookingData) => {
    return await axiosInstance.post('/bookings',bookingData);
}
// Get All Booking
export const getAllBooking = async () =>{
    return await axiosInstance.get('/bookings');
}
// Get Booking By Id
export const getBookingById = async (id) => {
    return await axiosInstance.get(`/bookings/${id}`)
}

// Get Booking By User Id
export const getBookingByUser = async (userId) => {
    return await axiosInstance.get(`/bookings/user/${userId}`)
}


