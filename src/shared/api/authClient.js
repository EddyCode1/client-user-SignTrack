import axios from "axios";
import { useAuthStore } from "../store/authStore";
import {
    deleteRefreshToken,
    getRefreshToken,
    setRefreshToken,
} from "../storage/secureStorage";
import { ENDPOINTS } from "../constants/endpoints";

const authClient = axios.create({
    baseURL: ENDPOINTS.AUTH,
    headers: {
        "Content-Type": "application/json",
    },
});

authClient.interceptors.request.use(async (config) => {
    const { token, expiresAt } = useAuthStore.getState();

    // Refresh proactivo: si el token expira en menos de 5 min, renovar antes
    if (token && expiresAt) {
        const now = Date.now();
        const expireTime = typeof expiresAt === 'number' ? expiresAt * 1000 : new Date(expiresAt).getTime();
        const remaining = expireTime - now;
        if (remaining < 5 * 60 * 1000 && remaining > 0) {
            try {
                const refreshToken = await getRefreshToken();
                if (refreshToken) {
                    const { data } = await axios.post(`${ENDPOINTS.AUTH}/refresh`, { refreshToken });
                    const newToken = data.accessToken || data.token;
                    const newRefreshToken = data.refreshToken || refreshToken;
                    const newExpiresAt = data.expiresAt || (data.expiresIn ? new Date(Date.now() + data.expiresIn * 1000).toISOString() : null);
                    useAuthStore.getState().setAccessToken(newToken);
                    if (newExpiresAt) {
                        useAuthStore.getState().setExpiresAt(newExpiresAt);
                    }
                    await setRefreshToken(newRefreshToken);
                    config.headers.Authorization = `Bearer ${newToken}`;
                    return config;
                }
            } catch {
                // Si falla el refresh proactivo, se deja el token actual
                // El interceptor de respuesta manejara el 401 si expira
            }
        }
    }

    const currentToken = useAuthStore.getState().token;
    if (currentToken) config.headers.Authorization = `Bearer ${currentToken}`;
    return config;
});

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
    failedQueue.forEach(({ resolve, reject }) =>
        error ? reject(error) : resolve(token),
    );
    failedQueue = [];
}

authClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const requestUrl = originalRequest?.url || "";

        const isAuthEndpoint =
            requestUrl.includes("/login") ||
            requestUrl.includes("/register") ||
            requestUrl.includes("/forgot-password") ||
            requestUrl.includes("/reset-password") ||
            requestUrl.includes("/verify-email") ||
            requestUrl.includes("/resend-verification");

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !requestUrl.includes("/refresh") &&
            !isAuthEndpoint
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return authClient(originalRequest);
                });
            }
            originalRequest._retry = true;
            isRefreshing = true;
            try {
                const refreshToken = await getRefreshToken();
                if (!refreshToken) throw new Error("No refresh token");
                const { data } = await axios.post(`${ENDPOINTS.AUTH}/refresh`, {
                    refreshToken,
                });
                const accessToken = data.accessToken || data.token;
                const newRefreshToken = data.refreshToken || refreshToken;
                const newExpiresAt = data.expiresAt || (data.expiresIn ? new Date(Date.now() + data.expiresIn * 1000).toISOString() : null);
                useAuthStore.getState().setAccessToken(accessToken);
                if (newExpiresAt) {
                    useAuthStore.getState().setExpiresAt(newExpiresAt);
                }
                await setRefreshToken(newRefreshToken);
                processQueue(null, accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return authClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                await deleteRefreshToken();
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    },
);

export default authClient;
