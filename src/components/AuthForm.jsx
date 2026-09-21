import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AuthForm = ({ type = 'login' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const isLogin = type === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const url = isLogin ? 'http://localhost:5000/api/login' : 'http://localhost:5000/api/register';
    const bodyData = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          // Guardar token y datos en contexto
          login(data.token, data.user);
          // Redirigir según rol
          if (data.user.role === 'admin') navigate('/admin');
          else navigate('/dashboard');
        } else {
          // Si es registro, redirigimos a login
          navigate('/login');
          alert('Registro exitoso. Ahora puedes iniciar sesión.');
        }
      } else {
        // Mostrar mensaje del backend
        setError(data.message || 'Ocurrió un error');
      }
    } catch (err) {
      setError('No se pudo conectar al servidor. Revisa si el backend Flask está corriendo en el puerto 5000.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-100">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-light text-white font-bold text-xl mb-4">
          SN
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </h2>
        <p className="text-gray-500 text-sm mt-2">
          {isLogin ? 'Ingresa a tu plataforma educativa' : 'Únete a Sentir Nacer hoy mismo'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
              placeholder="Ej. María Pérez"
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
          <input 
            type="email" 
            required
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
          {isLoading ? 'Cargando...' : (isLogin ? 'Ingresar' : 'Registrarse')}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
