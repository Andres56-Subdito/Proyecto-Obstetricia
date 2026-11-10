import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Lesson from './pages/Lesson';
import CourseBlocksPage from './pages/CourseBlocksPage';
import CoursePrueba from './pages/CoursePrueba';
import AdminPanel from './pages/AdminPanel';
import AuthForm from './components/AuthForm';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SiteContentProvider } from './context/SiteContentContext';
import { firebaseConfigured } from './firebase';
import { ROLES, homeForRole } from './constants';

// ---------------------------------------------------------------------
// RUTAS PROTEGIDAS POR ROL
// `roles` = lista de roles que pueden entrar a esa pantalla concreta.
// Ej: <ProtectedRoute roles={[ROLES.PROFESOR, ROLES.ADMIN]}> ... </ProtectedRoute>
// (Ojo: esto solo oculta pantallas. La seguridad real está en firestore.rules)
// ---------------------------------------------------------------------
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

// Pantalla de inicio de sesión (lo único que ve alguien que no ha iniciado sesión).
// NO hay enlace a "Registrarse": las cuentas las crea el administrador.
const LoginPage = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <AuthForm />
  </div>
);

// Pantalla que se muestra si todavía no se pegaron las claves de Firebase en .env.local
const MissingConfig = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="max-w-lg bg-white rounded-lg shadow-md border border-gray-100 p-8">
      <h1 className="text-xl font-bold text-primary-dark mb-3">Falta configurar Firebase</h1>
      <p className="text-gray-600 text-sm mb-3">
        Copia el archivo <code className="bg-gray-100 px-1 rounded">.env.example</code> como{' '}
        <code className="bg-gray-100 px-1 rounded">.env.local</code>, pega las claves de tu proyecto de Firebase
        y reinicia <code className="bg-gray-100 px-1 rounded">npm run dev</code>.
      </p>
      <p className="text-gray-500 text-sm">Los pasos completos están en GUIA_PERSONALIZACION.md.</p>
    </div>
  </div>
);

// ---------------------------------------------------------------------
// ROUTE GUARD GLOBAL
// Esta es la puerta de entrada de TODA la aplicación:
//   - Sin sesión  -> cualquier dirección redirige a /login (única pantalla accesible, sin Navbar).
//   - Con sesión  -> se muestra la plataforma; /login redirige al panel que corresponde al rol.
// ---------------------------------------------------------------------
function AppShell() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando...</div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <Routes>
          <Route path="/login" element={<Navigate to={homeForRole(user.role)} replace />} />
          <Route path="/" element={<Home />} />

          {/* Curso: portada con los 3 botones y sus 3 apartados */}
          <Route path="/curso/:id" element={<Lesson />} />
          <Route path="/curso/:id/teorico" element={
            <CourseBlocksPage section="teoria" title="Teórico" emptyText="Aún no hay contenido teórico en este curso." />
          } />
          <Route path="/curso/:id/practico" element={
            <CourseBlocksPage section="practica" title="Práctico" emptyText="Aún no hay actividades prácticas en este curso." />
          } />
          <Route path="/curso/:id/prueba" element={<CoursePrueba />} />

          {/* Panel del alumno */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={[ROLES.ALUMNO]}><Dashboard /></ProtectedRoute>
          } />

          {/* Panel de gestión: profesores y administradores (el admin ve más pestañas) */}
          <Route path="/panel" element={
            <ProtectedRoute roles={[ROLES.PROFESOR, ROLES.ADMIN]}><AdminPanel /></ProtectedRoute>
          } />
          <Route path="/admin" element={<Navigate to="/panel" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <footer className="bg-gray-900 text-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Sentir Nacer. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}

function App() {
  if (!firebaseConfigured) return <MissingConfig />;

  return (
    <AuthProvider>
      <SiteContentProvider>
        <Router>
          <AppShell />
        </Router>
      </SiteContentProvider>
    </AuthProvider>
  );
}

export default App;
