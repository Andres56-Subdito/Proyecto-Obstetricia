# proteccion de fuerza bruta, implementando un limite de sesiones fallidas por el usuario

# cada vez que alguien inicia sesión, Django llama a `authenticate()`, que revisa los "backends" de autenticación listados en settings.py -> AUTHENTICATION_BACKENDS, despues
# se llama a `get_user()` y finalmente a `login()`. Aquí se registra un backend que hereda el comportamiento normal de Django y le agrega un contador de fallos 
# cada contraseña incorrecta suma 1 al contador de ese usuario desde esa dirección IP que se guarda en la caché de Django con una duración limitada para despues
# al llegar a LOGIN_MAX_INTENTOS fallos (5), los siguientes intentos se rechazan sin comprobar la contraseña, aunque sea la correcta, hasta que pasen los 5 minutos del bloqueo


# limitacion: la cache por defecto vive en la memoria de un solo proceso si esto entra en produccion con varios procesos, habría que usar una caché compartida 

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.core.cache import cache
from django.core.exceptions import PermissionDenied


def maximo_de_intentos():
    return getattr(settings, 'LOGIN_MAX_INTENTOS', 5)


def segundos_de_bloqueo():
    return getattr(settings, 'LOGIN_BLOQUEO_SEGUNDOS', 300)


def _clave_del_contador(request, username):
    # esta funcion genera una clave unica para cada usuario desde cada IP, para que no se bloquee a todos los usuarios si alguien intenta entrar con un usuario inexistente
    ip = request.META.get('REMOTE_ADDR', '') if request is not None else ''
    return f'login_fallido:{ip}:{str(username).strip().lower()}'


def esta_bloqueado(request, username):
    # esta funcion devuelve True si ese usuario  ya agoto sus intentos, ademas desde la vista del login lo usa para avisar con un 429.
    return cache.get(_clave_del_contador(request, username), 0) >= maximo_de_intentos()


class BackendConLimiteDeIntentos(ModelBackend):
    #esta funcion hereda la autenticacion normal de Django y le agrega un limite de intentos fallidos, si se supera devuelve PermissionDenied y no deja entrar aunque la contraseña sea correcta

    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(get_user_model().USERNAME_FIELD)
        if username is None:
            return None

        clave = _clave_del_contador(request, username)

        # BLOQUEADO: se corta aquí, antes de mirar la contraseña Django interpreta PermissionDenied como
        # «este usuario no puede entrar» y devuelve None (login fallido).
        if cache.get(clave, 0) >= maximo_de_intentos():
            raise PermissionDenied('Demasiados intentos fallidos.')

        usuario = super().authenticate(request, username=username, password=password, **kwargs)

        if usuario is None:
            # Intento fallido: suma 1 y el tiempo del contador se renueva con cada fallo.
            cache.set(clave, cache.get(clave, 0) + 1, timeout=segundos_de_bloqueo())
        else:
            cache.delete(clave)  # entró bien: se borra el contador
        return usuario
