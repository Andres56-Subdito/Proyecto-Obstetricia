// =====================================================================
// CONTEXTO DEL CMS INTERNO (textos editables de la página de inicio)
// =====================================================================
// Funciona así:
//   1) Cada texto de la portada se escribe en el código con un identificador y un valor original:
//        <EditableText id="hero_title" def="Texto original" />
//   2) Aquí se escucha en tiempo real el documento Firestore  siteContent/home  ->  { texts: {...} }
//      Si existe un valor guardado para ese `id`, se muestra ese; si no, el original.
//   3) El ADMINISTRADOR puede activar el "Modo edición": los textos quedan resaltados y, al
//      hacer clic en uno, se abre un editor que guarda el cambio en Firestore.
// =====================================================================
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { subscribeSiteContent } from '../services/db';
import SiteEditorModal from '../components/SiteEditorModal';

export const SiteContentContext = createContext({
  texts: {}, editMode: false, setEditMode: () => {}, openEditor: () => {},
});
export const useSiteContent = () => useContext(SiteContentContext);

export const SiteContentProvider = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [texts, setTexts] = useState({}); // { clave: valor } guardado en Firestore
  const [editRequested, setEditMode] = useState(false); // el admin activó el modo edición
  const [editing, setEditing] = useState(null); // elemento que se está editando ahora (o null)

  // Solo se escucha Firestore cuando hay una sesión iniciada (las reglas lo exigen).
  useEffect(() => {
    if (!user) return undefined;
    return subscribeSiteContent(
      (data) => setTexts(data?.texts || {}),
      (err) => console.error('No se pudo leer siteContent:', err),
    );
  }, [user]);

  // Aunque alguien manipule el estado, solo el administrador puede estar en modo edición.
  const editMode = isAdmin && editRequested;

  return (
    <SiteContentContext.Provider value={{ texts: user ? texts : {}, editMode, setEditMode, openEditor: setEditing }}>
      {children}
      {editing && <SiteEditorModal item={editing} onClose={() => setEditing(null)} />}
    </SiteContentContext.Provider>
  );
};
