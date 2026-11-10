import React, { useState } from 'react';
import Modal, { Field, FormActions, inputClass } from './Modal';
import { saveSiteText } from '../services/db';

// Ventana del CMS: edita UN texto (o enlace de imagen/video) de la página de inicio.
// `item` = { id, def, value, kind: 'text' | 'multiline' | 'image' | 'video' }
//   id    -> clave con la que se guarda en Firestore
//   def   -> texto original escrito en el código (al restaurar, se vuelve a este)
//   value -> valor actual que se está mostrando
const LABELS = {
  text: 'Texto',
  multiline: 'Texto (cada salto de línea se respeta)',
  image: 'Enlace de la imagen (URL)',
  video: 'Enlace del video de YouTube',
};

const SiteEditorModal = ({ item, onClose }) => {
  const [value, setValue] = useState(item.value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const persist = async (newValue) => {
    setSaving(true);
    setError(null);
    try {
      await saveSiteText(item.id, newValue);
      onClose();
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar. Verifica que tu cuenta sea Administrador.');
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    persist(value);
  };

  const isLong = item.kind === 'multiline' || (item.kind === 'text' && value.length > 70);
  const isUrl = item.kind === 'image' || item.kind === 'video';

  return (
    <Modal title="Editar contenido de la página" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label={LABELS[item.kind] || LABELS.text}>
          {isLong ? (
            <textarea rows={6} value={value} onChange={(e) => setValue(e.target.value)} className={inputClass} autoFocus />
          ) : (
            <input
              type={isUrl ? 'url' : 'text'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={inputClass}
              autoFocus
            />
          )}
        </Field>
        {item.kind === 'image' && value && (
          <img src={value} alt="Vista previa" className="max-h-40 rounded-md object-cover" />
        )}
        <button
          type="button"
          onClick={() => persist(null)}
          disabled={saving}
          className="text-sm text-gray-500 hover:text-primary hover:underline"
        >
          Restaurar el original
        </button>
        <FormActions onCancel={onClose} saving={saving} error={error} />
      </form>
    </Modal>
  );
};

export default SiteEditorModal;
