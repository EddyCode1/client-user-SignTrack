import AsyncStorage from '@react-native-async-storage/async-storage';
import { dispatchStorageSync } from '../events/plataformEvents';

/**
 * Obtiene un elemento del almacenamiento asíncrono móvil.
 * @param {string} key - Clave del elemento.
 * @returns {Promise<string|null>} Valor almacenado o null.
 */
export async function getStorageItem(key) {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`[Storage] Error leyendo la clave ${key}:`, error.message);
    return null;
  }
}

/**
 * Guarda un elemento en el almacenamiento de forma persistente.
 * Envía un evento de sincronización a través del bus global.
 * @param {string} key - Clave del elemento.
 * @param {string} value - Valor en formato de texto.
 */
export async function setStorageItem(key, value) {
  try {
    await AsyncStorage.setItem(key, value);
    // Disparamos el bus de eventos nativo que configuraste para notificar a otras pantallas
    dispatchStorageSync({ key, newValue: value });
  } catch (error) {
    console.warn(`[Storage] No se pudo guardar la clave ${key}:`, error.message);
  }
}

/**
 * Remueve de forma definitiva un elemento del almacenamiento móvil.
 * @param {string} key - Clave del elemento.
 */
export async function removeStorageItem(key) {
  try {
    await AsyncStorage.removeItem(key);
    dispatchStorageSync({ key, newValue: null });
  } catch (error) {
    console.error(`[Storage] Error eliminando la clave ${key}:`, error.message);
  }
}

export default {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
};