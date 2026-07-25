import { DeviceEventEmitter } from "react-native";

export const ACCOUNTS_UPDATED_EVENT = "banking:accounts-updated";

export function notifyAccountsUpdated() {
    DeviceEventEmitter.emit(ACCOUNTS_UPDATED_EVENT);
}
