import authClient from '../authClient';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await authClient.post('/login', { email, password });
      const data = response.data;
      return {
        success: true,
        token: data?.accessToken || data?.token || null,
        refreshToken: data?.refreshToken || null,
        expiresAt: data?.expiresAt || (data?.expiresIn ? new Date(Date.now() + data.expiresIn * 1000).toISOString() : null),
        user: data?.userDetails || data?.user || data?.data || null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  register: async (payload) => {
    try {
      // Validate payload before sending
      const { nombre, username, email, telefono, password } = payload;
      
      // Validar campos requeridos
      if (!nombre || !username || !email || !telefono || !password) {
        return {
          success: false,
          error: 'Todos los campos son requeridos',
        };
      }

      // Validar nombre: mínimo 2 caracteres
      if (nombre.trim().length < 2) {
        return {
          success: false,
          error: 'El nombre debe tener al menos 2 caracteres',
        };
      }

      // Validar email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          error: 'Correo electrónico inválido',
        };
      }

      // Validar teléfono: exactamente 8 dígitos
      const phoneRegex = /^\d{8}$/;
      if (!phoneRegex.test(telefono)) {
        return {
          success: false,
          error: 'El teléfono debe tener exactamente 8 dígitos',
        };
      }

      // Validar password: al menos 6 caracteres y 1 mayúscula
      if (password.length < 6) {
        return {
          success: false,
          error: 'La contraseña debe tener al menos 6 caracteres',
        };
      }
      if (!/[A-Z]/.test(password)) {
        return {
          success: false,
          error: 'La contraseña debe tener al menos una mayúscula',
        };
      }

      const response = await authClient.post('/register', payload);
      console.log('Register success response:', response.data);
      return {
        success: true,
        data: response.data?.data || response.data || null,
      };
    } catch (error) {
      const errorData = error.response?.data;
      const validationErrors = errorData?.errors || [];
      const errorMessage = errorData?.message || 
                          errorData?.error || 
                          error.message;
      
      // Log detailed validation errors
      console.error('Register error - Status:', error.response?.status);
      console.error('Register error - Message:', errorMessage);
      console.error('Register error - Validation Errors:', validationErrors);
      console.error('Register error - Full Response:', errorData);
      
      // Also log each error individually for clarity
      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        validationErrors.forEach((err, index) => {
          console.error(`  Error ${index + 1}:`, err);
        });
      }

      // Format error message with validation details
      let displayError = errorMessage || 'No se pudo crear la cuenta';
      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        const errorDetails = validationErrors
          .map(err => {
            if (typeof err === 'string') return err;
            if (err.message) return err.message;
            if (err.field && err.msg) return `${err.field}: ${err.msg}`;
            if (err.field) return err.field;
            return JSON.stringify(err);
          })
          .filter(Boolean)
          .join('; ');
        if (errorDetails) {
          displayError = `${displayError}: ${errorDetails}`;
        }
      }

      return {
        success: false,
        error: displayError,
        details: errorData,
      };
    }
  },
};

export default authService;
