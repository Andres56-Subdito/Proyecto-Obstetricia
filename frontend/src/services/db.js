// =====================================================================
// SERVICIO DE BASE DE DATOS (Cloud Firestore)
// =====================================================================
// TODA la comunicación con Firestore vive en este archivo. Los componentes
// no hablan con Firebase directamente: llaman a estas funciones.
// Si quieres cambiar el nombre de una colección o agregar un campo por defecto,
// este es el lugar.
//
// Estructura de la base de datos:
//   users/{uid}            -> { name, email, role }                 (perfil + rol)
//   courses/{id}           -> { title, image, videoUrl, author, description, evaluation,
//                               isImmersive, order,
//                               teoria:[bloques], practica:[bloques],
//                               practicaTest:[preguntas], prueba:[preguntas] }
//   siteBlocks/{id}        -> { title, text, imageUrl, order }      (bloques de la página de inicio)
//   siteContent/home       -> { texts: { clave: valor } }           (textos editables de la portada)
//   results/{uid_cursoId}  -> { uid, userName, courseId, courseTitle, score, total, percent,
//                               attempts, retakeAllowed }           (resultado de la PRUEBA final)
// =====================================================================
import {
  collection, doc, onSnapshot, query, orderBy, where,
  addDoc, setDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp, deleteField,
} from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, firebaseConfig } from '../firebase';
import { SEED_COURSES } from '../data/seedCourses';

// Nombres de colecciones (cámbialos aquí si algún día los renombras en Firestore).
const COURSES = 'courses';
const BLOCKS = 'siteBlocks';
const RESULTS = 'results';
const USERS = 'users';
const SITE_CONTENT = 'siteContent';

const withId = (d) => ({ id: d.id, ...d.data() });

// ---------------------------------------------------------------------
// CURSOS
// ---------------------------------------------------------------------
// Valores por defecto de un curso nuevo. Para agregar un CAMPO NUEVO a los cursos:
// 1) agrégalo aquí, 2) agrégalo en CourseFormModal.jsx, 3) muéstralo donde quieras.
const COURSE_DEFAULTS = {
  title: '',
  image: '',
  videoUrl: '',
  author: '',
  description: '',
  evaluation: '',
  isImmersive: false,
  teoria: [], // apartado Teórico: lista de bloques {id, title, text, imageUrl, videoUrl}
  practica: [], // apartado Práctico: lista de bloques {id, title, text, link}
  practicaTest: [], // test del apartado Práctico (intentos ilimitados): lista de preguntas
  prueba: [], // apartado Prueba (examen final, un solo intento): lista de preguntas
};

// "Suscripciones": Firestore avisa en tiempo real cuando algo cambia, así que
// la pantalla se actualiza sola después de crear/editar/borrar.
export const subscribeCourses = (onData, onError) =>
  onSnapshot(
    query(collection(db, COURSES), orderBy('order')),
    (snap) => onData(snap.docs.map(withId)),
    onError,
  );

export const subscribeCourse = (id) => (onData, onError) =>
  onSnapshot(doc(db, COURSES, id), (s) => onData(s.exists() ? withId(s) : null), onError);

export const createCourse = (data, order) =>
  addDoc(collection(db, COURSES), { ...COURSE_DEFAULTS, ...data, order, createdAt: serverTimestamp() });

export const updateCourse = (id, data) => updateDoc(doc(db, COURSES, id), data);

export const deleteCourse = (id) => deleteDoc(doc(db, COURSES, id));

// Intercambia la posición de dos cursos (solo el Administrador puede, ver firestore.rules).
export const swapCourseOrder = (a, b) => {
  const batch = writeBatch(db);
  batch.update(doc(db, COURSES, a.id), { order: b.order });
  batch.update(doc(db, COURSES, b.id), { order: a.order });
  return batch.commit();
};

// Sube los cursos de seedCourses.js a Firestore (se usa una sola vez).
export const seedCourses = () => {
  const batch = writeBatch(db);
  SEED_COURSES.forEach(({ id, ...data }, index) => {
    batch.set(doc(db, COURSES, id), { ...COURSE_DEFAULTS, ...data, order: index, createdAt: serverTimestamp() });
  });
  return batch.commit();
};

// ---------------------------------------------------------------------
// BLOQUES DE CONTENIDO GENERAL (página de inicio)
// ---------------------------------------------------------------------
export const subscribeSiteBlocks = (onData, onError) =>
  onSnapshot(
    query(collection(db, BLOCKS), orderBy('order')),
    (snap) => onData(snap.docs.map(withId)),
    onError,
  );

