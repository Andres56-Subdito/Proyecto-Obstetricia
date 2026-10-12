// =====================================================================
// MOTOR DE BÚSQUEDA (lupa del Navbar)
// =====================================================================
// Busca en memoria sobre los datos que ya están cargados desde Firestore
// (cursos, contenido Teórico/Práctico y bloques de la portada), así que es instantáneo
// y no hace lecturas extra a la base de datos.
// =====================================================================

// Pasa a minúsculas y quita tildes: "Fisiobalón" coincide con "fisiobalon".
export const normalize = (value = '') =>
  String(value).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export const MIN_QUERY_LENGTH = 2; // mínimo de letras para empezar a buscar
export const MAX_RESULTS = 8; // máximo de resultados mostrados

export function searchContent(courses, siteBlocks, rawQuery) {
  const q = normalize(rawQuery.trim());
  if (q.length < MIN_QUERY_LENGTH) return [];

  // Todas las palabras escritas deben aparecer (en cualquier orden).
  const terms = q.split(/\s+/);
  const matches = (...fields) => {
    const haystack = normalize(fields.filter(Boolean).join(' '));
    return terms.every((t) => haystack.includes(t));
  };

  const results = [];

  courses.forEach((c) => {
    if (matches(c.title, c.description, c.author)) {
      results.push({ key: `c-${c.id}`, type: 'Curso', title: c.title, subtitle: c.author, to: `/curso/${c.id}` });
    }
    (c.teoria || []).forEach((b) => {
      if (matches(b.title, b.text)) {
        results.push({ key: `t-${c.id}-${b.id}`, type: 'Teórico', title: b.title, subtitle: c.title, to: `/curso/${c.id}/teorico` });
      }
    });
    (c.practica || []).forEach((b) => {
      if (matches(b.title, b.text)) {
        results.push({ key: `p-${c.id}-${b.id}`, type: 'Práctico', title: b.title, subtitle: c.title, to: `/curso/${c.id}/practico` });
      }
    });
  });

  siteBlocks.forEach((b) => {
    if (matches(b.title, b.text)) {
      results.push({ key: `b-${b.id}`, type: 'Información', title: b.title, subtitle: 'Página de inicio', to: '/' });
    }
  });

  return results.slice(0, MAX_RESULTS);
}
