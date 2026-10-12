import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCourses, useResults } from '../hooks/useFirestore';
import { PASS_PERCENT } from '../constants';

// Panel del ALUMNO: ve todos los cursos y el resultado de su última prueba en cada uno.
// (Antes eran datos de ejemplo; ahora vienen de Firestore: colección "results".)
const Dashboard = () => {
  const { user } = useAuth();
  const { data: courses, loading } = useCourses();
  const { data: results } = useResults(user, false);

  // Indexamos los resultados por curso para buscarlos rápido.
  const byCourse = Object.fromEntries((results || []).map((r) => [r.courseId, r]));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Panel de Estudio</h1>
          <p className="text-gray-600 mt-1">Bienvenido/a, {user.name}. Continúa tu formación.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen className="text-primary" size={20} />
          Mis Cursos
        </h2>

        {loading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : (
          <div className="space-y-6">
            {(courses || []).map((course) => {
              const result = byCourse[course.id];
              const progress = result ? result.percent : 0;
              const passed = result && progress >= PASS_PERCENT;
              return (
                <div key={course.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                    <Link to={`/curso/${course.id}`} className="text-lg font-medium text-gray-900 hover:text-primary">
                      {course.title}
                    </Link>
                    {passed ? (
                      <span className="mt-2 md:mt-0 text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-medium">
                        Aprobado
                      </span>
                    ) : (
                      <span className="mt-2 md:mt-0 text-sm text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        {result ? 'Por mejorar' : 'Sin prueba rendida'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex-grow bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${passed ? 'bg-green-500' : 'bg-primary'}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-12 text-right">{progress}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
