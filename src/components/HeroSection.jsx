import React from 'react';

const HeroSection = () => {
  return (
    // TAMAÑO DEL HERO: "h-[80vh]" en móvil y "md:h-[90vh]" en pc controlan el alto. 
    // Si quieres que ocupe toda la pantalla, pon "h-screen".
    <div className="relative w-full h-[80vh] md:h-[90vh] bg-gray-900 overflow-hidden flex items-center">
      
      {/* Background Image */}
      <div 
        // CAMBIAR EFECTO DE LA IMAGEN: "opacity-60" controla qué tan oscura se ve la imagen (0 a 100).
        className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-60"
        
        // CAMBIAR IMAGEN DE FONDO: 
        // Cambia la URL por el enlace de la imagen del bebé.
        // Si pones la imagen en la carpeta "public", puedes usar: "url('/bebe.jpg')"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555252834-453006d15a51?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')" }}
      ></div>
      
      {/* Content overlay */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
        {/* POSICIÓN DEL TEXTO: "mt-10 md:mt-20" controla el margen superior (para bajar el texto). */}
        <div className="max-w-2xl mt-10 md:mt-20">
          
          {/* CAMBIAR TEXTO PRINCIPAL: Modifica el contenido que está entre <h1> y </h1> */}
          {/* "text-4xl" a "text-6xl" controlan el tamaño en distintos dispositivos. */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white tracking-wide leading-[1.1] drop-shadow-md">
            Sentir Nacer: Herramienta<br />
            Sensorial para Humanizar el<br />
            Parto
          </h1>
          
        </div>
      </div>
      
      {/* Scroll indicator at the bottom (La flechita que rebota hacia abajo) */}
      <button 
        onClick={() => {
          const el = document.getElementById('que-es-sentir-nacer');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        aria-label="Desplazar hacia abajo"
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/80 hover:text-white transition-colors animate-bounce cursor-pointer p-2 rounded-full focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>
    </div>
  );
};

export default HeroSection;