// `order` = fecha de creación, así los bloques nuevos quedan al final.
export const createSiteBlock = (data) => addDoc(collection(db, BLOCKS), { ...data, order: Date.now() });
export const updateSiteBlock = (id, data) => updateDoc(doc(db, BLOCKS, id), data);
export const deleteSiteBlock = (id) => deleteDoc(doc(db, BLOCKS, id));

// ---------------------------------------------------------------------
// TEXTOS EDITABLES DE LA PÁGINA DE INICIO (CMS del administrador)
// ---------------------------------------------------------------------
// Se guardan como un mapa { clave: texto } en siteContent/home.
// Si una clave no existe, la pantalla usa el texto original escrito en el código.
export const subscribeSiteContent = (onData, onError) =>
  onSnapshot(doc(db, SITE_CONTENT, 'home'), (s) => onData(s.exists() ? s.data() : null), onError);

// value = null  -> borra la clave y se vuelve al texto original.
export const saveSiteText = (key, value) =>
  setDoc(
    doc(db, SITE_CONTENT, 'home'),
    { texts: { [key]: value === null ? deleteField() : value } },
    { merge: true },
  );

// ---------------------------------------------------------------------
// RESULTADOS DE LA PRUEBA FINAL
// ---------------------------------------------------------------------
// Un documento por alumno y curso (id = uid_cursoId).
// `retakeAllowed` es el permiso del profesor para repetir la prueba:
//   - al rendir, siempre queda en false  (la prueba se bloquea)
//   - el profesor lo pone en true desde el Panel > Resultados
//   - al volver a rendir, vuelve a false
// Las reglas de Firestore hacen cumplir esto aunque alguien manipule la web.
export const saveResult = (user, course, score, total, attempts) =>
  setDoc(doc(db, RESULTS, `${user.uid}_${course.id}`), {
    uid: user.uid,
    userName: user.name,
    courseId: course.id,
    courseTitle: course.title,
    score,
    total,
    percent: total ? Math.round((score / total) * 100) : 0,
    attempts,
    retakeAllowed: false,
    createdAt: serverTimestamp(),
  });

// Resultado de UN alumno en UN curso (null si todavía no rindió la prueba).
export const subscribeResult = (uid, courseId) => (onData, onError) =>
  onSnapshot(doc(db, RESULTS, `${uid}_${courseId}`), (s) => onData(s.exists() ? withId(s) : null), onError);

// Profesores/Admin ven todos los resultados; el alumno solo los suyos.
export const subscribeResults = (user, isStaff) => (onData, onError) => {
  const q = isStaff
    ? query(collection(db, RESULTS), orderBy('createdAt', 'desc'))
    : query(collection(db, RESULTS), where('uid', '==', user.uid));
  return onSnapshot(q, (snap) => onData(snap.docs.map(withId)), onError);
};

// Interruptor del profesor: permite (true) o impide (false) que el alumno repita la prueba.
export const setRetakeAllowed = (resultId, allowed) =>
  updateDoc(doc(db, RESULTS, resultId), { retakeAllowed: allowed });

// ---------------------------------------------------------------------
// USUARIOS (gestión de accesos, solo Administrador)
// ---------------------------------------------------------------------
export const subscribeUsers = (onData, onError) =>
  onSnapshot(collection(db, USERS), (snap) => onData(snap.docs.map(withId)), onError);

export const setUserRole = (uid, role) => updateDoc(doc(db, USERS, uid), { role });

// Crea una cuenta nueva (solo la usa el Administrador desde el Panel; NO existe registro público).
// Truco: se usa una segunda "app" temporal de Firebase para crear la cuenta; así la sesión
// del administrador NO se cierra (createUser inicia sesión automáticamente con la cuenta nueva).
export const createUserAccount = async ({ name, email, password, role }) => {
  const secondary = initializeApp(firebaseConfig, `secondary-${Date.now()}`);
  try {
    const secondaryAuth = getAuth(secondary);
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    // El perfil con el rol se escribe con la sesión del administrador (las reglas lo exigen).
    await setDoc(doc(db, USERS, cred.user.uid), { name, email, role, createdAt: serverTimestamp() });
    await signOut(secondaryAuth);
  } finally {
    await deleteApp(secondary);
  }
};

// Revoca el acceso: sin perfil en Firestore, el login es rechazado (ver AuthContext).
export const deleteUserProfile = (uid) => deleteDoc(doc(db, USERS, uid));
