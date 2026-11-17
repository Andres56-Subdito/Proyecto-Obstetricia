from rest_framework.routers import DefaultRouter

from .views import BloqueContenidoViewSet, CursoViewSet, OpcionViewSet, PreguntaViewSet, ResultadoViewSet

router = DefaultRouter()
router.register('cursos', CursoViewSet)
router.register('bloques', BloqueContenidoViewSet)
router.register('preguntas', PreguntaViewSet)
router.register('opciones', OpcionViewSet)
router.register('resultados', ResultadoViewSet)

urlpatterns = router.urls
