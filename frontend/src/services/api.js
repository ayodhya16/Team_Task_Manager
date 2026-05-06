import axios from "axios";

const api = axios.create({
    baseURL: "https://teamtaskmanager-production-e9c9.up.railway.app/api",
});

api.interceptors.request.use((config)=>{
    const token = localStorage.getItem("token");
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;