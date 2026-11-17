from django.contrib.auth.models import User
from django.db import models

class Curso(models.Model):
    titulo = models.CharField(max_length=200)
    url_imagen = models.URLField(blank=True)
    url_video = models.URLField(blank=True)
    autor = models.CharField(max_length=150, blank=True)
    descripcion = models.TextField(blank=True)
    evaluacion = models.TextField(blank=True)
    es_inmersivo = models.BooleanField(default=False)
    orden = models.IntegerField(default=0)

    class Meta:
        ordering = ['orden']
        verbose_name = 'curso'
        verbose_name_plural = 'cursos'

    def __str__(self):
        return self.titulo


class BloqueContenido(models.Model):
    SECCIONES = [('teoria', 'Teórico'), ('practica', 'Práctico')]

    curso = models.ForeignKey(Curso, on_delete=models.CASCADE, related_name='bloques')
    seccion = models.CharField(max_length=10, choices=SECCIONES)
    titulo = models.CharField(max_length=200)
    texto = models.TextField(blank=True)
    url_imagen = models.URLField(blank=True)
    url_video = models.URLField(blank=True)
    enlace = models.URLField(blank=True)

    class Meta:
        verbose_name = 'bloque de contenido'
        verbose_name_plural = 'bloques de contenido'

    def __str__(self):
        return self.titulo


class Pregunta(models.Model):
    CUESTIONARIOS = [('practica', 'Test práctico'), ('prueba', 'Prueba final')]
    TIPOS = [('unica', 'Opción única'), ('multiple', 'Varias opciones'), ('texto', 'Respuesta corta')]

    curso = models.ForeignKey(Curso, on_delete=models.CASCADE, related_name='preguntas')
    cuestionario = models.CharField(max_length=10, choices=CUESTIONARIOS)
    texto = models.CharField(max_length=500)
    tipo = models.CharField(max_length=10, choices=TIPOS, default='unica')

    class Meta:
        verbose_name = 'pregunta'
        verbose_name_plural = 'preguntas'

    def __str__(self):
        return self.texto


class Opcion(models.Model):
    pregunta = models.ForeignKey(Pregunta, on_delete=models.CASCADE, related_name='opciones')
    texto = models.CharField(max_length=300)
    es_correcta = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'opción'
        verbose_name_plural = 'opciones'

    def __str__(self):
        return self.texto


class Resultado(models.Model):
    alumno = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resultados')
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE, related_name='resultados')
    puntaje = models.IntegerField(default=0)
    total = models.IntegerField(default=0)
    porcentaje = models.IntegerField(default=0)
    intentos = models.IntegerField(default=1)
    repeticion_permitida = models.BooleanField(default=False)  
    fecha_envio = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['alumno', 'curso']  
        verbose_name = 'resultado'
        verbose_name_plural = 'resultados'

    def __str__(self):
        return f'{self.alumno} - {self.curso} ({self.porcentaje}%)'
