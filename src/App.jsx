import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Lesson from './pages/Lesson';
import AdminPanel from './pages/AdminPanel';
import AuthForm from './components/AuthForm';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Rutas Protegidas
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="text-center p-10">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />; // Bloquear si no es el rol adecuado

  return children;
};

// Vistas de Autenticación
const LoginPage = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <AuthForm type="login" />
    <p className="mt-4 text-center text-sm text-gray-600">
      ¿No tienes cuenta? <Link to="/register" className="text-primary font-medium hover:underline">Regístrate</Link>
    </p>
  </div>
);

const RegisterPage = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <AuthForm type="register" />
    <p className="mt-4 text-center text-sm text-gray-600">
      ¿Ya tienes cuenta? <Link to="/login" className="text-primary font-medium hover:underline">Inicia Sesión</Link>
    </p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <div className="flex-grow">
            <Routes>
              {/* Rutas Públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/curso/:id" element={<Lesson />} />

              {/* Rutas Protegidas (Cualquier usuario logueado) */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

              {/* Ruta Protegida Exclusiva (Solo Administradores) */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPanel />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
          <footer className="bg-gray-900 text-white py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Sentir Nacer. Todos los derechos reservados.
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
