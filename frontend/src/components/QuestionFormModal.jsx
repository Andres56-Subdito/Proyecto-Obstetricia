import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal, { Field, FormActions, inputClass } from './Modal';

// =====================================================================
// FORMULARIO PARA CREAR / EDITAR UNA PREGUNTA DE LA "PRUEBA"
// =====================================================================
// Tipos de pregunta (igual que Google Forms):
//   single   -> una sola respuesta correcta  (círculos)
//   multiple -> varias respuestas correctas  (casillas)
//   text     -> respuesta corta escrita (no se corrige automáticamente)
// Para agregar un tipo nuevo: añádelo en QUESTION_TYPES, en el render de
// CoursePrueba.jsx y en la corrección (función `grade` de ese mismo archivo).
// =====================================================================
export const QUESTION_TYPES = {
  single: 'Opción única',
  multiple: 'Varias opciones',
  text: 'Respuesta corta',
};

const QuestionFormModal = ({ question, onSave, onClose }) => {
  const [text, setText] = useState(question?.text ?? '');
  const [type, setType] = useState(question?.type ?? 'single');
  // Cada opción se guarda como { text, correct } mientras se edita.
  const [options, setOptions] = useState(
    question?.options?.map((o, i) => ({ text: o, correct: question.correct?.includes(i) })) ??
      [{ text: '', correct: true }, { text: '', correct: false }],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isChoice = type !== 'text';

  const setOption = (i, patch) =>
    setOptions(options.map((o, idx) => {
      if (idx === i) return { ...o, ...patch };
      // En "opción única" solo puede haber una correcta: al marcar una, se desmarcan las demás.
      if (patch.correct && type === 'single') return { ...o, correct: false };
      return o;
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    let data = { text, type, options: [], correct: [] };
    if (isChoice) {
      const filled = options.filter((o) => o.text.trim());
      if (filled.length < 2) return setError('Agrega al menos 2 opciones.');
      if (!filled.some((o) => o.correct)) return setError('Marca al menos una respuesta correcta.');
      data = {
        text,
        type,
        options: filled.map((o) => o.text.trim()),
        correct: filled.flatMap((o, i) => (o.correct ? [i] : [])),
      };
    }

    setSaving(true);
    try {
      await onSave(data);
      onClose();
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar. Verifica tus permisos e inténtalo de nuevo.');
      setSaving(false);
    }
  };

  return (
    <Modal title={question ? 'Editar pregunta' : 'Nueva pregunta'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Pregunta">
          <input required value={text} onChange={(e) => setText(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Tipo de pregunta">
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
            {Object.entries(QUESTION_TYPES).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>

        {isChoice && (
          <Field label="Opciones (marca la o las correctas)">
            <div className="space-y-2">
              {options.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type={type === 'single' ? 'radio' : 'checkbox'}
                    name="correct"
                    checked={o.correct}
                    onChange={(e) => setOption(i, { correct: e.target.checked })}
                    className="accent-[#9D508D]"
                    aria-label="Es correcta"
                  />
                  <input
                    value={o.text}
                    onChange={(e) => setOption(i, { text: e.target.value })}
                    className={inputClass}
                    placeholder={`Opción ${i + 1}`}
                  />
                  {options.length > 2 && (
                    <button type="button" onClick={() => setOptions(options.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setOptions([...options, { text: '', correct: false }])}
                className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
              >
                <Plus size={16} /> Agregar opción
              </button>
            </div>
          </Field>
        )}

        <FormActions onCancel={onClose} saving={saving} error={error} />
      </form>
    </Modal>
  );
};

export default QuestionFormModal;
