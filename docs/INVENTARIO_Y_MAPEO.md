# Inventario del Frontend (EVA1) y modelos del Backend

Análisis hecho sobre el código de `frontend/src`. Sirve para justificar los modelos y endpoints del Backend.

## 1. Pantallas del Frontend (8)

| # | Pantalla | Ruta | Qué hace | Datos que usa |
|---|---|---|---|---|
| 1 | Login | `/login` | Inicio de sesión con correo y contraseña | Usuario |
| 2 | Inicio | `/` | Portada, listado de cursos y bloques «Más información» | Cursos, bloques de inicio |
| 3 | Curso | `/curso/:id` | Ficha del curso con 3 botones (Teórico, Práctico, Prueba) | Curso |
| 4 | Teórico | `/curso/:id/teorico` | Lee y gestiona bloques de teoría | Bloques de contenido |
| 5 | Práctico | `/curso/:id/practico` | Bloques prácticos + test práctico (intentos ilimitados) | Bloques, preguntas y opciones |
| 6 | Prueba | `/curso/:id/prueba` | Examen final (un solo intento) | Preguntas, opciones, resultado |
| 7 | Mi Panel | `/dashboard` | El alumno ve su nota por curso | Cursos y resultados |
| 8 | Panel de gestión | `/panel` | Profesor/admin: cursos, resultados, usuarios | Cursos, resultados, usuarios |

## 2. Operaciones CRUD existentes

Se pueden crear, leer, actualizar y eliminar: **cursos, bloques Teórico/Práctico, preguntas y sus opciones**.
Los **resultados** se crean al rendir la Prueba y se actualiza el permiso de repetirla. Los **usuarios** los gestiona el administrador.

## 3. Datos que se guardan y sus relaciones

```
Curso 1 ──< BloqueContenido
Curso 1 ──< Pregunta 1 ──< Opcion
User  1 ──< Resultado >── 1 Curso
```

| En el Frontend (Firestore) | Modelo Django |
|---|---|
| `courses/{id}` | `Curso` |
| `course.teoria[]` y `course.practica[]` | `BloqueContenido` (campo `seccion`) |
| `course.practicaTest[]` y `course.prueba[]` | `Pregunta` (campo `cuestionario`) |
| `question.options[]` | `Opcion` (campo `es_correcta`) |
| `results/{uid_cursoId}` | `Resultado` |
| `users/{uid}` | `User` de Django |

## 4. Qué es Backend y qué es Frontend

- **Backend:** guardar y consultar datos (CRUD), relaciones entre datos, usuarios y permisos, y las reglas de la Prueba. Hoy el Frontend lo hace
  directamente con Firebase (`src/services/db.js`, `AuthContext.jsx`, `firestore.rules`); eso se reemplazará por esta API en la Unidad IV.
- **Frontend:** pantallas, componentes, estilos, animaciones, modales y navegación.

## 5. Pendiente para siguientes etapas

Roles y permisos, autenticación, filtros/búsqueda, paginación, corrección automática y bloqueo de la Prueba, bloques y textos editables de la
portada (CMS) y usuarios con rol. El diseño ya los contempla (por ejemplo `Resultado.repeticion_permitida`).
