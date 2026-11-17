# archivo de permisos de la API, aqui se decide quien puede hacer que cosa segun su rol

# alumno: lee los cursos y el contenido, rinde el test practico y realiza la prueba, ademas este solo ve sus propios resultados
# profesor: ademas de lo que hace el alumno, crea/edita/borra los cursos, contenido y las preguntas, ademas ve todos los resultados y autoriza repetir la prueba
# admin: ademas de lo que hace el profesor, gestiona los usuarios, edita los textos del sitio y cambia el orden de los cursos

# como saber quien es cada persona, pues django identifica al ususario que inicio secion y lo guarda/deja en el request.user 
# despues la funcion obtener_rol(request.user) lee su rol en la tabla Perfil (tabla users de firebase)
# y despues cada clase de permiso llama a obtener_rol y devuelve True (deja pasar) o False (no deja pasar)
# si devuelve False, django rest framework contesta 401 si la persona no inicio sesion o 403 si inicio sesion pero su rol no puede hacer eso 

# `UsuarioConRol` es el permiso por defecto de toda la API (config/settings.py -> REST_FRAMEWORK).

from rest_framework.permissions import SAFE_METHODS, BasePermission
from .models import Perfil

# -------------Funciones que averiguan el rol (las usan los permisos, los serializers y las vistas)-------------


def obtener_rol(user): # esta funcion devuelve el rol de la persona que inicio sesion, o None si no tiene rol (no puede entrar)
    if not (user and user.is_authenticated):
        return None
    if user.is_superuser:
        return Perfil.ADMIN  # el superusuario (createsuperuser) siempre es Administrador
    perfil = getattr(user, 'perfil', None)
    return perfil.rol if perfil else None


def es_personal(user): # esta funcion devuelve True si es profesor o administrador
    return obtener_rol(user) in (Perfil.PROFESOR, Perfil.ADMIN)


def es_admin(user): # esta funcion devuelve True si es administrador
    return obtener_rol(user) == Perfil.ADMIN


def datos_de_sesion(user): # esta funcion devuelve un diccionario con los datos de la persona que inicio sesion, incluyendo su rol
    return {
        'id': user.pk,
        'username': user.username,
        'email': user.email,
        'nombre': user.first_name or user.username,
        'rol': obtener_rol(user),
    }

# la clase de permiso se asigna en `permission_classes` de cada ViewSet

class UsuarioConRol(BasePermission): 
    message = 'Tu cuenta no tiene acceso a la plataforma. Contacta al administrador.'

    def has_permission(self, request, view):
        return obtener_rol(request.user) is not None

class SoloAdmin(BasePermission):
    message = 'Solo el Administrador puede realizar esta acción.'

    def has_permission(self, request, view):
        return es_admin(request.user)

class SoloPersonal(BasePermission):
    message = 'Solo un Profesor o el Administrador pueden realizar esta acción.'

    def has_permission(self, request, view):
        return es_personal(request.user)

class PersonalOLectura(BasePermission):
    message = 'Solo un Profesor o el Administrador pueden modificar este contenido.'

    def has_permission(self, request, view):
        if obtener_rol(request.user) is None:
            return False
        if request.method in SAFE_METHODS:  # GET, HEAD, OPTIONS = solo lectura
            return True
        return es_personal(request.user)

class AdminOLectura(BasePermission):
    message = 'Solo el Administrador puede modificar este contenido.'

    def has_permission(self, request, view):
        if obtener_rol(request.user) is None:
            return False
        if request.method in SAFE_METHODS:
            return True
        return es_admin(request.user)