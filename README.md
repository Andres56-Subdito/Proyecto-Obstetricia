# Sentir Nacer — Plataforma educativa de Obstetricia

El proyecto está separado en dos partes independientes:

```
Proyecto Obstetricia/
├── frontend/     Interfaz (React + Vite + Tailwind) — proyecto de la EVA1
├── backend/      API REST (Python + Django + Django REST Framework)
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/       Configuración del proyecto (settings.py, urls.py, paginacion.py)
│   └── plataforma/   App: modelos, serializers, vistas, permisos, rutas y comando de datos de ejemplo
├── docs/INVENTARIO_Y_MAPEO.md   Análisis de las pantallas y de dónde sale cada modelo
└── README.md
```

> El Frontend **no está conectado** al Backend (eso se hace en la Unidad IV). Cada parte se ejecuta por separado.

---

# Backend

Usa solo **Python, Django, Django REST Framework y el ORM de Django** (sin SQL manual). Base de datos: SQLite.

## Cómo ejecutarlo

**1. Ingresar a la carpeta del Backend**
```bash
cd backend
```

**2. Crear y activar el entorno virtual**
```bash
python -m venv venv
```
```bash
# Windows (PowerShell):
venv\Scripts\Activate.ps1
# Windows (Git Bash):
source venv/Scripts/activate
# Linux / macOS:
source venv/bin/activate
```

**3. Instalar las dependencias**
```bash
pip install -r requirements.txt
```

**4. Aplicar las migraciones** (crea el archivo `db.sqlite3` con las tablas)
```bash
python manage.py migrate
```

**5. Cargar los datos de ejemplo** (3 usuarios de prueba, 12 cursos con contenido y preguntas)
```bash
python manage.py cargar_datos_demo
```
Crea un usuario por rol: `alumno@demo.cl`, `profesor@demo.cl` y `admin@demo.cl`. La contraseña de prueba es `demo12345`
(solo para uso local; se puede cambiar con `--password OtraClave`). Se puede repetir sin duplicar datos.

**6. (Opcional) Crear un superusuario** para entrar al panel `/admin/`. Un superusuario siempre tiene el rol Administrador.
```bash
python manage.py createsuperuser
```

**7. Ejecutar el servidor**
```bash
python manage.py runserver
```

**8. Entrar a la interfaz navegable de Django REST Framework**

Abre <http://127.0.0.1:8000/api/>. El índice es público, pero **todos los endpoints exigen iniciar sesión**:
usa el enlace **Log in** de arriba a la derecha (por ejemplo con `profesor@demo.cl` / `demo12345`).
Después, en cada listado hay un formulario para crear, el botón **Filtros**, y en el detalle de un registro están los
botones para editar (PUT) y eliminar (DELETE). El panel de administración de Django está en <http://127.0.0.1:8000/admin/>.

## Modelos y relaciones

Cada modelo equivale a una colección de Firebase del Frontend:

| Modelo | Firebase | Qué guarda | Relación |
|---|---|---|---|
| `Perfil` | `users` | Rol de cada persona: alumno, profesor o admin | `usuario` → User (uno a uno) |
| `Curso` | `courses` | Cursos (título, imagen, autor, descripción, orden…) | — |
| `BloqueContenido` | `courses.teoria / practica` | Bloques de los apartados Teórico y Práctico | `curso` → Curso |
| `Pregunta` | `courses.practicaTest / prueba` | Preguntas del test práctico y de la Prueba final | `curso` → Curso |
| `Opcion` | `question.options` | Alternativas de cada pregunta (cuál es la correcta) | `pregunta` → Pregunta |
| `Resultado` | `results` | Nota de la Prueba de un alumno y permiso para repetirla | `alumno` → User, `curso` → Curso |
| `BloqueInicio` | `siteBlocks` | Bloques «Más información» de la portada | — |
| `TextoSitio` | `siteContent` | Textos editables de la portada | — |

Las relaciones son `ForeignKey` (uno a muchos). En el JSON, cada curso muestra anidados sus `bloques` y `preguntas`,
y cada pregunta sus `opciones`.

## Autenticación y roles

- **Todo exige iniciar sesión.** Sin sesión, la API responde `401`. Con sesión pero sin permiso para esa acción, `403`.
- **Dos formas de autenticarse:** por **sesión** (el enlace *Log in* de la interfaz navegable) o por **token**
  (`POST /api/login/` devuelve el token y el rol; se envía como `Authorization: Token <token>`).
