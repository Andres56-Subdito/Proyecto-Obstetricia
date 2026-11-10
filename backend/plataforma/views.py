from rest_framework import viewsets

from .models import BloqueContenido, Curso, Opcion, Pregunta, Resultado
from .serializers import (
    BloqueContenidoSerializer, CursoSerializer, OpcionSerializer, PreguntaSerializer, ResultadoSerializer,
)

# Cada ModelViewSet entrega el CRUD completo de un modelo:
# listar y crear (GET, POST) y ver, actualizar y eliminar (GET, PUT/PATCH, DELETE).


class CursoViewSet(viewsets.ModelViewSet):
    queryset = Curso.objects.all()
    serializer_class = CursoSerializer


class BloqueContenidoViewSet(viewsets.ModelViewSet):
    queryset = BloqueContenido.objects.all()
    serializer_class = BloqueContenidoSerializer


class PreguntaViewSet(viewsets.ModelViewSet):
    queryset = Pregunta.objects.all()
    serializer_class = PreguntaSerializer


class OpcionViewSet(viewsets.ModelViewSet):
    queryset = Opcion.objects.all()
    serializer_class = OpcionSerializer


class ResultadoViewSet(viewsets.ModelViewSet):
    queryset = Resultado.objects.all()
    serializer_class = ResultadoSerializer
