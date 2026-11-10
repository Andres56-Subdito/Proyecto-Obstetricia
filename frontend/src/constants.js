// Valores compartidos por toda la aplicación.

// Los 3 perfiles de usuario. Estos textos son los que se guardan en Firestore
// (users/{uid}.role) y los que comparan las reglas de seguridad (firestore.rules).
export const ROLES = {
  ALUMNO: 'alumno',
  PROFESOR: 'profesor',
  ADMIN: 'admin', // Administrador / Programador
};

// Texto que se muestra en pantalla para cada rol.
export const ROLE_LABELS = {
  alumno: 'Alumno',
  profesor: 'Profesor',
  admin: 'Administrador',
};

// A qué pantalla se envía a cada rol justo después de iniciar sesión.
export const homeForRole = (role) => (role === ROLES.ALUMNO ? '/dashboard' : '/panel');

// ---------------------------------------------------------------------
// PARÁMETROS DE LAS EVALUACIONES
// ---------------------------------------------------------------------
// Porcentaje mínimo para considerar aprobada una prueba.
export const PASS_PERCENT = 60;

// Tiempo límite de la PRUEBA final (examen), en minutos.
// 0 = sin límite. Si pones, por ejemplo, 30: aparece un contador y, al llegar a 0,
// el examen se envía solo con lo que el alumno haya respondido.
// (El test del apartado Práctico nunca tiene límite de tiempo ni de intentos.)
export const FINAL_EXAM_TIME_LIMIT_MIN = 0;
