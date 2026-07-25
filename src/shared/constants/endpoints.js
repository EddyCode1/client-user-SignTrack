import { Platform } from "react-native";
import Constants from "expo-constants";

const DEV_MACHINE_IP = process.env.EXPO_PUBLIC_DEV_HOST || "localhost";
const API_PORT = process.env.EXPO_PUBLIC_API_PORT || "3006";
const BASE_PATH = "/GestorRestaurante/v1";

/**
 * Resuelve el host según plataforma: emulador Android (10.0.2.2),
 * simulador iOS (localhost) o dispositivo físico (IP de la máquina de desarrollo).
 */
export function getHost() {
    if (Platform.OS === "android") {
        return Constants.isDevice ? DEV_MACHINE_IP : "10.0.2.2";
    }
    return Constants.isDevice ? DEV_MACHINE_IP : "localhost";
}

export function getApiBaseUrl(port = API_PORT, pathPrefix = BASE_PATH) {
    return `http://${getHost()}:${port}${pathPrefix}`;
}

export const ENDPOINTS = {
    AUTH:
        process.env.EXPO_PUBLIC_AUTH_URL ||
        `${getApiBaseUrl()}/auth`,
    API:
        process.env.EXPO_PUBLIC_API_BASE ||
        getApiBaseUrl(),
    BANKING:
        process.env.EXPO_PUBLIC_BANKING_API_BASE ||
        getApiBaseUrl(3000, "/SistemaBancarioAdmin/v1"),
};
