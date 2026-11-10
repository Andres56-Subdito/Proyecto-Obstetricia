import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// Traduce los códigos de error de Firebase a mensajes en español.
// Para cambiar un mensaje, edita el texto de la derecha.
const AUTH_ERRORS = {
  'auth/invalid-credential': 'Correo o contraseña incorrectos',
  'auth/invalid-email': 'El correo no es válido',
  'auth/user-not-found': 'Correo o contraseña incorrectos',
  'auth/wrong-password': 'Correo o contraseña incorrectos',
  'auth/user-disabled': 'Esta cuenta está deshabilitada',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo',
  'auth/network-request-failed': 'Sin conexión con Firebase. Revisa tu internet',
  'app/no-profile': 'Tu cuenta no tiene acceso a la plataforma. Contacta al administrador',
  'permission-denied': 'Tu cuenta no tiene acceso a la plataforma. Contacta al administrador',
};

// Formulario de INICIO DE SESIÓN (no hay registro: las cuentas las crea el administrador).
// Al iniciar sesión correctamente, App.jsx detecta el usuario y lo redirige según su rol.
const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(AUTH_ERRORS[err.code] || 'Ocurrió un error. Inténtalo de nuevo');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-100">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-light text-white font-bold text-xl mb-4">
          SN
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Iniciar Sesión</h2>
        <p className="text-gray-500 text-sm mt-2">Ingresa a tu plataforma educativa</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
            placeholder="tu@correo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-md transition-colors shadow-sm mt-2 disabled:opacity-50"
        >
          {isLoading ? 'Cargando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
