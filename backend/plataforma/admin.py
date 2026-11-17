from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

from .models import BloqueContenido, BloqueInicio, Curso, Opcion, Perfil, Pregunta, Resultado, TextoSitio

admin.site.register(Curso)
admin.site.register(BloqueContenido)
admin.site.register(Pregunta)
admin.site.register(Opcion)
admin.site.register(Resultado)
admin.site.register(BloqueInicio)
admin.site.register(TextoSitio)
admin.site.register(Perfil)


# clase para mostrar el rol dentro de la ficha de usuario en el admin de Django, para poder cambiarlo desde /admin/
class PerfilInline(admin.StackedInline):
    model = Perfil
    can_delete = False

# clase para mostrar el usuario de Django con el rol incluido, para poder cambiarlo desde /admin/
class UsuarioAdmin(UserAdmin):
    inlines = [PerfilInline]
    list_display = ['username', 'email', 'first_name', 'is_active', 'is_staff']

    def get_inline_instances(self, request, obj=None):
        # el perfil se crea solo al crear el usuario (signals.py), el rol se edita al MODIFICAR el usuario.
        return super().get_inline_instances(request, obj) if obj else []


admin.site.unregister(User)
admin.site.register(User, UsuarioAdmin)


