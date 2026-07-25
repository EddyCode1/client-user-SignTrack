/**
 * @file roleUtils.js
 * @description Utilidades para la normalización, evaluación y control de accesos por roles de usuario.
 */

/**
 * Llaves válidas para identificar privilegios de administrador.
 * @type {readonly string[]}
 */
const ADMIN_ROLE_KEYS = Object.freeze(['ADMIN', 'ADMIN_ROLE']);

/**
 * Normaliza cualquier variante de rol proveniente del backend al formato estándar de la App.
 * @param {string} role - Rol crudo (ej: "admin", "USER_ROLE", "  Admin ").
 * @returns {'ADMIN_ROLE' | 'USER_ROLE'} Rol estandarizado.
 */
export function normalizeRole(role) {
  const value = String(role || '').trim().toUpperCase();
  if (!value) return 'USER_ROLE';
  return value.includes('ADMIN') ? 'ADMIN_ROLE' : 'USER_ROLE';
}

/**
 * Evalúa si una cadena de texto de rol posee privilegios de administrador.
 * @param {string} role - Rol a evaluar.
 * @returns {boolean} True si es administrador.
 */
export function isAdminRole(role) {
  const value = String(role || '').trim().toUpperCase();
  return ADMIN_ROLE_KEYS.includes(value) || value.includes('ADMIN');
}

/**
 * Extrae y normaliza el rol directamente desde un objeto de usuario.
 * Soporta las propiedades mapeadas por la app (`rol`) y las crudas del backend (`role`).
 * @param {Object} user - Objeto de usuario.
 * @returns {'ADMIN_ROLE' | 'USER_ROLE'} Rol extraído.
 */
export function getUserRole(user) {
  return normalizeRole(user?.rol || user?.role || '');
}

/**
 * Evalúa de forma directa si un objeto de usuario es administrador del sistema.
 * @param {Object} user - Objeto de usuario.
 * @returns {boolean} True si el usuario tiene privilegios de administrador.
 */
export function isAdminUser(user) {
  return isAdminRole(getUserRole(user));
}

const CLIENT_ROLE_KEYS = Object.freeze([
  'CLIENTE',
  'ROL_CLIENTE',
  'ROL_TYPE_CLIENTE',
  'USER_ROLE',
  'USER',
]);

/**
 * Evalúa si el rol corresponde a un cliente de la app.
 */
export function isClientRole(role) {
  const value = String(role || '').trim().toUpperCase();
  if (!value) return false;
  if (isAdminRole(value)) return false;
  return CLIENT_ROLE_KEYS.some((key) => value.includes(key)) || value.includes('CLIENT');
}

export default {
  normalizeRole,
  isAdminRole,
  getUserRole,
  isAdminUser,
  isClientRole,
};