import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, ArrowUp, ArrowDown, ExternalLink, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCourses, useResults, useUsers } from '../hooks/useFirestore';
import {
  deleteCourse, swapCourseOrder, seedCourses, setUserRole, setRetakeAllowed,
  createUserAccount, deleteUserProfile,
} from '../services/db';
import CourseFormModal from '../components/CourseFormModal';
import Modal, { Field, FormActions, inputClass } from '../components/Modal';
import { ROLES, ROLE_LABELS } from '../constants';

// =====================================================================
// PANEL DE GESTIÓN (profesor y administrador)
// =====================================================================
//   Pestaña "Cursos"     -> CRUD de cursos (profesor y admin).
//                           Las flechas para MOVER el orden solo las ve el admin.
//   Pestaña "Resultados" -> notas de la Prueba final + interruptor "Repetir" (profesor y admin).
//   Pestaña "Usuarios"   -> crear cuentas, cambiar roles y revocar accesos (solo admin).
// =====================================================================
const th = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
const td = 'px-6 py-4 whitespace-nowrap';

// Interruptor (toggle) reutilizable.
const Toggle = ({ checked, onChange, disabled, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${checked ? 'bg-primary' : 'bg-gray-300'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

// ---------------------------------------------------------------------
// PESTAÑA: CURSOS
// ---------------------------------------------------------------------
const CoursesTab = ({ isAdmin }) => {
  const { data: courses, loading } = useCourses();
  const [modal, setModal] = useState(null); // null | {} (nuevo) | { course } (editar)
  const [busy, setBusy] = useState(false);

  const list = courses || [];
  // El curso nuevo se coloca al final: orden = (mayor orden actual) + 1
  const nextOrder = list.length ? Math.max(...list.map((c) => c.order ?? 0)) + 1 : 0;

  const run = async (fn) => {
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      console.error(err);
      alert('La operación falló. Revisa tus permisos y las reglas de Firestore.');
    }
    setBusy(false);
  };

  const handleDelete = (course) => {
    if (window.confirm(`¿Eliminar el curso "${course.title}"? Esta acción no se puede deshacer.`)) {
      run(() => deleteCourse(course.id));
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setModal({})}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
        >
          <PlusCircle size={20} />
          Nuevo Curso
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className={th}>Curso</th>
              <th className={th}>Contenido</th>
              {isAdmin && <th className={th}>Orden</th>}
              <th className={`${th} text-right`}>Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && (
              <tr><td colSpan={4} className="px-6 py-6 text-center text-gray-500">Cargando...</td></tr>
            )}
            {!loading && list.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No hay cursos todavía.{' '}
                  <button onClick={() => run(seedCourses)} disabled={busy} className="text-primary font-medium hover:underline">
                    Cargar cursos iniciales
                  </button>
                </td>
              </tr>
            )}
            {list.map((course, i) => (
              <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                <td className={td}>
                  <div className="flex items-center">
                    {course.image ? (
                      <img src={course.image} alt="" className="h-10 w-10 flex-shrink-0 rounded-md object-cover" />
                    ) : (
                      <div className="h-10 w-10 flex-shrink-0 bg-primary-light rounded-md"></div>
                    )}
                    <div className="ml-4 max-w-xs">
                      <div className="text-sm font-medium text-gray-900 truncate">{course.title}</div>
                      <div className="text-sm text-gray-500">{course.isImmersive ? 'Realidad Inmersiva' : 'Curso estándar'}</div>
                    </div>
                  </div>
                </td>
                <td className={`${td} text-sm text-gray-500`}>
                  {(course.teoria || []).length} teóricos · {(course.practica || []).length} prácticos ·{' '}
                  {(course.practicaTest || []).length} preg. práctico · {(course.prueba || []).length} preg. prueba
                </td>
                {/* Mover posición: SOLO administrador */}
                {isAdmin && (
                  <td className={td}>
                    <button
                      disabled={busy || i === 0}
                      onClick={() => run(() => swapCourseOrder(course, list[i - 1]))}
                      aria-label="Subir"
                      className="text-gray-500 hover:text-primary disabled:opacity-30 mr-2"
                    >
                      <ArrowUp size={18} />
                    </button>
                    <button
                      disabled={busy || i === list.length - 1}
                      onClick={() => run(() => swapCourseOrder(course, list[i + 1]))}
                      aria-label="Bajar"
                      className="text-gray-500 hover:text-primary disabled:opacity-30"
                    >
                      <ArrowDown size={18} />
                    </button>
                  </td>
                )}
                <td className={`${td} text-right text-sm font-medium`}>
                  <Link to={`/curso/${course.id}`} aria-label="Abrir curso" className="inline-block text-gray-500 hover:text-primary mr-3 align-middle">
                    <ExternalLink size={18} />
                  </Link>
                  <button onClick={() => setModal({ course })} aria-label="Editar" className="text-primary hover:text-primary-dark mr-3">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(course)} aria-label="Eliminar" className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        Para editar el contenido Teórico, Práctico o la Prueba de un curso, ábrelo con el ícono de enlace.
      </p>

      {modal && <CourseFormModal course={modal.course} nextOrder={nextOrder} onClose={() => setModal(null)} />}
    </>
  );
};

// ---------------------------------------------------------------------
// PESTAÑA: RESULTADOS (con el permiso para repetir la prueba)
// ---------------------------------------------------------------------
const ResultsTab = ({ user }) => {
  const { data: results, loading } = useResults(user, true);
  const [busyId, setBusyId] = useState(null);
  const list = results || [];

  // Interruptor "Repetir": ON  -> el alumno puede rendir la prueba otra vez (una vez).
  //                        OFF -> la prueba queda bloqueada para ese alumno.
  const handleToggle = async (r, allowed) => {
    setBusyId(r.id);
    try {
      await setRetakeAllowed(r.id, allowed);
    } catch (err) {
      console.error(err);
      alert('No se pudo cambiar el permiso.');
    }
    setBusyId(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className={th}>Alumno</th>
              <th className={th}>Curso</th>
              <th className={th}>Puntaje</th>
              <th className={th}>Intentos</th>
              <th className={th}>Fecha</th>
              <th className={th}>Permitir repetir</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading && <tr><td colSpan={6} className="px-6 py-6 text-center text-gray-500">Cargando...</td></tr>}
            {!loading && list.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Aún no hay pruebas rendidas.</td></tr>
            )}
            {list.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className={`${td} text-sm text-gray-900`}>{r.userName}</td>
                <td className={`${td} text-sm text-gray-600`}>{r.courseTitle}</td>
                <td className={`${td} text-sm font-semibold text-gray-700`}>{r.score}/{r.total} ({r.percent}%)</td>
                <td className={`${td} text-sm text-gray-500`}>{r.attempts ?? 1}</td>
                <td className={`${td} text-sm text-gray-500`}>{r.createdAt?.toDate().toLocaleString('es-CL') ?? '—'}</td>
                <td className={td}>
                  <div className="flex items-center gap-2">
                    <Toggle
                      checked={r.retakeAllowed === true}
                      disabled={busyId === r.id}
                      onChange={(allowed) => handleToggle(r, allowed)}
                      label={`Permitir que ${r.userName} repita la prueba`}
                    />
                    <span className="text-xs text-gray-500">{r.retakeAllowed === true ? 'Autorizado' : 'Bloqueado'}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        La Prueba final se rinde una sola vez. Activa «Permitir repetir» para que ese alumno pueda volver a rendirla;
        el permiso se consume al enviar el nuevo intento. El test del apartado Práctico no necesita permiso (intentos ilimitados).
      </p>
    </>
  );
};

// ---------------------------------------------------------------------
// PESTAÑA: USUARIOS (solo administrador) — no existe registro público
// ---------------------------------------------------------------------
const NewUserModal = ({ onClose }) => {
  const [values, setValues] = useState({ name: '', email: '', password: '', role: ROLES.ALUMNO });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const set = (name) => (e) => setValues({ ...values, [name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createUserAccount(values);
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        err.code === 'auth/email-already-in-use' ? 'Ese correo ya tiene una cuenta.'
          : err.code === 'auth/weak-password' ? 'La contraseña debe tener al menos 6 caracteres.'
            : err.code === 'auth/invalid-email' ? 'El correo no es válido.'
              : 'No se pudo crear el usuario. Revisa tus permisos.',
      );
      setSaving(false);
    }
  };

  return (
    <Modal title="Nuevo usuario" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nombre completo">
          <input required value={values.name} onChange={set('name')} className={inputClass} />
        </Field>
        <Field label="Correo electrónico">
          <input type="email" required value={values.email} onChange={set('email')} className={inputClass} />
        </Field>
        <Field label="Contraseña inicial (mínimo 6 caracteres)">
          <input type="text" required minLength={6} value={values.password} onChange={set('password')} className={inputClass} />
        </Field>
        <Field label="Rol">
          <select value={values.role} onChange={set('role')} className={inputClass}>
            {Object.values(ROLES).map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
          </select>
        </Field>
        <FormActions onCancel={onClose} saving={saving} error={error} />
      </form>
    </Modal>
  );
};

const UsersTab = ({ currentUser }) => {
  const { data: users, loading } = useUsers(true);
  const [showNew, setShowNew] = useState(false);

  const handleChange = async (u, role) => {
    try {
      await setUserRole(u.id, role);
    } catch (err) {
      console.error(err);
      alert('No se pudo cambiar el rol.');
    }
  };

  const handleRevoke = async (u) => {
    if (!window.confirm(`¿Revocar el acceso de ${u.name}? No podrá volver a iniciar sesión.`)) return;
    try {
      await deleteUserProfile(u.id);
    } catch (err) {
      console.error(err);
      alert('No se pudo revocar el acceso.');
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowNew(true)}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
        >
          <UserPlus size={20} /> Nuevo usuario
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className={th}>Nombre</th>
              <th className={th}>Correo</th>
              <th className={th}>Rol</th>
              <th className={`${th} text-right`}>Acceso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading && <tr><td colSpan={4} className="px-6 py-6 text-center text-gray-500">Cargando...</td></tr>}
            {(users || []).map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className={`${td} text-sm text-gray-900`}>{u.name}</td>
                <td className={`${td} text-sm text-gray-600`}>{u.email}</td>
                <td className={td}>
                  {/* El admin no puede cambiar su propio rol (evita quedarse sin administradores) */}
                  <select
                    value={u.role}
                    disabled={u.id === currentUser.uid}
                    onChange={(e) => handleChange(u, e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-primary focus:border-primary outline-none disabled:bg-gray-100"
                  >
                    {Object.values(ROLES).map((role) => (
                      <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                    ))}
                  </select>
                </td>
                <td className={`${td} text-right`}>
                  <button
                    onClick={() => handleRevoke(u)}
                    disabled={u.id === currentUser.uid}
                    aria-label="Revocar acceso"
                    className="text-red-500 hover:text-red-700 disabled:opacity-30"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        Las cuentas solo se crean aquí (no hay registro público). «Revocar acceso» impide iniciar sesión; para eliminar
        definitivamente el correo, bórralo también en Firebase Authentication.
      </p>

      {showNew && <NewUserModal onClose={() => setShowNew(false)} />}
    </>
  );
};

// ---------------------------------------------------------------------
// PANEL (contenedor con pestañas)
// ---------------------------------------------------------------------
const AdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const [tab, setTab] = useState('cursos');

  // Pestañas visibles según el rol. Para agregar una pestaña nueva, añádela aquí y en el render de abajo.
  const tabs = [
    { key: 'cursos', label: 'Cursos' },
    { key: 'resultados', label: 'Resultados' },
    ...(isAdmin ? [{ key: 'usuarios', label: 'Usuarios y accesos' }] : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isAdmin ? 'Panel de Administración' : 'Panel del Profesor'}
        </h1>
        <p className="text-gray-600 mt-1">
          Hola, {user.name}.{isAdmin && ' Para editar los textos de la portada, ve a Inicio y pulsa «Editar página».'}
        </p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
              tab === t.key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'cursos' && <CoursesTab isAdmin={isAdmin} />}
      {tab === 'resultados' && <ResultsTab user={user} />}
      {tab === 'usuarios' && isAdmin && <UsersTab currentUser={user} />}
    </div>
  );
};

export default AdminPanel;
