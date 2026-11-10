// Hooks que "conectan" las suscripciones de services/db.js con los componentes React.
// Cada uno devuelve { data, loading, error } y se actualiza solo en tiempo real.
import { useEffect, useState } from 'react';
import {
  subscribeCourses, subscribeCourse, subscribeSiteBlocks, subscribeResults, subscribeResult, subscribeUsers,
} from '../services/db';

const useLive = (subscribe, key) => {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    if (!subscribe) {
      setState({ data: null, loading: false, error: null });
      return undefined;
    }
    setState((s) => ({ ...s, loading: true }));
    // subscribe() devuelve la función para "des-suscribirse" al salir de la pantalla.
    return subscribe(
      (data) => setState({ data, loading: false, error: null }),
      (error) => {
        console.error('Error de Firestore:', error);
        setState({ data: null, loading: false, error });
      },
    );
    // `key` identifica qué se está escuchando; cuando cambia, se vuelve a suscribir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
};

export const useCourses = () => useLive(subscribeCourses, 'courses');
export const useCourse = (id) => useLive(id ? subscribeCourse(id) : null, `course-${id}`);
export const useSiteBlocks = () => useLive(subscribeSiteBlocks, 'siteBlocks');
export const useResults = (user, isStaff) =>
  useLive(user ? subscribeResults(user, isStaff) : null, `results-${user?.uid}-${isStaff}`);
// Resultado de la prueba final de un alumno en un curso (pasa user=null para no suscribirse).
export const useResult = (user, courseId) =>
  useLive(user ? subscribeResult(user.uid, courseId) : null, `result-${user?.uid}-${courseId}`);
export const useUsers =(enabled) => useLive(enabled ? subscribeUsers : null, `users-${enabled}`);
