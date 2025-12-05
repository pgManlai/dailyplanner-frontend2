import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000/api",
    withCredentials: true,
});

// Response interceptor - 401 (token expired) үед автоматаар login руу шилжүүлнэ
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Token expired эсвэл unauthorized
        if (error.response?.status === 401) {
            // localStorage цэвэрлэх
            try {
                localStorage.removeItem("flowday-user");
            } catch {
                // ignore
            }
            
            // Login page руу redirect (хэрэв login page дээр биш бол)
            if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
                window.location.href = "/login";
            }
        }
        
        return Promise.reject(error);
    }
);


export const send = async (route, data = {}) => {
    try {
        const res = await api.post(route, data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err;
    }
};

export const get = async (route) => {
    try {
        const res = await api.get(route);
        return res.data;
    } catch (err) {
        throw err.response?.data || err;
    }
};


export const update = async (route, data = {}) => {
    try {
        const res = await api.put(route, data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err;
    }
};


export const senddelete = async (route) => {
    try {
        const res = await api.delete(route);
        return res.data;
    } catch (err) {
        throw err.response?.data || err;
    }
};

export default {
    send,
    get,
    update,
    put: update, // alias for backward compatibility
    senddelete,
};
