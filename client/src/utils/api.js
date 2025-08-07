import axios from "axios";

const API_URL = 'http://localhost:5000/api';

// Authentication Backend API
export const loginUser = async (userData) =>{
    return await axios.post(`${API_URL}/auth/login`,userData);
}

export const registerUser = async (userData) => {
    return await axios.post(`${API_URL}/auth/register`,userData);
}

export const updatePassword = async (passwordData, token) => {
    return await axios.put(`${API_URL}/auth/update-password`, passwordData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

