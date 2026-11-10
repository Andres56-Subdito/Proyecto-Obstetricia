import React, { useState } from 'react';
import { Play, BookOpen, ClipboardCheck, FileQuestion, Pencil } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { useCourse } from '../hooks/useFirestore';
import { useAuth } from '../context/AuthContext';
import CourseFormModal from '../components/CourseFormModal';
import { toEmbedUrl } from '../utils/video';

// Los 3 botones obligatorios de cada curso. Cada uno lleva a un apartado distinto.
// Para cambiar el texto o el ícono de un botón, edita esta lista.
const SECTIONS = [
  { to: 'teorico', label: 'Teórico', hint: 'Material de estudio', Icon: BookOpen },
  { to: 'practico', label: 'Práctico', hint: 'Exámenes y dinámicas', Icon: ClipboardCheck },
  { to: 'prueba', label: 'Prueba', hint: 'Evaluación final', Icon: FileQuestion },
];

const Lesson = () => {
  // useParams() extrae el "id" de la URL (ej: /curso/0 -> id = "0")
  const { id } = useParams();
  const { data: course, loading } = useCourse(id);
  const { isStaff } = useAuth();
  const [playing, setPlaying] = useState(false);
  const [editing, setEditing] = useState(false);

  if (loading) return <div className="text-center p-10">Cargando...</div>;

  // Si el curso no existe en Firestore (o fue eliminado)
  if (!course) {
    return (
      <div className="max-w-xl mx-auto text-center py-24 px-4">
        <h1 className="text-3xl font-display font-bold text-[#a236df] uppercase mb-4">Curso en desarrollo</h1>
        <p className="text-gray-600 mb-6">Este módulo (ID: {id}) no existe o está siendo preparado. Vuelve pronto.</p>
        <Link to="/" className="text-primary font-medium hover:underline">Volver al inicio</Link>
      </div>
    );
  }

  const embed = toEmbedUrl(course.videoUrl);

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Barra visible solo para profesores/administradores */}
        {isStaff && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 text-sm bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors"
            >
              <Pencil size={16} /> Editar curso
            </button>
          </div>
        )}

        <h1 className="text-center text-4xl md:text-5xl font-display font-bold text-[#a236df] uppercase tracking-wide mb-12">
          {course.title}
        </h1>

        <div className="border-t border-gray-200 pt-10">
          {/* Contenedor del video: miniatura con botón Play; al pulsarlo carga el video de YouTube */}
          <div className="relative w-full aspect-video bg-black rounded overflow-hidden shadow-lg mb-10 max-w-3xl mx-auto group">
            {playing && embed ? (
              <iframe
                className="w-full h-full"
                src={`${embed}${embed.includes('?') ? '&' : '?'}autoplay=1`}
                title={course.title}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                <img src={course.image} alt="Video thumbnail" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => embed && setPlaying(true)}
                    aria-label="Reproducir video"
                    className="bg-red-600 text-white rounded-lg p-4 pl-5 shadow-xl hover:bg-red-700 transition-colors transform group-hover:scale-105"
                  >
                    <Play fill="currentColor" size={32} />
                  </button>
                </div>
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs">M</div>
                  <div className="text-white">
                    <h3 className="font-bold text-sm leading-tight">{course.title}</h3>
                    <p className="text-xs text-gray-300">{course.author}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="max-w-3xl mx-auto text-gray-700">
            <p className="text-lg leading-relaxed mb-6">{course.description}</p>
            <div className="bg-fuchsia-50 border-l-4 border-primary p-4 rounded-r mb-10">
              <h4 className="font-semibold text-primary-dark mt-0">Actividad de Evaluación</h4>
              <p className="text-sm mb-0 mt-1">{course.evaluation}</p>
            </div>

            {/* LOS 3 BOTONES: Teórico / Práctico / Prueba */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {SECTIONS.map(({ to, label, hint, Icon }) => (
                <Link
                  key={to}
                  to={`/curso/${id}/${to}`}
                  className="group flex flex-col items-center text-center bg-primary hover:bg-primary-dark text-white rounded-xl py-6 px-4 shadow-md hover:shadow-lg transition-all"
                >
                  <Icon size={28} className="mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-lg font-semibold">{label}</span>
                  <span className="text-xs text-pink-100">{hint}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {editing && <CourseFormModal course={course} onClose={() => setEditing(false)} />}
    </div>
  );
};

export default Lesson;
