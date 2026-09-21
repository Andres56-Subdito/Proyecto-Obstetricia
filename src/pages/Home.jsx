import React from 'react';
import HeroSection from '../components/HeroSection';
import CourseCard from '../components/CourseCard';
import ScrollReveal from '../components/ScrollReveal';
import { Sparkles, HeartHandshake, BookOpen, Award, CheckCircle2, ShieldCheck, Layers } from 'lucide-react';

const Home = () => {
  const courses = [
    {
      id: '1',
      title: 'Fisio-balón en el Trabajo de Parto',
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      isImmersive: true
    },
    {
      id: 'normativa-derechos',
      title: 'Normativa Legal y Derechos Durante la Atención Obstétrica',
      image: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      isImmersive: true
    },
    {
      id: '0',
      title: 'Aromaterapia en la Gestación y el Parto',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      isImmersive: false
    },
    {
      id: '2',
      title: 'Rebozo: Ritmo, Balance y Alivio en el Parto',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      isImmersive: true
    },
    {
      id: '3',
      title: 'Camilla de Parto Humanizada: Posiciones y Ergonomía Clínica',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      isImmersive: false
    },
    {
      id: '4',
      title: 'Musicoterapia Sensorial en el Parto',
      image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      isImmersive: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#faf8fb] text-gray-800 selection:bg-primary/20 selection:text-primary-dark">
      {/* 1. SECCIÓN HERO */}
      <HeroSection />

      {/* 2. SECCIÓN: ¿QUÉ ES SENTIR NACER? (Video explicativo) */}
      <section id="que-es-sentir-nacer" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary/10 text-primary mb-3">
              <Sparkles size={14} /> Introducción
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              ¿Qué es Sentir Nacer?
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={1}>
          <div className="relative mx-auto max-w-4xl rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video ring-1 ring-black/10 group">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/2p7-xX7m5hc"
              title="¿Qué es Sentir Nacer?"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </ScrollReveal>
      </section>

      {/* 3. SECCIÓN: INNOVACIÓN DOCENTE UCEN & ¿QUÉ HACEMOS? (IMAGEN 1) */}
      <section className="py-20 bg-white border-y border-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            
            {/* Imagen 1: Innovación Docente */}
            <div className="lg:col-span-5">
              <ScrollReveal>
                <div className="relative group mx-auto max-w-md lg:max-w-none">
                  {/* Fondo decorativo con ligero desenfoque */}
                  <div className="absolute -inset-2 bg-gradient-to-tr from-primary/30 to-purple-200/40 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5 bg-gray-100">
                    <img 
                      src="/images/que-hacemos.jpg" 
                      alt="Innovación Docente UCEN Región de Coquimbo - ¿Qué Hacemos?" 
                      className="w-full h-[460px] object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-5 text-white">
                      <p className="text-xs uppercase font-semibold tracking-wider text-pink-200">Simulación & Taller Clínico</p>
                      <p className="text-sm font-medium">Docencia Práctica en Obstetricia</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Contenido: ¿Qué Hacemos? */}
            <div className="lg:col-span-7">
              <ScrollReveal delay={1}>
                <div className="inline-block px-3 py-1 rounded-md text-xs font-semibold tracking-wide bg-purple-100/70 text-primary-dark mb-3">
                  Innovación Docente UCEN Región de Coquimbo
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-6">
                  ¿QUÉ HACEMOS?
                </h2>
                <div className="w-16 h-1 bg-primary mb-8 rounded-full"></div>
              </ScrollReveal>

              <div className="space-y-4 text-gray-700 text-base sm:text-lg leading-relaxed">
                <ScrollReveal delay={1}>
                  <div className="flex items-start gap-3.5 p-3.5 rounded-xl transition-colors hover:bg-purple-50/50">
                    <div className="mt-1 flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Layers size={17} />
                    </div>
                    <span>
                      Desarrollamos <strong className="text-gray-900 font-semibold">recursos sensoriales</strong> para la enseñanza del parto humanizado.
                    </span>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={2}>
                  <div className="flex items-start gap-3.5 p-3.5 rounded-xl transition-colors hover:bg-purple-50/50">
                    <div className="mt-1 flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Award size={17} />
                    </div>
                    <span>
                      Impartimos cursos certificados en <strong className="text-primary-dark font-semibold">Fisiobalón, Rebozo y Aromaterapia</strong>.
                    </span>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={2}>
                  <div className="flex items-start gap-3.5 p-3.5 rounded-xl transition-colors hover:bg-purple-50/50">
                    <div className="mt-1 flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <BookOpen size={17} />
                    </div>
                    <span>
                      Implementamos <strong className="text-gray-900 font-semibold">simulaciones sensoriales</strong> y talleres clínicos interdisciplinarios.
                    </span>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={3}>
                  <div className="flex items-start gap-3.5 p-3.5 rounded-xl transition-colors hover:bg-purple-50/50">
                    <div className="mt-1 flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <HeartHandshake size={17} />
                    </div>
                    <span>
                      Realizamos <strong className="text-gray-900 font-semibold">actividades comunitarias</strong> y colaboraciones con Hospitales y Centros de Salud.
                    </span>
                  </div>
                </ScrollReveal>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. SECCIÓN: MISIÓN Y VISIÓN (IMÁGENES 2 Y 3) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Tarjeta MISIÓN (IMAGEN 2) */}
          <ScrollReveal delay={1}>
            <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-purple-100/70 flex flex-col h-full group">
              <div className="relative h-64 sm:h-72 overflow-hidden bg-gray-100">
                <img 
                  src="/images/mision.png" 
                  alt="Misión - Sentir Nacer" 
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
              </div>
              <div className="p-8 sm:p-10 flex flex-col flex-grow text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-2xl bg-primary/10 text-primary">
                  <HeartHandshake size={26} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 uppercase tracking-wide mb-4">
                  MISIÓN
                </h3>
                <div className="w-12 h-1 bg-primary mx-auto mb-6 rounded-full"></div>
                <p className="text-gray-600 text-base leading-relaxed text-justify sm:text-center flex-grow">
                  Promover la formación de matronas y profesionales de la salud con una visión integral y humanizada del proceso reproductivo, fortaleciendo el uso de estrategias sensoriales, emocionales y basadas en evidencia que acompañen el parto de manera respetuosa.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Tarjeta VISIÓN (IMAGEN 3) */}
          <ScrollReveal delay={2}>
            <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-purple-100/70 flex flex-col h-full group">
              <div className="relative h-64 sm:h-72 overflow-hidden bg-gray-100">
                <img 
                  src="/images/vision.png" 
                  alt="Visión - Sentir Nacer" 
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
              </div>
              <div className="p-8 sm:p-10 flex flex-col flex-grow text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-2xl bg-primary/10 text-primary">
                  <CompassIcon size={26} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 uppercase tracking-wide mb-4">
                  VISIÓN
                </h3>
                <div className="w-12 h-1 bg-primary mx-auto mb-6 rounded-full"></div>
                <p className="text-gray-600 text-base leading-relaxed text-justify sm:text-center flex-grow">
                  Convertirnos en un referente nacional en innovación sensorial aplicada a la docencia obstétrica y al parto respetado, impactando en la formación universitaria, la práctica clínica y la comunidad.
                </p>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* 5. SECCIÓN: MALETÍN SENSORIAL DEL PARTO (IMAGEN 4) */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50/40 border-t border-purple-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Imagen 4: Maletín Sensorial */}
            <div className="lg:col-span-6">
              <ScrollReveal>
                <div className="relative group mx-auto max-w-lg lg:max-w-none">
                  <div className="absolute -inset-3 bg-gradient-to-r from-pink-300/30 to-purple-300/30 rounded-3xl blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-500"></div>
                  <div className="relative overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/5 bg-white">
                    <img 
                      src="/images/maletin.jpg" 
                      alt="Maletín Sensorial del Parto - Sentir Nacer Saberes que Nacen" 
                      className="w-full h-[400px] sm:h-[450px] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-xs font-bold text-primary shadow-sm flex items-center gap-1.5">
                      <Sparkles size={14} /> Innovación Sensorial
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Texto: Maletín Sensorial del Parto */}
            <div className="lg:col-span-6">
              <ScrollReveal delay={1}>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary/10 text-primary mb-3">
                  Herramienta Pedagógica
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-dark tracking-tight mb-6">
                  Maletín Sensorial del Parto
                </h2>
                <div className="w-20 h-1 bg-primary mb-8 rounded-full"></div>
                <p className="text-gray-700 text-lg sm:text-xl leading-relaxed mb-8">
                  Nuestra herramienta que permitirá una <strong className="text-gray-900 font-semibold">experiencia sensorial y vivencial</strong> del proceso de parto.
                </p>

                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-purple-100 shadow-sm space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                    <CheckCircle2 className="text-primary flex-shrink-0" size={18} />
                    <span>Integración de sentidos para el acompañamiento respetuoso.</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                    <CheckCircle2 className="text-primary flex-shrink-0" size={18} />
                    <span>Diseñado para docencia universitaria y práctica clínica.</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                    <CheckCircle2 className="text-primary flex-shrink-0" size={18} />
                    <span>Estrategias no farmacológicas validadas con evidencia.</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>

          </div>
        </div>
      </section>

      {/* 6. SECCIÓN: CURSOS (Catálogo formativo con links a las lecciones) */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary/10 text-primary mb-3">
              Módulos Formativos
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              CURSOS DISPONIBLES
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto mt-4 mb-4 rounded-full"></div>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Explora nuestras certificaciones especializadas en métodos no farmacológicos de alivio y humanización del parto.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, idx) => (
            <ScrollReveal key={course.id} delay={(idx % 3) + 1}>
              <CourseCard 
                id={course.id}
                title={course.title}
                image={course.image}
                isImmersive={course.isImmersive}
              />
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
  );
};

// Ícono auxiliar de brújula
const CompassIcon = ({ size = 24 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
  </svg>
);

export default Home;
