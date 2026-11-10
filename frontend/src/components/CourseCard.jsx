import React from 'react';
import { PlayCircle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const CourseCard = ({ id, title, image, isImmersive }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full border border-gray-100">
      <div className="relative h-48 bg-gray-200 overflow-hidden group">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        
        {isImmersive && (
          <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded shadow-md flex items-center gap-1">
            <Eye size={14} />
            Realidad Inmersiva
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <PlayCircle className="text-white w-12 h-12" />
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-primary-dark mb-2 line-clamp-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4 flex-grow">
          Aprende y experimenta a través de nuestro módulo interactivo.
        </p>
        
        <Link 
          to={`/curso/${id}`} 
          className="mt-auto block w-full text-center bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Ver Curso
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;
