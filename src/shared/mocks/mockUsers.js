/**
 * @file mockUsers.js
 * @description Datos de ejemplo (Mock) para testing en entorno de desarrollo.
 * Se muestran de forma controlada cuando la sesión es administrada por la cuenta ADMINB.
 */

export const MOCK_USERS = [
  {
    id: 'user-001',
    nombre: 'Juan García López',
    username: 'jgarcia',
    email: 'juan.garcia@banco.com',
    telefono: '55443322',
    dpi: '3021457890101',
    rol: 'USER_ROLE',
    status: 'active',
    direccion: 'Calle Principal 123, Tecpán',
    workName: 'Corporación Comercial S.A.',
    monthlyIncome: 4500.00,
    cuentas: [
      { id: 'account-001', numero: '1234567890', tipo: 'Ahorros', saldo: 5000.5, estado: 'active' },
      { id: 'account-002', numero: '0987654321', tipo: 'Corriente', saldo: 2150.75, estado: 'active' },
    ],
  },
  {
    id: 'user-002',
    nombre: 'María Rodríguez Pérez',
    username: 'mrodriguez',
    email: 'maria.rodriguez@banco.com',
    telefono: '44332211',
    dpi: '1982345670101',
    rol: 'USER_ROLE',
    status: 'active',
    direccion: 'Avenida La Reforma 4-56, Zona 10',
    workName: 'Hospital de Diagnóstico',
    monthlyIncome: 8900.00,
    cuentas: [
      { id: 'account-003', numero: '5555555555', tipo: 'Ahorros', saldo: 8900.0, estado: 'active' },
    ],
  },
  {
    id: 'user-003',
    nombre: 'Carlos Martínez Sánchez',
    username: 'cmartinez',
    email: 'carlos.martinez@banco.com',
    telefono: '33221100',
    dpi: '2541987630401',
    rol: 'USER_ROLE',
    status: 'inactive',
    direccion: 'Plaza Central 7-89, Chimaltenango',
    workName: 'Logística Interamericana',
    monthlyIncome: 3200.25,
    cuentas: [
      { id: 'account-004', numero: '3333333333', tipo: 'Corriente', saldo: 3200.25, estado: 'active' },
      { id: 'account-005', numero: '4444444444', tipo: 'Inversión', saldo: 15000.0, estado: 'active' },
      { id: 'account-006', numero: '6666666666', tipo: 'Ahorros', saldo: 1500.0, estado: 'inactive' },
    ],
  },
  {
    id: 'user-004',
    nombre: 'Ana Fernández López',
    username: 'afernandez',
    email: 'ana.fernandez@banco.com',
    telefono: '58741236',
    dpi: '4102589630101',
    rol: 'USER_ROLE',
    status: 'pending',
    direccion: '',
    workName: 'Independiente',
    monthlyIncome: 1200.00,
    cuentas: [
      { id: 'account-007', numero: '7777777777', tipo: 'Ahorros', saldo: 4500.75, estado: 'active' },
    ],
  },
  {
    id: 'user-005',
    nombre: 'Pedro González López',
    username: 'pgonzalez',
    email: 'pedro.gonzalez@banco.com',
    telefono: '22334455',
    dpi: '1025741250101',
    rol: 'USER_ROLE',
    status: 'inactive',
    direccion: '',
    workName: 'N/A',
    monthlyIncome: 0.00,
    cuentas: [],
  },
];

/** * Email/username del administrador de testing (ADMINB).
 * Si la sesión coincide con estos valores, se intercepta la carga para inyectar MOCK_USERS.
 */
export const TESTING_ADMIN_CREDENTIALS = Object.freeze({
  username: 'ADMINB',
  email: 'admin@bank.com',
});

export default {
  MOCK_USERS,
  TESTING_ADMIN_CREDENTIALS,
};