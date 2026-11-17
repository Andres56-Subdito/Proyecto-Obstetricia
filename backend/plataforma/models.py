# Relaciones (ForeignKey = "uno a muchos"):
   # User  1 --- 1 Perfil
   # Curso 1 --- * BloqueContenido
   # Curso 1 --- * Pregunta 1 --- * Opcion
   # User  1 --- * Resultado * --- 1 Curso

# validaciones: cada argumento de un campo es una regla que Django REST Framework aplica solo al
# recibir datos por la API (y que el panel /admin/ también usa), ejemplos:
   # max_length=200          -> no más de 200 caracteres
   # blank=True              -> el campo es opcional (si no lo tiene, es obligatorio)
   # URLField                -> debe ser una URL valida
   # choices=...             -> solo acepta los valores de la lista
   # PositiveIntegerField    -> solo enteros >= 0   (rechaza -2)
   # validators=[...]        -> reglas extra (por ejemplo, un máximo de 100)
   # unique / unique_together-> no se pueden repetir

from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator
from django.db import models
from django.utils import timezone


class Perfil(models.Model): # esta clase representa el perfil de un usuario, que tiene un rol (alumno, profesor o administrador) y está relacionada con el modelo User de Django mediante una relación uno a uno.
    # cada vez que se crea un usuario se crea su perfil automaticamente en signals.py
    
    ALUMNO = 'alumno'
    PROFESOR = 'profesor'
    ADMIN = 'admin'
    ROLES = [(ALUMNO, 'Alumno'), (PROFESOR, 'Profesor'), (ADMIN, 'Administrador')]

    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    rol = models.CharField('rol', max_length=10, choices=ROLES, default=ALUMNO)

    class Meta:
        ordering = ['usuario__first_name', 'usuario__username']
        verbose_name = 'perfil'
        verbose_name_plural = 'perfiles'

    def __str__(self):
        return f'{self.usuario.first_name or self.usuario.username} ({self.get_rol_display()})'


class Curso(models.Model): # esta clase representa un curso de la plataforma, que tiene un título, una imagen de portada, un video, un autor, una descripción, una actividad de evaluación
    titulo = models.CharField('título', max_length=200)
    url_imagen = models.URLField('imagen de portada (URL)', blank=True)
    url_video = models.URLField('video (enlace de YouTube)', blank=True)
    autor = models.CharField('autor / docente', max_length=150, blank=True)
    descripcion = models.TextField('descripción', blank=True)
    evaluacion = models.TextField('actividad de evaluación', blank=True)
    es_inmersivo = models.BooleanField('realidad inmersiva', default=False)
    orden = models.PositiveIntegerField('posición', default=0)  # solo el Administrador la cambia
    creado_en = models.DateTimeField('fecha de creación', default=timezone.now, editable=False)

    class Meta:
        ordering = ['orden', 'id']
        verbose_name = 'curso'
        verbose_name_plural = 'cursos'

    def __str__(self):
        return self.titulo


class BloqueContenido(models.Model): #esta clase representa un bloque de contenido de un curso, que puede ser teórico o práctico, y tiene un título, un texto, una imagen, un video y/o un enlace a un recurso.
    
    SECCIONES = [('teoria', 'Teórico'), ('practica', 'Práctico')] # bloque de contenido del apartado teorico o practico de un curso

    curso = models.ForeignKey(Curso, on_delete=models.CASCADE, related_name='bloques')
    seccion = models.CharField('apartado', max_length=10, choices=SECCIONES)
    titulo = models.CharField('título', max_length=200)
    texto = models.TextField('contenido', blank=True)
    url_imagen = models.URLField('imagen (URL)', blank=True)
    url_video = models.URLField('video de YouTube', blank=True)  # se usa en Teórico
    enlace = models.URLField('enlace a un recurso', blank=True)  # se usa en Práctico
    orden = models.PositiveIntegerField('posición', default=0)

    class Meta:
        ordering = ['curso', 'seccion', 'orden', 'id']
        verbose_name = 'bloque de contenido'
        verbose_name_plural = 'bloques de contenido'

    def __str__(self):
        return self.titulo


