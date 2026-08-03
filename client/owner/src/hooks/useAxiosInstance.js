import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://localhost:7158",
});

axiosInstance.interceptors.request.use((config) => {
  try {
    const persistedRoot = localStorage.getItem("persist:root");

    if (persistedRoot) {
      const parsedRoot = JSON.parse(persistedRoot);

      if (parsedRoot.auth) {
        const auth = JSON.parse(parsedRoot.auth);

        if (auth.token) {
          config.headers.Authorization = `Bearer ${auth.token}`;
        }
      }
    }
  } catch (err) {
    console.error(err);
  }

  return config;
});
export default axiosInstance;