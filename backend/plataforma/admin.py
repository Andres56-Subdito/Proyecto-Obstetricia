from django.contrib import admin

from .models import BloqueContenido, Curso, Opcion, Pregunta, Resultado

admin.site.register(Curso)
admin.site.register(BloqueContenido)
admin.site.register(Pregunta)
admin.site.register(Opcion)
admin.site.register(Resultado)
