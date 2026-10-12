import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useCourse } from '../hooks/useFirestore';
import { useAuth } from '../context/AuthContext';
import { updateCourse } from '../services/db';
import ContentBlock from '../components/ContentBlock';
import BlockFormModal from '../components/BlockFormModal';
import QuizSection from '../components/QuizSection';

// =====================================================================
// APARTADOS "TEÓRICO" y "PRÁCTICO"
// =====================================================================
// Una sola página sirve para los dos (App.jsx le pasa `section`):
//   section="teoria"   -> guarda en  courses/{id}.teoria
//   section="practica" -> guarda en  courses/{id}.practica
// Todos pueden LEER. Solo profesor/admin ven los botones de agregar, editar y borrar.
// =====================================================================

// Campos del formulario de cada apartado. Para agregar un campo nuevo, añade una línea aquí.
const FIELDS = {
  teoria: [
    { name: 'title', label: 'Título', type: 'text', required: true },
    { name: 'text', label: 'Contenido', type: 'textarea' },
    { name: 'imageUrl', label: 'Imagen (enlace URL, opcional)', type: 'url' },
    { name: 'videoUrl', label: 'Video de YouTube (opcional)', type: 'url' },
  ],
  practica: [
    { name: 'title', label: 'Título de la actividad', type: 'text', required: true },
    { name: 'text', label: 'Instrucciones / descripción de la dinámica', type: 'textarea' },
    { name: 'imageUrl', label: 'Imagen (enlace URL, opcional)', type: 'url' },
    { name: 'link', label: 'Enlace a un recurso o examen externo (opcional)', type: 'url' },
  ],
};

const CourseBlocksPage = ({ section, title, emptyText }) => {
  const { id } = useParams();
  const { data: course, loading } = useCourse(id);
  const { isStaff } = useAuth();
  // `modal` = null (cerrado) | { block } (editar uno existente) | {} (crear nuevo)
  const [modal, setModal] = useState(null);

  if (loading) return <div className="text-center p-10">Cargando...</div>;
  if (!course) return <div className="text-center p-10">Curso no encontrado.</div>;

  const blocks = course[section] || [];

  // Guarda la lista COMPLETA de bloques del apartado en el curso.
  const saveBlocks = (next) => updateCourse(id, { [section]: next });

  const handleSave = (values) => {
    if (modal.block) return saveBlocks(blocks.map((b) => (b.id === modal.block.id ? { ...b, ...values } : b)));
    return saveBlocks([...blocks, { id: crypto.randomUUID(), ...values }]);
  };

  const handleDelete = (block) => {
    if (window.confirm(`¿Eliminar "${block.title}"?`)) saveBlocks(blocks.filter((b) => b.id !== block.id));
  };

  return (
    <div className="min-h-screen bg-[#faf8fb] pb-20">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to={`/curso/${id}`} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-6">
          <ArrowLeft size={16} /> Volver al curso
        </Link>

        <p className="text-sm text-gray-500 uppercase tracking-wider">{course.title}</p>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-[#a236df] uppercase">{title}</h1>
          {isStaff && (
            <button
              onClick={() => setModal({})}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors"
            >
              <Plus size={18} /> Agregar bloque
            </button>
          )}
        </div>
        <div className="w-20 h-1 bg-primary mb-8 rounded-full"></div>

        {blocks.length === 0 ? (
          <p className="text-gray-500 bg-white rounded-xl border border-gray-100 p-8 text-center">{emptyText}</p>
        ) : (
          <div className="space-y-6">
            {blocks.map((block) => (
              <ContentBlock
                key={block.id}
                block={block}
                onEdit={isStaff ? () => setModal({ block }) : undefined}
                onDelete={isStaff ? () => handleDelete(block) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Solo en PRÁCTICO: test con intentos ILIMITADOS (no se guarda nota ni se bloquea) */}
      {section === 'practica' && (isStaff || (course.practicaTest || []).length > 0) && (
        <div className="max-w-3xl mx-auto px-4 pt-4">
          <h2 className="text-2xl font-display font-bold text-primary-dark uppercase mb-1">Test práctico</h2>
          <p className="text-sm text-gray-500 mb-6">Puedes realizarlo y repetirlo todas las veces que quieras.</p>
          <QuizSection course={course} field="practicaTest" isFinal={false} />
        </div>
      )}

      {modal && (
        <BlockFormModal
          heading={modal.block ? `Editar bloque (${title})` : `Nuevo bloque (${title})`}
          fields={FIELDS[section]}
          initial={modal.block}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

export default CourseBlocksPage;
