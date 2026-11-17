from django.urls import path
from rest_framework.permissions import AllowAny
from rest_framework.routers import APIRootView, DefaultRouter

from .views import (
    BloqueContenidoViewSet, BloqueInicioViewSet, CursoViewSet, LoginView, LogoutView, OpcionViewSet,
    PreguntaViewSet, ResultadoViewSet, TextoSitioViewSet, UsuarioViewSet,
)


class RaizApiPublica(APIRootView): # esta clase es la vista de la raíz de la API, que muestra un índice navegable de todos los endpoints. Es pública para que cualquiera pueda ver la lista de endpoints, pero cada endpoint si exige sesion
    permission_classes = [AllowAny]
    name = 'Sentir Nacer - API'  # título que muestra la interfaz navegable


class RouterApi(DefaultRouter):
    APIRootView = RaizApiPublica

# El router genera automáticamente todas las rutas del CRUD de cada ViewSet.
router = RouterApi()
router.register('cursos', CursoViewSet)
router.register('bloques', BloqueContenidoViewSet)
router.register('preguntas', PreguntaViewSet)
router.register('opciones', OpcionViewSet)
router.register('resultados', ResultadoViewSet, basename='resultado')  # basename: este ViewSet no define `queryset`
router.register('usuarios', UsuarioViewSet)
router.register('bloques-inicio', BloqueInicioViewSet)
router.register('textos-sitio', TextoSitioViewSet)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),    # inicio de sesión con token
    path('logout/', LogoutView.as_view(), name='logout'),  # cierre de sesión
] + router.urls
