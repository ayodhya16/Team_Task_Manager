import { createContext, useState, useEffect, Children } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);


// load user from localstorage on refresh
const login = async (email, password) => {
    try{
        const res = await api.post("/auth/login", {email, password});

        const { token, user} = res.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        setUser(user);

        return {success : true};

    }
    catch(err){
        return{
            success: false,
            message : err.response?.data?.error || "Login failed",
        };
    }
};

// register function
const register = async (name, email, password) =>{
    try{
        await api.post("/auth/register", {name, email, password});

        return {success : true}

    }
    catch(err){
        return{
            success :false,
            message : err.response?.data?.err || "Registration failed",
        };
    }
}

//logout
const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
};

return(
    <AuthContext.Provider value = {{user, login, register, logout}}>
        {children}
    </AuthContext.Provider>
);
};