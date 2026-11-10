// =====================================================================
// DETECTOR DE CLIC FUERA ("click outside")
// =====================================================================
// Llama a `onOutside` cuando el usuario hace clic/toca CUALQUIER parte de la página
// que no esté dentro del elemento `ref`, o cuando presiona la tecla Escape.
// Se usa para cerrar menús desplegables, el buscador y el menú móvil.
//   active = false  -> no escucha nada (ahorra listeners cuando el menú está cerrado).
// =====================================================================
import { useEffect, useRef } from 'react';

export const useClickOutside = (ref, onOutside, active = true) => {
  // Guardamos el callback más reciente sin re-suscribir los listeners en cada render.
  const handlerRef = useRef(onOutside);
  useEffect(() => {
    handlerRef.current = onOutside;
  });

  useEffect(() => {
    if (!active) return undefined;

    const onPointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handlerRef.current(e);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') handlerRef.current(e);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [ref, active]);
};
