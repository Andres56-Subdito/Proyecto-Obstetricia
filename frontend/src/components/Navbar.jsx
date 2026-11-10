import React, { useRef, useState } from 'react';
import { ChevronDown, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCourses, useSiteBlocks } from '../hooks/useFirestore';
import { useClickOutside } from '../hooks/useClickOutside';
import SearchBox from './SearchBox';
import { ROLES, ROLE_LABELS } from '../constants';

// El Navbar solo se dibuja cuando hay una sesión iniciada (ver AppShell en App.jsx).
const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navRef = useRef(null);

  const { user, logout, isStaff } = useAuth();
  const { data: courses } = useCourses();
  const { data: siteBlocks } = useSiteBlocks();
  const navigate = useNavigate();

  // CLIC FUERA: si hay un menú abierto y se hace clic en cualquier otra parte de la página
  // (o se presiona Escape), se retrae solo. Cada menú tiene su propio detector.
  useClickOutside(dropdownRef, () => setIsDropdownOpen(false), isDropdownOpen);
  useClickOutside(navRef, () => setIsMobileMenuOpen(false), isMobileMenuOpen);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // El menú desplegable se construye con los cursos guardados en Firestore:
  // si un profesor crea, renombra o borra un curso, el menú se actualiza solo.
  const menuItems = (courses || []).map((c) => ({ name: c.title, id: c.id }));

  // Enlace al panel según el rol: alumno -> "Mi Panel"; profesor/admin -> panel de gestión.
  const panelLink = isStaff ? '/panel' : '/dashboard';
  const panelLabel = user.role === ROLES.ADMIN ? 'Panel Admin' : user.role === ROLES.PROFESOR ? 'Panel Profesor' : 'Mi Panel';

  const closeMobile = () => setIsMobileMenuOpen(false);

  return (
    <nav ref={navRef} className="bg-primary text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="bg-white text-primary rounded-full w-9 h-9 flex items-center justify-center overflow-hidden shadow-sm ring-1 ring-white/30 group-hover:scale-105 transition-transform">
                <img
                  src="/images/logo.jpg"
                  alt="Sentir Nacer"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <span className="font-bold text-xs text-primary hidden only:inline">SN</span>
              </div>
              <span className="font-semibold text-lg tracking-wide group-hover:text-pink-100 transition-colors">Sentir Nacer</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {/* Menú desplegable de cursos */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1 hover:text-gray-200 transition-colors text-sm"
              >
                Página principal
                <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Siempre montado y animado (opacidad + escala) para que abra y cierre con fluidez */}
              <div
                className={`absolute right-0 mt-2 w-64 bg-primary rounded-sm shadow-lg py-1 ring-1 ring-black ring-opacity-5 max-h-[70vh] overflow-y-auto origin-top-right transition-all duration-200 ${
                  isDropdownOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible pointer-events-none'
                }`}
              >
                {menuItems.map((item) => (
                  <Link
                    key={item.id}
                    to={`/curso/${item.id}`}
                    className="block px-4 py-2 text-sm text-white hover:bg-primary-dark hover:text-white truncate"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Lupa funcional (tiene su propio detector de clic fuera) */}
            <SearchBox courses={courses} siteBlocks={siteBlocks} />

            {/* Usuario y cierre de sesión */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium flex items-center gap-1">
                <UserIcon size={16} /> {user.name} ({ROLE_LABELS[user.role]})
              </span>

              <Link
                to={panelLink}
                className={isStaff ? 'text-sm bg-white/20 px-3 py-1 rounded hover:bg-white/30 transition-colors' : 'text-sm hover:underline'}
              >
                {panelLabel}
              </Link>

              <button onClick={handleLogout} className="text-sm text-red-200 hover:text-white flex items-center gap-1">
                <LogOut size={16} /> Salir
              </button>
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Menú">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil: también siempre montado, se despliega/retrae con una transición de altura */}
      <div
        className={`md:hidden bg-primary-dark overflow-y-auto transition-all duration-300 ${
          isMobileMenuOpen ? 'max-h-[85vh] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <div className="px-3 py-2 text-sm text-gray-300">Hola, {user.name} ({ROLE_LABELS[user.role]})</div>
          <Link to={panelLink} onClick={closeMobile} className="block px-3 py-2 text-base font-medium hover:bg-primary">{panelLabel}</Link>
          <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-base font-medium text-red-300 hover:bg-primary">Cerrar Sesión</button>

          <div className="pt-2">
            <SearchBox courses={courses} siteBlocks={siteBlocks} inline onNavigate={closeMobile} />
          </div>

          <div className="px-3 py-2 text-base font-medium border-b border-primary-light mt-2">Cursos</div>
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={`/curso/${item.id}`}
              onClick={closeMobile}
              className="block px-3 py-2 text-sm text-gray-200 hover:text-white hover:bg-primary pl-6"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
