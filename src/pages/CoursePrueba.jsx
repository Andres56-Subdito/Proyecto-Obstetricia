import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCourse } from '../hooks/useFirestore';
import { useAuth } from '../context/AuthContext';
import QuizSection from '../components/QuizSection';
import { FINAL_EXAM_TIME_LIMIT_MIN } from '../constants';

// =====================================================================
// APARTADO "PRUEBA" — examen final con estilo de formulario (Google Forms)
// =====================================================================
// Toda la lógica (un solo intento, bloqueo, permiso del profesor, temporizador)
// está en components/QuizSection.jsx con isFinal={true}.
// =====================================================================
const CoursePrueba = () => {
  const { id } = useParams();
  const { data: course, loading } = useCourse(id);
  const { user, isStaff } = useAuth();

  if (loading) return <div className="text-center p-10">Cargando...</div>;
  if (!course) return <div className="text-center p-10">Curso no encontrado.</div>;

  return (
    <div className="min-h-screen bg-[#f0ebf8] pb-20">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link to={`/curso/${id}`} className="inline-flex items-center gap-1.5 text-sm text-primary-dark hover:underline mb-6">
          <ArrowLeft size={16} /> Volver al curso
        </Link>

        {/* Encabezado del formulario (la franja superior morada es el sello de Google Forms) */}
        <div className="bg-white rounded-lg border-t-[10px] border-primary shadow-sm p-6 mb-4">
          <h1 className="text-3xl font-semibold text-gray-900">Prueba: {course.title}</h1>
          <p className="text-sm text-gray-600 mt-2">{course.evaluation}</p>
          {!isStaff && (
            <p className="text-sm text-primary-dark mt-3">
              Esta prueba se rinde <strong>una sola vez</strong>
              {FINAL_EXAM_TIME_LIMIT_MIN > 0 && <> y tiene un límite de <strong>{FINAL_EXAM_TIME_LIMIT_MIN} minutos</strong></>}
              . Si necesitas repetirla, tu profesor debe autorizarlo.
            </p>
          )}
          <p className="text-xs text-gray-400 mt-3">
            Respondiendo como {user.name}
            {isStaff && ' · modo vista previa (tu resultado no se guarda)'}
          </p>
        </div>

        <QuizSection course={course} field="prueba" isFinal />
      </div>
    </div>
  );
};

export default CoursePrueba;
