import EventEmitter from 'eventemitter3';

// Instancia única global del emisor de eventos para toda la app móvil
const appEventEmitter = new EventEmitter();

/**
 * Despacha un evento global en la aplicación.
 * @param {string} name - Nombre del evento.
 * @param {any} [data] - Opcional: Datos adicionales que quieras transmitir en el evento.
 */
export function dispatchAppEvent(name, data) {
  appEventEmitter.emit(name, data);
}

/**
 * Se suscribe a un evento global y devuelve una función de limpieza para el useEffect.
 * @param {string} name - Nombre del evento.
 * @param {Function} handler - Callback que se ejecuta cuando el evento se dispara.
 * @returns {Function} Función para remover la suscripción.
 */
export function subscribeAppEvent(name, handler) {
  appEventEmitter.on(name, handler);
  
  // Retorno limpio para usar directo en el return de un useEffect
  return () => {
    appEventEmitter.off(name, handler);
  };
}

/**
 * Reemplazo de sincronización de almacenamiento para móviles.
 * En React Native usas AsyncStorage/MMKV en lugar de LocalStorage. Si necesitas
 * notificar a otras pantallas que un token o dato cambió en el storage, usas este puente.
 * @param {Function} handler - Callback que reacciona al cambio.
 * @returns {Function} Función para remover la suscripción.
 */
export function subscribeStorageSync(handler) {
  appEventEmitter.on('storage_sync', handler);
  return () => {
    appEventEmitter.off('storage_sync', handler);
  };
}

/**
 * Función auxiliar para detonar de forma manual la sincronización del storage
 * (Equivalente a cuando modificabas el localStorage en web).
 */
export function dispatchStorageSync(data) {
  appEventEmitter.emit('storage_sync', data);
}

export default {
  dispatchAppEvent,
  subscribeAppEvent,
  subscribeStorageSync,
  dispatchStorageSync,
};