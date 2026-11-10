// =====================================================================
// CURSOS INICIALES
// =====================================================================
// Son los cursos que antes estaban escritos "a mano" en Home.jsx y Lesson.jsx.
// Se suben a Firestore UNA sola vez con el botón "Cargar cursos iniciales"
// (aparece a profesores/administradores cuando la colección está vacía).
// Después de eso se administran desde el Panel y este archivo ya no se usa.
//
// Los `id` se mantienen iguales a los de antes para que los enlaces viejos sigan funcionando.
// =====================================================================
const img = (photo, w = 800) =>
  `https://images.unsplash.com/${photo}?ixlib=rb-4.0.3&auto=format&fit=crop&w=${w}&q=80`;

export const SEED_COURSES = [
  {
    id: '1',
    title: 'Fisio-balón en el Trabajo de Parto',
    image: img('photo-1571019614242-c5c5dee9f50b'),
    isImmersive: true,
    author: 'Kinesióloga Obstétrica',
    description: 'El fisiobalón facilita el movimiento de la pelvis y ayuda en el descenso fetal.',
    evaluation: 'Realiza el test práctico sobre posturas ergonómicas.',
  },
  {
    id: 'normativa-derechos',
    title: 'Normativa Legal y Derechos Durante la Atención Obstétrica',
    image: img('photo-1581056771107-24ca5f033842'),
    isImmersive: true,
    author: 'Equipo Sentir Nacer',
    description: 'Revisa el marco jurídico que protege los derechos de las mujeres durante la atención obstétrica.',
    evaluation: 'Completa el formulario de evaluación sobre normativa y derechos.',
  },
  {
    id: '0',
    title: 'Aromaterapia en la Gestación y el Parto',
    image: img('photo-1608571423902-eed4a5ad8108'),
    isImmersive: false,
    author: 'Especialista en Aromaterapia',
    description: 'Descubre cómo los aceites esenciales pueden favorecer la relajación y el bienestar durante el proceso de parto.',
    evaluation: 'Al finalizar, completa el formulario sobre las propiedades de la lavanda y la manzanilla.',
  },
  {
    id: '2',
    title: 'Rebozo: Ritmo, Balance y Alivio en el Parto',
    image: img('photo-1544367567-0f2fcb009e0b'),
    isImmersive: true,
    author: 'Especialista en Rebozo',
    description: 'Aprende a utilizar el rebozo como herramienta de apoyo durante el embarazo y el parto.',
    evaluation: 'Completa el ejercicio práctico sobre técnicas de uso del rebozo.',
  },
  {
    id: '3',
    title: 'Camilla de Parto Humanizada: Posiciones y Ergonomía Clínica',
    image: img('photo-1519494026892-80bbd2d6fd0d'),
    isImmersive: false,
    author: 'Especialistas en Camillas de Parto',
    description: 'Descubre las ventajas del uso de la camilla de parto humano durante el proceso de nacimiento.',
    evaluation: 'Completa el formulario de evaluación sobre las características de la camilla.',
  },
  {
    id: '4',
    title: 'Musicoterapia Sensorial en el Parto',
    image: img('photo-1519681393784-d120267933ba'),
    isImmersive: false,
    author: 'María Fernández Gómez',
    description:
      'La musicoterapia en el contexto obstétrico es una herramienta no farmacológica valiosa para la gestión del estrés y el dolor durante el trabajo de parto. A través de este módulo inmersivo, exploraremos el entorno ideal.',
    evaluation: 'Al finalizar el video, responde el cuestionario de 5 preguntas ubicado en la plataforma para avanzar al siguiente módulo.',
  },
];
