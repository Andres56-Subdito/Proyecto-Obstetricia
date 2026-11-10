# Sentir Nacer — Plataforma educativa de Obstetricia

El proyecto está separado en dos partes independientes:

```
Proyecto Obstetricia/
├── frontend/     Interfaz (React + Vite + Tailwind) — proyecto de la EVA1
├── backend/      API REST (Python + Django + Django REST Framework)
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/       Configuración del proyecto Django (settings.py, urls.py)
│   └── plataforma/   App con los modelos, serializers, vistas y rutas
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

**5. Crear un superusuario** (para entrar al panel `/admin/`)
```bash
python manage.py createsuperuser
```

**6. Ejecutar el servidor**
```bash
python manage.py runserver
```

**7. Entrar a la interfaz navegable de Django REST Framework**

Abre <http://127.0.0.1:8000/api/>. Ahí aparecen todos los endpoints; al entrar a cada uno se ve el JSON y un formulario
para crear, y en el detalle de un registro están los botones para editar (PUT) y eliminar (DELETE).
El panel de administración de Django está en <http://127.0.0.1:8000/admin/>.

**Pruebas automáticas** (opcional)
```bash
python manage.py test
```

## Modelos y relaciones

| Modelo | Qué guarda | Relación |
|---|---|---|
| `Curso` | Cursos (título, imagen, autor, descripción, orden…) | — |
| `BloqueContenido` | Bloques de los apartados Teórico y Práctico | `curso` → Curso |
| `Pregunta` | Preguntas del test práctico y de la Prueba final | `curso` → Curso |
| `Opcion` | Alternativas de cada pregunta (cuál es la correcta) | `pregunta` → Pregunta |
| `Resultado` | Nota de la Prueba final de un alumno y permiso para repetirla | `alumno` → User, `curso` → Curso |

Las relaciones son `ForeignKey` (uno a muchos). En el JSON, cada curso muestra anidados sus `bloques` y `preguntas`,
y cada pregunta sus `opciones`.

## Endpoints

Cada recurso tiene el CRUD completo: `GET` (listar), `POST` (crear) en la ruta de lista, y `GET` (ver), `PUT`/`PATCH` (actualizar), `DELETE` (eliminar) en `/{id}/`.

| Ruta | Qué hace |
|---|---|
| `/api/cursos/` y `/api/cursos/{id}/` | CRUD de cursos |
| `/api/bloques/` y `/api/bloques/{id}/` | CRUD de bloques Teórico / Práctico |
| `/api/preguntas/` y `/api/preguntas/{id}/` | CRUD de preguntas |
| `/api/opciones/` y `/api/opciones/{id}/` | CRUD de opciones de las preguntas |
| `/api/resultados/` y `/api/resultados/{id}/` | CRUD de resultados de la Prueba |

## Qué falta (se agrega en las siguientes etapas)

Esta versión es la base de la API. Todavía **no** incluye: autenticación y permisos por rol, filtros/búsqueda, paginación,
ni las reglas de la Prueba (corrección automática y bloqueo tras el primer intento).

---

# Frontend

Ver [frontend/README.md](frontend/README.md). Se ejecuta con `cd frontend`, `npm install` y `npm run dev`.
