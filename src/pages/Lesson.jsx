import React from 'react';
import { Play } from 'lucide-react';
import { useParams } from 'react-router-dom';

const Lesson = () => {
  // 💡 useParams() extrae el "id" de la URL (ej: /curso/aromaterapia -> id = "aromaterapia")
  const { id } = useParams();

  // 💡 MOCK DATA: Aquí simulamos una base de datos. 
  // En el futuro, harías un fetch() a tu backend Flask usando el "id".
  // Para agregar más cursos, simplemente añade un nuevo bloque a este objeto.
  const courseContent = {
    '0': {
      title: 'AROMATERAPIA',
      videoThumbnail: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      author: 'Especialista en Aromaterapia',
      description: 'Descubre cómo los aceites esenciales pueden favorecer la relajación y el bienestar durante el proceso de parto.',
      evaluation: 'Al finalizar, completa el formulario sobre las propiedades de la lavanda y la manzanilla.'
    },
    '1': {
      title: 'FISIOBALÓN',
      videoThumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      author: 'Kinesióloga Obstétrica',
      description: 'El fisiobalón facilita el movimiento de la pelvis y ayuda en el descenso fetal.',
      evaluation: 'Realiza el test práctico sobre posturas ergonómicas.'
    },

    '2': {
      title: 'REBOZO',
      videoThumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: 'Especialista en Rebozo',
      description: 'Aprende a utilizar el rebozo como herramienta de apoyo durante el embarazo y el parto.',
      evaluation: 'Completa el ejercicio práctico sobre técnicas de uso del rebozo.'
    },

    '3': {
      title: 'Camilla de Parto Humano',
      videoThumbnail: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: 'Especialistas en Camillas de Parto',
      description: 'Descubre las ventajas del uso de la camilla de parto humano durante el proceso de nacimiento.',
      evaluation: 'Completa el formulario de evaluación sobre las características de la camilla.'
    },


    //siguiendo asi los demas cursos, tengo que agregar el id modificar la ruta de la foto y asi despues agregar la descripcion de cada curso
    //pega para mas adelante, colocar el link para poder hacer el curso como sale en el instructivo que tengo



    // Este era el curso viendo por defecto
    '4': {
      title: 'MUSICOTERAPIA',
      videoThumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      author: 'María Fernández Gómez',
      description: 'La musicoterapia en el contexto obstétrico es una herramienta no farmacológica valiosa para la gestión del estrés y el dolor durante el trabajo de parto. A través de este módulo inmersivo, exploraremos el entorno ideal.',
      evaluation: 'Al finalizar el video, responde el cuestionario de 5 preguntas ubicado en la plataforma para avanzar al siguiente módulo.'
    },
    // Contenido por defecto si el ID no existe
    'default': {
      title: 'CURSO EN DESARROLLO',
      videoThumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      author: 'Equipo Sentir Nacer',
      description: 'Este módulo (ID: ' + id + ') está siendo preparado. Vuelve pronto.',
      evaluation: 'Pendiente.'
    }
  };

  // Buscamos el contenido basado en el ID de la URL. Si no existe, usamos el 'default'.
  const currentLesson = courseContent[id] || courseContent['default'];

  return (
    // 💡 CAMBIAR FONDO DE LA PÁGINA: Modifica "bg-white" a "bg-gray-100", etc.
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* 💡 CAMBIAR ESTILO DEL TÍTULO: Aquí puedes cambiar "text-[#a236df]" por "text-primary" o cualquier color hexadecimal */}
        <h1 className="text-center text-4xl md:text-5xl font-display font-bold text-[#a236df] uppercase tracking-wide mb-12">
          {currentLesson.title}
        </h1>

        <div className="border-t border-gray-200 pt-10">
          {/* Main Video Container */}
          {/* 💡 CAMBIAR FONDO DEL VIDEO: "bg-black" es el fondo detrás de la miniatura */}
          <div className="relative w-full aspect-video bg-black rounded overflow-hidden shadow-lg mb-10 max-w-3xl mx-auto group">
            {/* 💡 CAMBIAR IMAGEN DEL VIDEO: Aquí se carga el "videoThumbnail" definido arriba */}
            <img 
              src={currentLesson.videoThumbnail} 
              alt="Video thumbnail" 
              className="w-full h-full object-cover opacity-80"
            />
            {/* Fake Youtube UI Overlay (Botón de Play) */}
            <div className="absolute inset-0 flex items-center justify-center">
               {/* 💡 CAMBIAR BOTÓN PLAY: "bg-red-600" controla el color del botón (estilo Youtube) */}
               <button className="bg-red-600 text-white rounded-lg p-4 pl-5 shadow-xl hover:bg-red-700 transition-colors transform group-hover:scale-105">
                 <Play fill="currentColor" size={32} />
               </button>
            </div>
            {/* Overlay superior con el título del video */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs">M</div>
               <div className="text-white">
                 <h3 className="font-bold text-sm leading-tight">{currentLesson.title}</h3>
                 <p className="text-xs text-gray-300">{currentLesson.author}</p>
               </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto text-gray-700">
             {/* 💡 CAMBIAR TEXTO PRINCIPAL: Aquí se inyecta la descripción */}
             <p className="text-lg leading-relaxed mb-6">
               {currentLesson.description}
             </p>
             {/* 💡 CAMBIAR BLOQUE DE EVALUACIÓN: "bg-fuchsia-50" (fondo clarito) y "border-primary" (borde morado izquierdo) */}
             <div className="bg-fuchsia-50 border-l-4 border-primary p-4 rounded-r">
               <h4 className="font-semibold text-primary-dark mt-0">Actividad de Evaluación</h4>
               <p className="text-sm mb-0 mt-1">{currentLesson.evaluation}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lesson;
