import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import CourseCard from '../components/CourseCard';
import ScrollReveal from '../components/ScrollReveal';
import ContentBlock from '../components/ContentBlock';
import BlockFormModal from '../components/BlockFormModal';
import { EditableText, EditableImage, MediaEditButton, EditModeToggle, useSiteText } from '../components/Editable';
import { useAuth } from '../context/AuthContext';
import { useCourses, useSiteBlocks } from '../hooks/useFirestore';
import { createSiteBlock, updateSiteBlock, deleteSiteBlock, seedCourses } from '../services/db';
import { toEmbedUrl } from '../utils/video';
import { Sparkles, HeartHandshake, BookOpen, Award, CheckCircle2, Layers, Plus, Settings } from 'lucide-react';

// =====================================================================
// PÁGINA DE INICIO
// =====================================================================
// CMS: cada texto/imagen editable usa <EditableText id="..." def="texto original" />.
//   - `id`  : clave única con la que el Administrador guarda su versión en Firestore.
//   - `def` : texto original. Para cambiar el texto BASE (el que se ve si nadie lo editó),
//             modifica `def` aquí. Para cambiarlo sin tocar código, usa "Editar página".
// =====================================================================

// Campos del formulario para los bloques de contenido general de esta página.
// Para agregar un campo nuevo a los bloques, añade una línea aquí (y muéstralo en ContentBlock.jsx).
const BLOCK_FIELDS = [
  { name: 'title', label: 'Título', type: 'text', required: true },
  { name: 'text', label: 'Texto', type: 'textarea' },
  { name: 'imageUrl', label: 'Imagen (enlace URL, opcional)', type: 'url' },
  { name: 'videoUrl', label: 'Video de YouTube (opcional)', type: 'url' },
];

// Clases repetidas de los 4 puntos de "¿Qué hacemos?" (iguales a las originales).
const bulletRow = 'flex items-start gap-3.5 p-3.5 rounded-xl transition-colors hover:bg-purple-50/50';
const bulletIcon = 'mt-1 flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center';

