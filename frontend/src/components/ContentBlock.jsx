import React from 'react';
import { Pencil, Trash2, ExternalLink } from 'lucide-react';
import { toEmbedUrl } from '../utils/video';

// Muestra un bloque de contenido (título, texto, imagen, video y/o enlace).
// Si `onEdit` / `onDelete` vienen definidos (solo profesores/admin), aparecen los botones de edición.
const ContentBlock = ({ block, onEdit, onDelete }) => {
  const embed = toEmbedUrl(block.videoUrl);

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
      {(onEdit || onDelete) && (
        <div className="absolute top-4 right-4 flex gap-3">
          {onEdit && (
            <button onClick={onEdit} aria-label="Editar" className="text-primary hover:text-primary-dark">
              <Pencil size={18} />
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} aria-label="Eliminar" className="text-red-500 hover:text-red-700">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      )}

      {block.title && <h3 className="text-xl font-semibold text-primary-dark mb-3 pr-16">{block.title}</h3>}

      {block.imageUrl && (
        <img src={block.imageUrl} alt={block.title || ''} className="w-full max-h-96 object-cover rounded-lg mb-4" />
      )}

      {embed && (
        <div className="aspect-video mb-4 rounded-lg overflow-hidden bg-black">
          <iframe className="w-full h-full" src={embed} title={block.title || 'Video'} allowFullScreen />
        </div>
      )}

      {/* whitespace-pre-line respeta los saltos de línea que escribe el profesor */}
      {block.text && <p className="text-gray-700 leading-relaxed whitespace-pre-line">{block.text}</p>}

      {block.link && (
        <a
          href={block.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-4 text-primary font-medium hover:underline"
        >
          <ExternalLink size={16} /> Abrir recurso
        </a>
      )}
    </article>
  );
};

export default ContentBlock;
