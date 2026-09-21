import React from 'react';
import { BookOpen, Download } from 'lucide-react';

const Dashboard = () => {
  // Mock data for student progress
  const enrolledCourses = [
    { id: 1, title: 'Fisio-balón en el Trabajo de Parto', progress: 100, lastAccessed: 'Hoy' },
    { id: 2, title: 'Normativa Legal y Derechos', progress: 45, lastAccessed: 'Hace 2 días' },
    { id: 3, title: 'Musicoterapia', progress: 0, lastAccessed: 'Nunca' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Panel de Estudio</h1>
          <p className="text-gray-600 mt-1">Bienvenida, Alumna. Continúa tu formación.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen className="text-primary" size={20} />
          Mis Cursos Inscritos
        </h2>
        
        <div className="space-y-6">
          {enrolledCourses.map(course => (
            <div key={course.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                {course.progress === 100 ? (
                  <button className="mt-2 md:mt-0 flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-green-100 transition-colors">
                    <Download size={16} />
                    Descargar Certificado
                  </button>
                ) : (
                  <span className="mt-2 md:mt-0 text-sm text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    En progreso
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 mt-3">
                <div className="flex-grow bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${course.progress === 100 ? 'bg-green-500' : 'bg-primary'}`} 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                  {course.progress}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