const Home = () => {
  // Los cursos y bloques vienen de Firestore (colecciones "courses" y "siteBlocks").
  const { data: courses, loading: loadingCourses } = useCourses();
  const { data: blocks } = useSiteBlocks();
  const { isStaff, isAdmin } = useAuth();
  const [blockModal, setBlockModal] = useState(null); // null | {} (nuevo) | { block } (editar)
  const [seeding, setSeeding] = useState(false);

  // Video de la sección "¿Qué es Sentir Nacer?" (editable por el administrador).
  const introVideo = toEmbedUrl(useSiteText('intro_video', 'https://www.youtube.com/embed/2p7-xX7m5hc'));

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedCourses();
    } catch (err) {
      console.error(err);
      alert('No se pudieron cargar los cursos. Revisa tus permisos y las reglas de Firestore.');
    }
    setSeeding(false);
  };

  const handleSaveBlock = (values) =>
    blockModal.block ? updateSiteBlock(blockModal.block.id, values) : createSiteBlock(values);

  const handleDeleteBlock = (block) => {
    if (window.confirm(`¿Eliminar el bloque "${block.title}"?`)) deleteSiteBlock(block.id);
  };

  return (
    <div className="min-h-screen bg-[#faf8fb] text-gray-800 selection:bg-primary/20 selection:text-primary-dark">
      {/* 1. SECCIÓN HERO */}
      <HeroSection />

      {/* 2. SECCIÓN: ¿QUÉ ES SENTIR NACER? (Video explicativo) */}
      <section id="que-es-sentir-nacer" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary/10 text-primary mb-3">
              <Sparkles size={14} /> <EditableText id="intro_badge" def="Introducción" />
            </span>
            <EditableText
              as="h2"
              id="intro_title"
              def="¿Qué es Sentir Nacer?"
              className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight"
            />
            <div className="w-20 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={1}>
          <div className="relative mx-auto max-w-4xl rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video ring-1 ring-black/10 group">
            <iframe
              className="w-full h-full"
              src={introVideo}
              title="¿Qué es Sentir Nacer?"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
            <MediaEditButton id="intro_video" def="https://www.youtube.com/embed/2p7-xX7m5hc" kind="video" label="Cambiar video" />
          </div>
        </ScrollReveal>
      </section>

      {/* 3. SECCIÓN: INNOVACIÓN DOCENTE UCEN & ¿QUÉ HACEMOS? */}
      <section className="py-20 bg-white border-y border-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">

            {/* Imagen: Innovación Docente */}
            <div className="lg:col-span-5">
              <ScrollReveal>
                <div className="relative group mx-auto max-w-md lg:max-w-none">
                  {/* Fondo decorativo con ligero desenfoque */}
                  <div className="absolute -inset-2 bg-gradient-to-tr from-primary/30 to-purple-200/40 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5 bg-gray-100">
                    <EditableImage
                      id="que_hacemos_img"
                      def="/images/que-hacemos.jpg"
                      alt="Innovación Docente UCEN Región de Coquimbo - ¿Qué Hacemos?"
                      className="w-full h-[460px] object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-5 text-white">
                      <EditableText as="p" id="que_hacemos_cap1" def="Simulación & Taller Clínico" className="text-xs uppercase font-semibold tracking-wider text-pink-200" />
                      <EditableText as="p" id="que_hacemos_cap2" def="Docencia Práctica en Obstetricia" className="text-sm font-medium" />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Contenido: ¿Qué Hacemos? */}
            <div className="lg:col-span-7">
              <ScrollReveal delay={1}>
                <EditableText
                  as="div"
                  id="que_hacemos_badge"
                  def="Innovación Docente UCEN Región de Coquimbo"
                  className="inline-block px-3 py-1 rounded-md text-xs font-semibold tracking-wide bg-purple-100/70 text-primary-dark mb-3"
                />
                <EditableText
                  as="h2"
                  id="que_hacemos_title"
                  def="¿QUÉ HACEMOS?"
                  className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-6"
                />
                <div className="w-16 h-1 bg-primary mb-8 rounded-full"></div>
              </ScrollReveal>

              {/* Cada punto se divide en 3 trozos (antes / negrita / después) para poder editar cada uno. */}
              <div className="space-y-4 text-gray-700 text-base sm:text-lg leading-relaxed">
                <ScrollReveal delay={1}>
                  <div className={bulletRow}>
                    <div className={bulletIcon}><Layers size={17} /></div>
                    <span>
                      <EditableText id="qh1_a" def="Desarrollamos " />
                      <strong className="text-gray-900 font-semibold"><EditableText id="qh1_b" def="recursos sensoriales" /></strong>
                      <EditableText id="qh1_c" def=" para la enseñanza del parto humanizado." />
                    </span>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={2}>
                  <div className={bulletRow}>
                    <div className={bulletIcon}><Award size={17} /></div>
                    <span>
                      <EditableText id="qh2_a" def="Impartimos cursos certificados en " />
                      <strong className="text-primary-dark font-semibold"><EditableText id="qh2_b" def="Fisiobalón, Rebozo y Aromaterapia" /></strong>
                      <EditableText id="qh2_c" def="." />
                    </span>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={2}>
                  <div className={bulletRow}>
                    <div className={bulletIcon}><BookOpen size={17} /></div>
                    <span>
                      <EditableText id="qh3_a" def="Implementamos " />
                      <strong className="text-gray-900 font-semibold"><EditableText id="qh3_b" def="simulaciones sensoriales" /></strong>
                      <EditableText id="qh3_c" def=" y talleres clínicos interdisciplinarios." />
                    </span>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={3}>
                  <div className={bulletRow}>
                    <div className={bulletIcon}><HeartHandshake size={17} /></div>
                    <span>
                      <EditableText id="qh4_a" def="Realizamos " />
                      <strong className="text-gray-900 font-semibold"><EditableText id="qh4_b" def="actividades comunitarias" /></strong>
                      <EditableText id="qh4_c" def=" y colaboraciones con Hospitales y Centros de Salud." />
                    </span>
                  </div>
                </ScrollReveal>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. SECCIÓN: MISIÓN Y VISIÓN */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

          {/* Tarjeta MISIÓN */}
          <ScrollReveal delay={1}>
            <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-purple-100/70 flex flex-col h-full group">
              <div className="relative h-64 sm:h-72 overflow-hidden bg-gray-100">
                <EditableImage
                  id="mision_img"
                  def="/images/mision.png"
                  alt="Misión - Sentir Nacer"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none"></div>
              </div>
              <div className="p-8 sm:p-10 flex flex-col flex-grow text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-2xl bg-primary/10 text-primary">
                  <HeartHandshake size={26} />
                </div>
                <EditableText as="h3" id="mision_title" def="MISIÓN" className="text-2xl font-bold text-gray-900 uppercase tracking-wide mb-4" />
                <div className="w-12 h-1 bg-primary mx-auto mb-6 rounded-full"></div>
                <EditableText
                  as="p"
                  id="mision_text"
                  multiline
                  def="Promover la formación de matronas y profesionales de la salud con una visión integral y humanizada del proceso reproductivo, fortaleciendo el uso de estrategias sensoriales, emocionales y basadas en evidencia que acompañen el parto de manera respetuosa."
                  className="text-gray-600 text-base leading-relaxed text-justify sm:text-center flex-grow"
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Tarjeta VISIÓN */}
          <ScrollReveal delay={2}>
            <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-purple-100/70 flex flex-col h-full group">
              <div className="relative h-64 sm:h-72 overflow-hidden bg-gray-100">
                <EditableImage
                  id="vision_img"
                  def="/images/vision.png"
                  alt="Visión - Sentir Nacer"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none"></div>
              </div>
              <div className="p-8 sm:p-10 flex flex-col flex-grow text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-2xl bg-primary/10 text-primary">
                  <CompassIcon size={26} />
                </div>
                <EditableText as="h3" id="vision_title" def="VISIÓN" className="text-2xl font-bold text-gray-900 uppercase tracking-wide mb-4" />
                <div className="w-12 h-1 bg-primary mx-auto mb-6 rounded-full"></div>
                <EditableText
                  as="p"
                  id="vision_text"
                  multiline
                  def="Convertirnos en un referente nacional en innovación sensorial aplicada a la docencia obstétrica y al parto respetado, impactando en la formación universitaria, la práctica clínica y la comunidad."
                  className="text-gray-600 text-base leading-relaxed text-justify sm:text-center flex-grow"
                />
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* 5. SECCIÓN: MALETÍN SENSORIAL DEL PARTO */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50/40 border-t border-purple-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Imagen: Maletín Sensorial */}
            <div className="lg:col-span-6">
              <ScrollReveal>
                <div className="relative group mx-auto max-w-lg lg:max-w-none">
                  <div className="absolute -inset-3 bg-gradient-to-r from-pink-300/30 to-purple-300/30 rounded-3xl blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-500"></div>
                  <div className="relative overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/5 bg-white">
                    <EditableImage
                      id="maletin_img"
                      def="/images/maletin.jpg"
                      alt="Maletín Sensorial del Parto - Sentir Nacer Saberes que Nacen"
                      className="w-full h-[400px] sm:h-[450px] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-xs font-bold text-primary shadow-sm flex items-center gap-1.5">
                      <Sparkles size={14} /> <EditableText id="maletin_tag" def="Innovación Sensorial" />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Texto: Maletín Sensorial del Parto */}
            <div className="lg:col-span-6">
              <ScrollReveal delay={1}>
                <EditableText
                  as="span"
                  id="maletin_badge"
                  def="Herramienta Pedagógica"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary/10 text-primary mb-3"
                />
                <div>
                  <EditableText
                    as="h2"
                    id="maletin_title"
                    def="Maletín Sensorial del Parto"
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-dark tracking-tight mb-6"
                  />
                </div>
                <div className="w-20 h-1 bg-primary mb-8 rounded-full"></div>
                <p className="text-gray-700 text-lg sm:text-xl leading-relaxed mb-8">
                  <EditableText id="maletin_a" def="Nuestra herramienta que permitirá una " />
                  <strong className="text-gray-900 font-semibold"><EditableText id="maletin_b" def="experiencia sensorial y vivencial" /></strong>
                  <EditableText id="maletin_c" def=" del proceso de parto." />
                </p>

                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-purple-100 shadow-sm space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                    <CheckCircle2 className="text-primary flex-shrink-0" size={18} />
                    <EditableText id="maletin_c1" def="Integración de sentidos para el acompañamiento respetuoso." />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                    <CheckCircle2 className="text-primary flex-shrink-0" size={18} />
                    <EditableText id="maletin_c2" def="Diseñado para docencia universitaria y práctica clínica." />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                    <CheckCircle2 className="text-primary flex-shrink-0" size={18} />
                    <EditableText id="maletin_c3" def="Estrategias no farmacológicas validadas con evidencia." />
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
            <EditableText
              as="span"
              id="cursos_badge"
              def="Módulos Formativos"
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary/10 text-primary mb-3"
            />
            <div>
              <EditableText
                as="h2"
                id="cursos_title"
                def="CURSOS DISPONIBLES"
                className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight"
              />
            </div>
            <div className="w-20 h-1 bg-primary mx-auto mt-4 mb-4 rounded-full"></div>
            <EditableText
              as="p"
              id="cursos_sub"
              multiline
              def="Explora nuestras certificaciones especializadas en métodos no farmacológicos de alivio y humanización del parto."
              className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto"
            />
          </div>
        </ScrollReveal>

        {/* Acceso rápido a la gestión: solo lo ven profesores y administradores */}
        {isStaff && (
          <div className="flex justify-center mb-10">
            <Link
              to="/panel"
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-md transition-colors"
            >
              <Settings size={18} /> Administrar cursos
            </Link>
          </div>
        )}

        {loadingCourses ? (
          <p className="text-center text-gray-500">Cargando cursos...</p>
        ) : courses && courses.length > 0 ? (
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
        ) : (
          <div className="text-center text-gray-500">
            <p className="mb-4">Todavía no hay cursos publicados.</p>
            {isStaff && (
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-md transition-colors disabled:opacity-50"
              >
                {seeding ? 'Cargando...' : 'Cargar cursos iniciales'}
              </button>
            )}
          </div>
        )}
      </section>

      {/* 7. SECCIÓN: BLOQUES DE CONTENIDO GENERAL (los agregan profesores y administradores) */}
      {((blocks && blocks.length > 0) || isStaff) && (
        <section className="pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <EditableText as="h2" id="mas_info_title" def="Más información" className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight" />
            {isStaff && (
              <button
                onClick={() => setBlockModal({})}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors"
              >
                <Plus size={18} /> Agregar bloque
              </button>
            )}
          </div>
          <div className="space-y-6">
            {(blocks || []).map((block) => (
              <ScrollReveal key={block.id}>
                <ContentBlock
                  block={block}
                  onEdit={isStaff ? () => setBlockModal({ block }) : undefined}
                  onDelete={isStaff ? () => handleDeleteBlock(block) : undefined}
                />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {blockModal && (
        <BlockFormModal
          heading={blockModal.block ? 'Editar bloque' : 'Nuevo bloque'}
          fields={BLOCK_FIELDS}
          initial={blockModal.block}
          onSave={handleSaveBlock}
          onClose={() => setBlockModal(null)}
        />
      )}

      {/* Interruptor del CMS: solo se dibuja para el Administrador */}
      <EditModeToggle isAdmin={isAdmin} />
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
