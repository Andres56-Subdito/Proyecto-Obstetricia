# Guía de configuración y personalización — Sentir Nacer

Esta guía explica (1) cómo dejar Firebase funcionando, (2) cómo funciona cada regla importante y (3) qué archivo tocar para cada cambio futuro.

---

## 1. Puesta en marcha (una sola vez)

### 1.1 Crear el proyecto en Firebase
1. <https://console.firebase.google.com> > **Agregar proyecto**.
2. **Authentication** > Comenzar > *Sign-in method* > activa **Correo electrónico/contraseña**.
3. **Firestore Database** > Crear base de datos (modo producción).
4. **Firestore Database > Reglas**: pega el contenido de `firestore.rules` y pulsa **Publicar**. *(Hay que volver a publicarlas cada vez que cambien; esta versión trae reglas nuevas.)*
5. **Configuración del proyecto > General > Tus apps > `</>` (Web)**: registra la app y copia la configuración.

### 1.2 Conectar la web con Firebase
1. Copia `.env.example` como `.env.local` y pega ahí los valores.
2. `npm install` y luego `npm run dev`.

### 1.3 Crear el PRIMER Administrador (a mano, una sola vez)
No existe registro público, así que el primer administrador se crea desde la consola de Firebase:
1. **Authentication > Users > Add user**: escribe correo y contraseña. Copia el **UID** que aparece.
2. **Firestore Database > Iniciar colección** `users` > ID del documento = ese **UID** > campos (string):
   `name` = tu nombre, `email` = tu correo, `role` = `admin`.
3. Inicia sesión en la web: entrarás al **Panel de Administración**.

> Si ya tenías cuentas creadas con la versión anterior (con registro), siguen funcionando: ya tienen su documento en `users`.

A partir de ahí, el resto de cuentas se crean desde **Panel > Usuarios y accesos > Nuevo usuario** (correo, contraseña inicial y rol).

### 1.4 Cargar los cursos iniciales
Con sesión de profesor/admin, en la portada o en el Panel aparece **Cargar cursos iniciales** (una sola vez).

---

## 2. Cómo funciona cada requerimiento

### Acceso obligatorio y sin registro
- `App.jsx` → `AppShell`: es el *Route Guard* global. Sin sesión, **cualquier URL redirige a `/login`** y no se dibuja el Navbar.
- No hay formulario ni enlace de registro. `AuthContext.jsx` solo tiene `login` y `logout`.
- Inicio de sesión = Firebase Authentication (correo/contraseña) **+** Firestore (`users/{uid}` debe existir con un rol válido). Una cuenta sin documento en `users` no puede entrar: así se **revoca** un acceso.
- Tras iniciar sesión: alumno → `/dashboard`; profesor/admin → `/panel` (`homeForRole` en `constants.js`).

### Panel visual para el Administrador (CMS)
- En **Inicio** el administrador ve el botón **«Editar página»** (abajo a la derecha). En modo edición, cada texto/imagen/video editable aparece resaltado; al hacer clic se abre un editor y se guarda en Firestore (`siteContent/home`).
- Cada elemento editable se declara así en `pages/Home.jsx` / `HeroSection.jsx`:
  `<EditableText id="intro_title" def="¿Qué es Sentir Nacer?" />`
  - `id` = nombre único de guardado. **`def` = texto base** (el que se ve si nadie lo editó).
- «Restaurar el original» en el editor vuelve al `def`.
- Los bloques extra de «Más información» siguen siendo editables por profesor y admin (botón *Agregar bloque*).

### Menús que se cierran al hacer clic fuera
- `hooks/useClickOutside.js`: detecta clics/toques fuera de un elemento (y la tecla Esc).
- Se usa en `Navbar.jsx` (menú de cursos y menú móvil) y `SearchBox.jsx` (lupa). Para otro menú: `useClickOutside(ref, () => setOpen(false), open)`.
- La animación suave sale de las clases `transition-all duration-200` (cambia `duration-200` para más lento/rápido).

### Buscador (lupa)
- `components/SearchBox.jsx` (interfaz) + `utils/search.js` (lógica). Filtra mientras escribes; Enter abre el primer resultado.
- Busca en: título/descripción/autor de cursos, bloques Teórico y Práctico, y bloques de inicio. Ignora tildes y mayúsculas.
- Ajustes en `utils/search.js`: `MIN_QUERY_LENGTH` (letras mínimas) y `MAX_RESULTS`. Para buscar en más campos, edita `searchContent`.

### Evaluaciones: Práctico vs. Prueba
Ambas usan `components/QuizSection.jsx`; la diferencia es la prop `isFinal`.

| | Práctico (test) | Prueba (examen final) |
|---|---|---|
| Intentos | **Ilimitados** | **Uno**; luego se bloquea |
| ¿Se guarda la nota? | No | Sí (`results/{uid_curso}`) |
| Repetir | Siempre | Solo si el profesor lo autoriza |
| Dónde se editan las preguntas | Apartado Práctico del curso | Apartado Prueba del curso |

**Permiso del profesor:** Panel > **Resultados** > columna **«Permitir repetir»** (interruptor por alumno y curso). Activado, el alumno puede rendir **una vez más**; al enviar, el permiso se consume y la prueba se bloquea de nuevo. Esto lo hacen cumplir también las reglas de Firestore, no solo la pantalla.
Profesores y administradores pueden abrir la Prueba para revisarla sin que se guarde nada.

---

## 3. Qué puede hacer cada rol

