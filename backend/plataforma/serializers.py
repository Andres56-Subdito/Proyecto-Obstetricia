from rest_framework import serializers

from .models import BloqueContenido, Curso, Opcion, Pregunta, Resultado


class OpcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Opcion
        fields = '__all__'


class PreguntaSerializer(serializers.ModelSerializer):
    # JSON anidado: cada pregunta muestra sus opciones
    opciones = OpcionSerializer(many=True, read_only=True)

    class Meta:
        model = Pregunta
        fields = '__all__'


class BloqueContenidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloqueContenido
        fields = '__all__'


class CursoSerializer(serializers.ModelSerializer):
    # JSON anidado: cada curso muestra sus bloques y preguntas
    bloques = BloqueContenidoSerializer(many=True, read_only=True)
    preguntas = PreguntaSerializer(many=True, read_only=True)

    class Meta:
        model = Curso
        fields = '__all__'


class ResultadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resultado
        fields = '__all__'
