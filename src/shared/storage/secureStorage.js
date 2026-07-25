import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const REFRESH_TOKEN_KEY = "refreshToken";

export async function getRefreshToken() {
    if (Platform.OS === "web") {
        return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function setRefreshToken(value) {
    if (Platform.OS === "web") {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, value);
        return;
    }
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, value);
}

export async function deleteRefreshToken() {
    if (Platform.OS === "web") {
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
        return;
    }
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
