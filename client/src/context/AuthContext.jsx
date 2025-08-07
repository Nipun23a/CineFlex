import {createContext, useContext, useEffect, useState} from "react";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user,setUser] = useState(null);
    const [loading,setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const userStr = localStorage.getItem('user')|| sessionStorage.getItem('user');
        if (token && userStr) {
            try {
                const userData = JSON.parse(userStr);
                setUser(userData);
            }catch (error){
                console.log('Token verfication failed:',error);
                logout()
            }
        }
        setLoading(false);

        }, []);

   const login = (userData,token,remeberMe=false)=>{
       if (remeberMe){
           localStorage.setItem('token',token);
           localStorage.setItem('user',JSON.stringify(userData));
       }else {
           sessionStorage.setItem('token',token);
           sessionStorage.setItem('user',JSON.stringify(userData));
       }
       setUser(userData)
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