| Acción | Alumno | Profesor | Admin |
|---|:-:|:-:|:-:|
| Ver cursos, Teórico, Práctico; hacer el test práctico | ✅ | ✅ | ✅ |
| Rendir la Prueba final (1 intento) | ✅ | vista previa | vista previa |
| Crear / editar / borrar cursos, contenido y preguntas | ❌ | ✅ | ✅ |
| Bloques de «Más información» en inicio | ❌ | ✅ | ✅ |
| Ver notas y **autorizar repetir la Prueba** | ❌ | ✅ | ✅ |
| **Editar textos/imágenes de la portada (CMS)** | ❌ | ❌ | ✅ |
| Mover el orden de los cursos | ❌ | ❌ | ✅ |
| Crear usuarios, cambiar roles, revocar accesos | ❌ | ❌ | ✅ |

---

## 4. Mapa del código

```
src/
├─ firebase.js                 Conexión a Firebase (lee .env.local)
├─ constants.js                Roles, % de aprobación, tiempo límite del examen, redirección por rol
├─ context/
│  ├─ AuthContext.jsx          Login/logout y rol del usuario
│  └─ SiteContentContext.jsx   Textos del CMS + modo edición
├─ services/db.js              TODAS las lecturas/escrituras a Firestore
├─ hooks/                      useFirestore.js (datos en vivo), useClickOutside.js
├─ utils/                      search.js (buscador), video.js (enlaces de YouTube)
├─ App.jsx                     Route Guard global y rutas por rol
├─ pages/                      Home, Lesson, CourseBlocksPage, CoursePrueba, Dashboard, AdminPanel
└─ components/                 Navbar, SearchBox, QuizSection, Editable, AuthForm, modales...
```

---

## 5. Guía de Personalización — «quiero cambiar…»

### Textos
| Quiero cambiar… | Dónde |
|---|---|
| Un texto de la portada | **Sin código:** Inicio > «Editar página» (admin). Texto base: el `def` en `pages/Home.jsx` o `components/HeroSection.jsx` |
| Agregar un texto editable nuevo | Usa `<EditableText id="nombre_nuevo" def="..." />` |
| Textos de los 3 botones (Teórico/Práctico/Prueba) | `pages/Lesson.jsx` → lista `SECTIONS` |
| Mensajes de error del login | `components/AuthForm.jsx` → `AUTH_ERRORS` |
| Título/descripción/imagen de un curso | Panel > Cursos > |
| Nombre mostrado de cada rol | `constants.js` → `ROLE_LABELS` |

### Estilos
- **Colores de marca**: `tailwind.config.js` → `primary`, `primary-dark`, `primary-light`.
- **Tipografía**: `tailwind.config.js` → `fontFamily`.
- **Campos de formulario (todos los modales)**: `components/Modal.jsx` → `inputClass`.
- **Aspecto de la Prueba**: `components/QuizSection.jsx` y `pages/CoursePrueba.jsx`.
- **Animaciones al hacer scroll**: `src/index.css` (`.reveal-on-scroll`).

### Parámetros de las evaluaciones
| Quiero cambiar… | Dónde |
|---|---|
| % mínimo para aprobar | `constants.js` → `PASS_PERCENT` |
| **Tiempo límite de la Prueba final** (minutos; `0` = sin límite) | `constants.js` → `FINAL_EXAM_TIME_LIMIT_MIN` |
| Cómo se corrige cada pregunta | `components/QuizSection.jsx` → `grade()` |
| Tipos de pregunta disponibles | `components/QuestionFormModal.jsx` → `QUESTION_TYPES` (+ `QuizSection.jsx`) |
| Que la Prueba permita N intentos en vez de 1 | `QuizSection.jsx` (`locked`/`canRetry`) y `firestore.rules` (bloque `results`) |
| Que el Práctico también guarde nota | `QuizSection.jsx` → `tracked` (hoy solo `isFinal`) |

### Firebase y reglas
| Quiero… | Dónde |
|---|---|
| Cambiar de proyecto de Firebase | `.env.local` |
| Renombrar colecciones | `services/db.js` (constantes al inicio) |
| **Cambiar quién puede leer/escribir qué** | `firestore.rules` → **Publicar** en la consola de Firebase |
| Agregar un campo a los cursos | `COURSE_DEFAULTS` (`services/db.js`) + `CourseFormModal.jsx` |
| Agregar un rol nuevo | `constants.js` (`ROLES`, `ROLE_LABELS`), `firestore.rules` y `ProtectedRoute` en `App.jsx` |
| A qué pantalla va cada rol al entrar | `constants.js` → `homeForRole` |

> Cambiar permisos solo en React **no es seguro**. La seguridad real está en `firestore.rules`.

---

## 6. Limitaciones conocidas
- **Respuestas correctas visibles**: están en el documento del curso, así que un alumno técnico podría verlas en las herramientas del navegador. Del mismo modo, un alumno técnico podría falsear su propio puntaje. Es suficiente para práctica formativa; para evaluaciones de alto riesgo hay que corregir en servidor (Cloud Functions).
- **Revocar acceso** quita el perfil de Firestore (no puede entrar), pero el correo sigue existiendo en *Authentication* hasta que lo borres allí.
- **Contraseñas**: el admin define la inicial. Para restablecerlas, usa la consola de Firebase (Authentication > Users > ⋮ > Restablecer contraseña).
- **Resultados del test Práctico** no se almacenan (solo se muestran al alumno).
- **Imágenes** por enlace URL (no se suben archivos).
- **`backend/`** (Flask) ya no se usa. `backend/firebase-key.json` es una clave privada y está en `.gitignore`.
