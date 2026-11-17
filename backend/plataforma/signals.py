

# signals.py, esta clase se ejecuta automáticamente cada vez que se crea un usuario, para crear su perfil con un rol por defecto
# cada vez que se crea un usuario con el createsuperuser, desde /admin/ o desde la API, se le crea su Perfil con un rol por defecto.

from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Perfil


@receiver(post_save, sender=User) # este decorador indica que la función `crear_perfil` se ejecuta automáticamente cada vez que se guarda un objeto de tipo `User` (cuando se crea o se actualiza un usuario)
def crear_perfil(sender, instance, created, **kwargs): # sender y kwargs son parámetros que Django pasa automáticamente, instance es el usuario que se acaba de crear o actualizar, created es True si se acaba de crear y False si se acaba de actualizar
    if created:
        rol = Perfil.ADMIN if instance.is_superuser else Perfil.ALUMNO
        Perfil.objects.get_or_create(usuario=instance, defaults={'rol': rol})