- **El rol** (alumno, profesor o admin) se guarda en la tabla `Perfil` y se lee en `plataforma/permisos.py` con la función
  `obtener_rol()`. `GET /api/usuarios/me/` devuelve quién eres y qué rol tienes.
- Cada usuario nuevo recibe su `Perfil` automáticamente (`plataforma/signals.py`): superusuario → admin, el resto → alumno.
- **Límite de intentos de login (anti fuerza bruta):** tras 5 contraseñas incorrectas, el usuario queda bloqueado 5 minutos
  (la API responde `429`). Protege `/api/login/`, el «Log in» de la interfaz navegable y `/admin/`. La lógica está en
  `plataforma/seguridad.py` y los valores se cambian en `config/settings.py` (`LOGIN_MAX_INTENTOS`, `LOGIN_BLOQUEO_SEGUNDOS`).

| Acción | Alumno | Profesor | Admin |
|---|:-:|:-:|:-:|
| Leer cursos, bloques, preguntas y textos del sitio | ✅ | ✅ | ✅ |
| Rendir el test práctico y la Prueba (1 intento) | ✅ | vista previa | vista previa |
| Ver las respuestas correctas de las preguntas | ❌ | ✅ | ✅ |
| Ver resultados | solo los suyos | todos | todos |
| Crear / editar / borrar cursos, bloques, preguntas, opciones y bloques de inicio | ❌ | ✅ | ✅ |
| Autorizar que un alumno repita la Prueba | ❌ | ✅ | ✅ |
| Cambiar el orden de los cursos | ❌ | ❌ | ✅ |
| Editar los textos del sitio | ❌ | ❌ | ✅ |
| Gestionar usuarios y roles; eliminar resultados | ❌ | ❌ | ✅ |

## Endpoints

Cada recurso tiene el CRUD completo: `GET` (listar), `POST` (crear) en la ruta de lista, y `GET` (ver), `PUT`/`PATCH` (actualizar),
`DELETE` (eliminar) en `/{id}/`.

| Ruta | Qué hace | Quién escribe |
|---|---|---|
| `/api/login/`, `/api/logout/` | Iniciar y cerrar sesión (token) | — |
| `/api/usuarios/` y `/api/usuarios/me/` | Usuarios y roles; `me` = mi perfil | Admin |
| `/api/cursos/` | CRUD de cursos | Profesor y Admin |
| `/api/cursos/{id}/rendir-practica/` | Corrige el test práctico (intentos ilimitados, no guarda) | Todos |
| `/api/cursos/{id}/rendir-prueba/` | Corrige la Prueba y guarda el resultado (1 intento) | Todos |
| `/api/bloques/` | Bloques Teórico / Práctico | Profesor y Admin |
| `/api/preguntas/` y `/api/opciones/` | Preguntas y sus alternativas | Profesor y Admin |
| `/api/resultados/` | Notas; solo `PATCH repeticion_permitida` y `DELETE` | Profesor y Admin / Admin |
| `/api/bloques-inicio/` | Bloques «Más información» de la portada | Profesor y Admin |
| `/api/textos-sitio/` | Textos editables de la portada | Admin |

## Filtros, búsqueda, orden y paginación

Disponibles en todos los listados (se ven con el botón **Filtros** de la interfaz navegable):

| Qué | Cómo | Ejemplo |
|---|---|---|
| Filtrar | `?campo=valor` | `/api/cursos/?es_inmersivo=true` · `/api/bloques/?curso=1&seccion=teoria` |
| Buscar | `?search=texto` | `/api/cursos/?search=lavanda` (busca también en el contenido del curso) |
| Ordenar | `?ordering=campo` | `/api/cursos/?ordering=-titulo` |
| Paginar | `?page=2&page_size=5` | 10 por página por defecto (máximo 100) |

## Validaciones

La API rechaza con `400` (y no guarda) lo que no corresponde: campos obligatorios, largo máximo, URLs y correos inválidos,
valores fuera de las opciones permitidas, **números negativos**, claves foráneas inexistentes, registros repetidos
(un resultado por alumno y curso, correo único), contraseñas débiles, una respuesta correcta por pregunta de opción única,
y las reglas de la Prueba (un solo intento hasta que el profesor lo autorice). Detalle en `backend/plataforma/serializers.py`.

---

# Frontend

Ver [frontend/README.md](frontend/README.md). Se ejecuta con `cd frontend`, `npm install` y `npm run dev`.
