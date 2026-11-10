// =====================================================================
// COMPONENTES EDITABLES DEL CMS
// =====================================================================
// Se usan en lugar de escribir el texto/imagen "a mano". Para todos los usuarios se ven igual
// que antes (no cambia el diseño); solo el Administrador en "Modo edición" ve el resaltado.
//
//   <EditableText id="clave_unica" def="Texto original" as="h2" className="..." />
//   <EditableImage id="clave_unica" def="/images/foto.jpg" alt="..." className="..." />
//
// - `id`  : nombre único con el que se guarda en Firestore (no lo repitas en dos lugares).
// - `def` : valor original; se muestra mientras nadie lo haya editado.
// =====================================================================
import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';

// Devuelve el valor guardado para `id`, o `def` si no se ha editado.
export const useSiteText = (id, def) => {
  const { texts } = useSiteContent();
  return texts[id] ?? def;
};

// Texto editable. `multiline` respeta los saltos de línea; `as` es la etiqueta HTML (h1, p, span...).
export const EditableText = ({ id, def, as: Tag = 'span', multiline = false, className = '' }) => {
  const { editMode, openEditor } = useSiteContent();
  const value = useSiteText(id, def);
  const base = `${className} ${multiline ? 'whitespace-pre-line' : ''}`;

  if (!editMode) return <Tag className={base}>{value}</Tag>;

  return (
    <Tag
      className={`${base} cursor-pointer rounded-sm outline-dashed outline-2 outline-offset-2 outline-primary/70 hover:bg-primary/10`}
      title="Clic para editar"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        openEditor({ id, def, value, kind: multiline ? 'multiline' : 'text' });
      }}
    >
      {value}
    </Tag>
  );
};

// Botón flotante "Cambiar imagen / video". Se posiciona sobre el contenedor `relative` más cercano.
export const MediaEditButton = ({ id, def, kind = 'image', label = 'Cambiar imagen' }) => {
  const { editMode, openEditor } = useSiteContent();
  const value = useSiteText(id, def);
  if (!editMode) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        openEditor({ id, def, value, kind });
      }}
      className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-white text-primary text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg ring-2 ring-primary/60 hover:bg-primary hover:text-white transition-colors"
    >
      <ImageIcon size={14} /> {label}
    </button>
  );
};

// Imagen editable: es un <img> normal + el botón de cambio (solo visible en modo edición).
export const EditableImage = ({ id, def, alt, className }) => {
  const src = useSiteText(id, def);
  return (
    <>
      <img src={src} alt={alt} className={className} />
      <MediaEditButton id={id} def={def} />
    </>
  );
};

// Interruptor flotante del Modo edición. Solo se dibuja para el Administrador.
export const EditModeToggle = ({ isAdmin }) => {
  const { editMode, setEditMode } = useSiteContent();
  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {editMode && (
        <div className="bg-white text-gray-700 text-xs px-3 py-2 rounded-lg shadow-lg ring-1 ring-primary/30 max-w-[220px]">
          Haz clic en cualquier texto o imagen resaltado para editarlo. Los cambios se guardan al instante.
        </div>
      )}
      <button
        onClick={() => setEditMode(!editMode)}
        className={`px-5 py-3 rounded-full shadow-xl font-semibold text-sm transition-colors ${
          editMode ? 'bg-white text-primary ring-2 ring-primary' : 'bg-primary text-white hover:bg-primary-dark'
        }`}
      >
        {editMode ? 'Salir del modo edición' : 'Editar página'}
      </button>
    </div>
  );
};
