import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://localhost:7158",
});

axiosInstance.interceptors.request.use((config) => {
  let token = null;
  try {
    const persistedRoot = localStorage.getItem("persist:user");

if (persistedRoot) {
    const parsed = JSON.parse(persistedRoot);

    if (parsed.auth) {
        const auth = JSON.parse(parsed.auth);
        token = auth.token;
    }
}
  } catch (error) {
    console.error("Error parsing persisted user data:", error);
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

export default axiosInstance;
