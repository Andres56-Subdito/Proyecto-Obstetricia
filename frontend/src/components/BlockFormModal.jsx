import React, { useState } from 'react';
import Modal, { Field, FormActions, inputClass } from './Modal';

// =====================================================================
// FORMULARIO GENÉRICO DE "BLOQUE DE CONTENIDO"
// =====================================================================
// Sirve para 3 lugares distintos, solo cambia la lista `fields`:
//   - Teórico            (CourseBlocksPage.jsx)
//   - Práctico           (CourseBlocksPage.jsx)
//   - Bloques de inicio  (Home.jsx)
//
// `fields` = [{ name, label, type: 'text' | 'textarea' | 'url', required? }]
// PARA AGREGAR UN CAMPO NUEVO a un bloque: añade una línea en la lista `fields`
// de la página correspondiente y muéstralo en ContentBlock.jsx. No hay que tocar nada más.
// =====================================================================
const BlockFormModal = ({ heading, fields, initial = {}, onSave, onClose }) => {
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((f) => [f.name, initial[f.name] ?? ''])),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(values);
      onClose();
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar. Verifica tus permisos e inténtalo de nuevo.');
      setSaving(false);
    }
  };

  return (
    <Modal title={heading} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((f) => (
          <Field key={f.name} label={f.label}>
            {f.type === 'textarea' ? (
              <textarea
                rows={6}
                required={f.required}
                value={values[f.name]}
                onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                className={inputClass}
              />
            ) : (
              <input
                type={f.type === 'url' ? 'url' : 'text'}
                required={f.required}
                value={values[f.name]}
                onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                className={inputClass}
                placeholder={f.type === 'url' ? 'https://...' : ''}
              />
            )}
          </Field>
        ))}
        <FormActions onCancel={onClose} saving={saving} error={error} />
      </form>
    </Modal>
  );
};

export default BlockFormModal;
