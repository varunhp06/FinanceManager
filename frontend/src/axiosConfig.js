import axios from "axios";

axios.defaults.baseURL = "http://localhost:8080"; // Spring Boot backend port

axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    console.log("Using token:", token);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});