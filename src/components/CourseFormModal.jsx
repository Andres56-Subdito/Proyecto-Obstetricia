import React, { useState } from 'react';
import Modal, { Field, FormActions, inputClass } from './Modal';
import { createCourse, updateCourse } from '../services/db';

// =====================================================================
// FORMULARIO PARA CREAR / EDITAR UN CURSO  (CRUD: "C" y "U")
// =====================================================================
// - Si recibe `course`, edita ese curso; si no, crea uno nuevo.
// - `nextOrder` es la posición que tendrá un curso nuevo (al final de la lista).
// PARA AGREGAR UN CAMPO AL CURSO (ej. "duración"):
//   1) agrega `duration: ''` en COURSE_DEFAULTS de services/db.js
//   2) agrégalo en EMPTY de aquí abajo y un <Field> en el formulario
//   3) muéstralo donde quieras (Lesson.jsx, CourseCard.jsx...)
// =====================================================================
const EMPTY = {
  title: '', image: '', videoUrl: '', author: '', description: '', evaluation: '', isImmersive: false,
};

const CourseFormModal = ({ course, nextOrder = 0, onClose }) => {
  const [values, setValues] = useState(() => {
    if (!course) return EMPTY;
    return Object.fromEntries(Object.keys(EMPTY).map((k) => [k, course[k] ?? EMPTY[k]]));
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (name) => (e) => setValues({ ...values, [name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (course) await updateCourse(course.id, values);
      else await createCourse(values, nextOrder);
      onClose();
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar el curso. Verifica tus permisos e inténtalo de nuevo.');
      setSaving(false);
    }
  };

  return (
    <Modal title={course ? 'Editar curso' : 'Nuevo curso'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Título">
          <input required value={values.title} onChange={set('title')} className={inputClass} />
        </Field>
        <Field label="Imagen de portada (enlace URL)">
          <input type="url" value={values.image} onChange={set('image')} className={inputClass} placeholder="https://..." />
        </Field>
        <Field label="Video del curso (enlace de YouTube, opcional)">
          <input type="url" value={values.videoUrl} onChange={set('videoUrl')} className={inputClass} placeholder="https://www.youtube.com/watch?v=..." />
        </Field>
        <Field label="Autor / Docente">
          <input value={values.author} onChange={set('author')} className={inputClass} />
        </Field>
        <Field label="Descripción">
          <textarea rows={4} value={values.description} onChange={set('description')} className={inputClass} />
        </Field>
        <Field label="Actividad de evaluación (texto que aparece en la portada del curso)">
          <textarea rows={2} value={values.evaluation} onChange={set('evaluation')} className={inputClass} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={values.isImmersive}
            onChange={(e) => setValues({ ...values, isImmersive: e.target.checked })}
            className="accent-[#9D508D]"
          />
          Mostrar etiqueta «Realidad Inmersiva»
        </label>
        <FormActions onCancel={onClose} saving={saving} error={error} />
      </form>
    </Modal>
  );
};

export default CourseFormModal;
