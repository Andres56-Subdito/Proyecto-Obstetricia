// =====================================================================
// CONTEXTO DE AUTENTICACIÓN (Firebase Authentication + rol en Firestore)
// =====================================================================
// - Firebase Authentication valida el correo y la contraseña.
// - Firestore valida que la persona tenga un PERFIL habilitado: users/{uid} con su `role`.
//   Si tiene cuenta en Authentication pero no perfil, NO puede entrar (acceso revocado).
// - NO existe registro público: las cuentas las crea el Administrador (Panel > Usuarios).
// - Cualquier componente puede leer `user`, `isStaff`, `isAdmin` con:  const { user } = useAuth();
// =====================================================================
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { ROLES } from '../constants';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Lee el perfil (nombre + rol) desde Firestore. Lanza 'app/no-profile' si no existe
// o si el rol no es válido; AuthForm traduce ese código a un mensaje para la persona.
async function loadProfile(fbUser) {
  const snap = await getDoc(doc(db, 'users', fbUser.uid));
  const data = snap.exists() ? snap.data() : null;

  if (!data || !Object.values(ROLES).includes(data.role)) {
    const err = new Error('La cuenta no tiene un perfil habilitado');
    err.code = 'app/no-profile';
    throw err;
  }
  return { uid: fbUser.uid, email: fbUser.email, name: data.name, role: data.role };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Firebase avisa aquí cada vez que alguien inicia o cierra sesión (también al recargar la página).
  useEffect(() => {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        setUser(await loadProfile(fbUser));
      } catch (err) {
        console.error('No se pudo leer el perfil:', err);
        setUser(null);
        await signOut(auth); // sin perfil válido no se mantiene la sesión
      } finally {
        setLoading(false);
      }
    });
  }, []);

  // Inicio de sesión. Si algo falla, el error llega a AuthForm para mostrar el mensaje.
  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    try {
      const profile = await loadProfile(cred.user);
      setUser(profile);
      return profile;
    } catch (err) {
      await signOut(auth);
      throw err;
    }
  };

  const logout = () => signOut(auth);

  const isAdmin = user?.role === ROLES.ADMIN;
  const isStaff = user?.role === ROLES.PROFESOR || isAdmin; // profesor o administrador

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isStaff, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