class Pregunta(models.Model): #esta clase representa una pregunta de un cuestionario, que puede ser de tipo "opción única", "varias opciones" o "respuesta corta"
    # Cada pregunta está asociada a un curso específico mediante una relación de clave foránea, y tiene un campo `cuestionario` que indica si pertenece al test práctico o a la prueba final del curso,
    # Además, tiene un campo `orden` que determina la posición de la pregunta dentro del cuestionario.
    CUESTIONARIOS = [('practica', 'Test práctico (intentos ilimitados)'), ('prueba', 'Prueba final (un solo intento)')] # preguntas tipo cuestionario estilo google forms, para el test practico o la prueba final de un curso
    TIPOS = [('unica', 'Opción única'), ('multiple', 'Varias opciones'), ('texto', 'Respuesta corta (no se corrige)')]

    curso = models.ForeignKey(Curso, on_delete=models.CASCADE, related_name='preguntas')
    cuestionario = models.CharField('cuestionario', max_length=10, choices=CUESTIONARIOS)
    texto = models.CharField('pregunta', max_length=500)
    tipo = models.CharField('tipo', max_length=10, choices=TIPOS, default='unica')
    orden = models.PositiveIntegerField('posición', default=0)

    class Meta:
        ordering = ['curso', 'cuestionario', 'orden', 'id']
        verbose_name = 'pregunta'
        verbose_name_plural = 'preguntas'

    def __str__(self):
        return self.texto


class Opcion(models.Model): #esta clase representa una opción de respuesta para una pregunta, y tiene un campo booleano `es_correcta` que indica si la opción es correcta o no. 
    #Cada opción está asociada a una pregunta específica mediante una relación de clave foránea.
    pregunta = models.ForeignKey(Pregunta, on_delete=models.CASCADE, related_name='opciones')
    texto = models.CharField('opción', max_length=300)
    es_correcta = models.BooleanField('es correcta', default=False)
    orden = models.PositiveIntegerField('posición', default=0)

    class Meta:
        ordering = ['pregunta', 'orden', 'id']
        verbose_name = 'opción'
        verbose_name_plural = 'opciones'

    def __str__(self):
        return self.texto


class Resultado(models.Model): 
    
    # clase que guarda el resultado de la prueba final de un alumno en un curso, la prueba se rinde una vez y esta queda bloqueada hasta que un profesor/administrador pone `repeticion_permitida = True` y 
    # al volver a rendirla ese permiso se consume (vuelve a False) y suben los `intentos`
    # el puntaje de la prueba lo calcula el servidor en calificacion.py

    alumno = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resultados')
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE, related_name='resultados')
    puntaje = models.PositiveIntegerField('respuestas correctas', default=0)
    total = models.PositiveIntegerField('preguntas corregibles', default=0)
    porcentaje = models.PositiveIntegerField('porcentaje', default=0, validators=[MaxValueValidator(100)])
    intentos = models.PositiveIntegerField('intentos', default=1)
    repeticion_permitida = models.BooleanField('permitir repetir', default=False)
    fecha_envio = models.DateTimeField('último envío', auto_now=True)

    class Meta:
        unique_together = ['alumno', 'curso']  # un resultado por alumno y curso
        ordering = ['-fecha_envio']
        verbose_name = 'resultado'
        verbose_name_plural = 'resultados'

    def __str__(self):
        return f'{self.alumno} - {self.curso} ({self.porcentaje}%)'


class BloqueInicio(models.Model):

    # clase que muestra los bloques de la portada de la plataforma, cada bloque tiene un titulo, un texto, una imagen y/o un video y un orden para mostrarlos en la interfaz navegable
    titulo = models.CharField('título', max_length=200)
    texto = models.TextField('texto', blank=True)
    url_imagen = models.URLField('imagen (URL)', blank=True)
    url_video = models.URLField('video de YouTube', blank=True)
    orden = models.PositiveIntegerField('posición', default=0)

    class Meta:
        ordering = ['orden', 'id']
        verbose_name = 'bloque de inicio'
        verbose_name_plural = 'bloques de inicio'

    def __str__(self):
        return self.titulo


class TextoSitio(models.Model):

    #clase que guarda los textos editables de la portada de la plataforma, cada texto tiene una clave unica y un valor que es el texto en si, ademas de la fecha de ultima edicion
    clave = models.SlugField('clave', max_length=100, unique=True)
    valor = models.TextField('texto')
    actualizado_en = models.DateTimeField('última edición', auto_now=True)

    class Meta:
        ordering = ['clave']
        verbose_name = 'texto del sitio'
        verbose_name_plural = 'textos del sitio'

    def __str__(self):
        return self.clave
