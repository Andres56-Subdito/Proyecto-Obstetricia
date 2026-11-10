// =====================================================================
// BUSCADOR (icono de lupa del Navbar)
// =====================================================================
// - Filtra EN TIEMPO REAL mientras se escribe (cursos, contenido Teórico/Práctico y bloques de inicio).
// - Enter abre el primer resultado; clic abre el resultado elegido.
// - Se cierra solo al hacer clic fuera, al presionar Escape o al elegir un resultado.
// - `inline` = versión siempre abierta, usada dentro del menú móvil.
// La lógica de búsqueda está en utils/search.js.
// =====================================================================
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClickOutside } from '../hooks/useClickOutside';
import { searchContent, MIN_QUERY_LENGTH } from '../utils/search';

const SearchBox = ({ courses, siteBlocks, inline = false, onNavigate }) => {
  const [open, setOpen] = useState(inline);
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Clic fuera del buscador (versión de escritorio) -> se retrae.
  useClickOutside(ref, () => setOpen(false), open && !inline);

  // Al abrir, el cursor queda listo para escribir.
  useEffect(() => {
    if (open && !inline) inputRef.current?.focus();
  }, [open, inline]);

  // Se recalcula solo cuando cambian el texto o los datos.
  const results = useMemo(
    () => searchContent(courses || [], siteBlocks || [], query),
    [courses, siteBlocks, query],
  );

  const go = (to) => {
    navigate(to);
    setQuery('');
    if (!inline) setOpen(false);
    onNavigate?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (results[0]) go(results[0].to);
  };

  const panel = (
    <>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
        <Search size={16} className="text-gray-400 flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar cursos y contenidos..."
          className="w-full text-sm text-gray-800 outline-none bg-transparent"
          aria-label="Buscar"
        />
      </form>

      <ul className="max-h-72 overflow-y-auto">
        {query.trim().length < MIN_QUERY_LENGTH ? (
          <li className="px-4 py-3 text-xs text-gray-400">Escribe al menos {MIN_QUERY_LENGTH} letras.</li>
        ) : results.length === 0 ? (
          <li className="px-4 py-3 text-sm text-gray-500">Sin resultados para «{query}».</li>
        ) : (
          results.map((r) => (
            <li key={r.key}>
              <button
                onClick={() => go(r.to)}
                className="w-full text-left px-4 py-2.5 hover:bg-purple-50 transition-colors flex items-start gap-2"
              >
                <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide bg-primary/10 text-primary rounded px-1.5 py-0.5 flex-shrink-0">
                  {r.type}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm text-gray-800 truncate">{r.title}</span>
                  {r.subtitle && <span className="block text-xs text-gray-500 truncate">{r.subtitle}</span>}
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </>
  );

  // Versión móvil: panel siempre visible dentro del menú.
  if (inline) {
    return <div className="bg-white text-gray-800 rounded-md overflow-hidden mx-3 mb-2">{panel}</div>;
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} aria-label="Buscar" className="hover:text-gray-200 transition-colors">
        <Search size={18} />
      </button>

      {/* El panel siempre existe; se anima con opacidad/escala para abrir y cerrar con suavidad. */}
      <div
        className={`absolute right-0 mt-3 w-80 bg-white text-gray-800 rounded-lg shadow-xl ring-1 ring-black/5 origin-top-right transition-all duration-200 ${
          open ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible pointer-events-none'
        }`}
      >
        {panel}
      </div>
    </div>
  );
};

export default SearchBox;
