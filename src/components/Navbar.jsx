import React, { useState, useContext } from 'react';
import { Search, ChevronDown, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { name: "Aromaterapia", id: "0" }, 
    { name: "Fisiobalón", id: "1" },
    { name: "Rebozo", id: "2" },
    { name: "Camilla de Parto Hum...", id: "3" },
    { name: "MUSICOTERAPIA", id: "4" },
    { name: "ACOMPAÑAMIENTO...", id: "5" },
    { name: "Marco Jurídico de la m...", id: "normativa-derechos" },
    { name: "Guatero Sensorial en ...", id: "7" }
  ];

  return (
    <nav className="bg-primary text-white sticky top-0 z-50">
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
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1 hover:text-gray-200 transition-colors text-sm"
              >
                Página principal
                <ChevronDown size={16} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-primary rounded-sm shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                  {menuItems.map((item, index) => (
                    <Link 
                      key={index}
                      to={`/curso/${item.id}`}
                      className="block px-4 py-2 text-sm text-white hover:bg-primary-dark hover:text-white"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            <button className="hover:text-gray-200 transition-colors">
              <Search size={18} />
            </button>
            
            {/* Control de Autenticación en Navbar */}
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium flex items-center gap-1">
                  <UserIcon size={16} /> {user.name} ({user.role === 'admin' ? 'Admin' : 'Alumna'})
                </span>
                
                {user.role === 'admin' ? (
                  <Link to="/admin" className="text-sm bg-white/20 px-3 py-1 rounded hover:bg-white/30 transition-colors">Panel Admin</Link>
                ) : (
                  <Link to="/dashboard" className="text-sm hover:underline">Mi Panel</Link>
                )}
                
                <button onClick={handleLogout} className="text-sm text-red-200 hover:text-white flex items-center gap-1">
                  <LogOut size={16} /> Salir
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-sm hover:underline bg-white/20 px-4 py-1.5 rounded-full hover:bg-white/30 transition-colors">
                Ingresar
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-primary-dark">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             {user ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-300">Hola, {user.name}</div>
                  {user.role === 'admin' ? (
                    <Link to="/admin" className="block px-3 py-2 text-base font-medium hover:bg-primary">Panel Admin</Link>
                  ) : (
                    <Link to="/dashboard" className="block px-3 py-2 text-base font-medium hover:bg-primary">Mi Panel</Link>
                  )}
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-base font-medium text-red-300 hover:bg-primary">Cerrar Sesión</button>
                </>
             ) : (
                <Link to="/login" className="block px-3 py-2 text-base font-medium hover:bg-primary">Ingresar</Link>
             )}
             
             <div className="px-3 py-2 text-base font-medium border-b border-primary-light mt-2">Cursos</div>
             {menuItems.map((item, index) => (
               <Link 
                 key={index}
                 to={`/curso/${item.id}`}
                 className="block px-3 py-2 text-sm text-gray-200 hover:text-white hover:bg-primary pl-6"
               >
                 {item.name}
               </Link>
             ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
