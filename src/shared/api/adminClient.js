import axios from "axios";
import { ENDPOINTS } from "../constants/endpoints";
import authClient from "./authClient";
import { useAuthStore } from "../store/authStore";
import { getRefreshToken, setRefreshToken } from "../storage/secureStorage";

async function attemptProactiveRefresh() {
    const { token, expiresAt } = useAuthStore.getState();
    if (!token || !expiresAt) return false;
    const expiresIn = new Date(expiresAt).getTime() - Date.now();
    if (expiresIn > 5 * 60 * 1000 || expiresIn <= 0) return false;

    try {
        const rt = await getRefreshToken();
        if (!rt) return false;
        const { data } = await axios.post(`${ENDPOINTS.AUTH}/refresh`, { refreshToken: rt });
        const newToken = data.accessToken || data.token;
        const newRefreshToken = data.refreshToken || rt;
        const newExpiresAt = data.expiresAt || (data.expiresIn ? new Date(Date.now() + data.expiresIn * 1000).toISOString() : null);
        useAuthStore.getState().setAccessToken(newToken);
        if (newExpiresAt) useAuthStore.getState().setExpiresAt(newExpiresAt);
        await setRefreshToken(newRefreshToken);
        return true;
    } catch {
        return false;
    }
}

function attachAuthHeader(client) {
    client.interceptors.request.use(async (config) => {
        // Refresh proactivo si el token está por expirar
        await attemptProactiveRefresh();
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (config.data?.constructor?.name === "FormData") {
            delete config.headers["Content-Type"];
        }
        return config;
    });
    return client;
}

const publicClient = attachAuthHeader(
    axios.create({
        baseURL: ENDPOINTS.API,
        timeout: 10000, // 10 segundos timeout para evitar requests indefinidas
        headers: { "Content-Type": "application/json" },
    }),
);

// Reintentar con refresh automático en 401
publicClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/login") &&
            !originalRequest.url?.includes("/register")
        ) {
            originalRequest._retry = true;
            const refreshed = await attemptProactiveRefresh();
            if (refreshed) {
                const token = useAuthStore.getState().token;
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return publicClient(originalRequest);
            }
        }
        return Promise.reject(error);
    },
);

const adminClient = publicClient;

export { publicClient, authClient };
export default adminClient;
