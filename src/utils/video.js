// Convierte un enlace normal de YouTube (youtu.be/... o youtube.com/watch?v=...)
// en el enlace "embed" que necesita un <iframe>. Si no es de YouTube, devuelve el mismo enlace.
export const toEmbedUrl = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
};
