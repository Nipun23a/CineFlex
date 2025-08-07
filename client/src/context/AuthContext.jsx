import {createContext, useContext, useEffect, useState} from "react";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user,setUser] = useState(null);
    const [loading,setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const userData = JSON.parse(localStorage.getItem('user'));
                setUser(userData);
            }catch (error){
                console.error('Token verification failed',error)
                logout()
            }
        }
        setLoading(false);
    }, []);

    const login = (userData,token) => {
        localStorage.setItem('token',token);
        localStorage.setItem('user',JSON.stringify(userData));
        setUser(userData);
    }

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    }

    return(
        <AuthContext value={{user,login,logout,loading}}>
            {children}
        </AuthContext>
    )
}
export const useAuth = () => useContext(AuthContext);