

# serializers.py: convierte los modelos a JSON y valida los datos que llegan, ocupando tres niveles de validacion las cuales son
# automatica, la cual desde el modelo valida el tipo, obligatorio, largo maximo, URL, opciones permitidas, numeros >= 0 y unicidad
# La segunda es validate_<campo>(self, valor) la cual es una regla para un campo y la tercera es validate(self, attrs) la cual es una regla que mira varios campos a la vez
# Cuando una regla falla la API responde 400 con el motivo y no guarda nada.

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers

from .models import BloqueContenido, BloqueInicio, Curso, Opcion, Perfil, Pregunta, Resultado, TextoSitio
from .permisos import es_personal

class OpcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Opcion
        fields = ['id', 'pregunta', 'texto', 'es_correcta', 'orden']

    def validate(self, attrs): #esta funcion valida que una pregunta de respuesta corta no tenga opciones y que una pregunta de opcion unica solo tenga una respuesta correcta
        pregunta = attrs.get('pregunta') or (self.instance.pregunta if self.instance else None)
        es_correcta = attrs.get('es_correcta', self.instance.es_correcta if self.instance else False)
        if pregunta is None:
            return attrs
        if pregunta.tipo == 'texto':
            raise serializers.ValidationError('Una pregunta de respuesta corta no tiene opciones.')
        if pregunta.tipo == 'unica' and es_correcta:
            otras = pregunta.opciones.filter(es_correcta=True)
            if self.instance:
                otras = otras.exclude(pk=self.instance.pk)
            if otras.exists():
                raise serializers.ValidationError('Una pregunta de opción única solo puede tener una respuesta correcta.')
        return attrs

    def to_representation(self, instance): # esta funcion quita el campo `es_correcta` de la respuesta JSON si el usuario que hace la consulta no es profesor ni administrador, para que el alumno no vea cuál es la respuesta correcta
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and not es_personal(request.user):
            data.pop('es_correcta')
        return data


class PreguntaSerializer(serializers.ModelSerializer): # esta clase convierte el modelo Pregunta a JSON y valida los datos que llegan, incluyendo las opciones de respuesta (OpcionSerializer)
    # JSON anidado: cada pregunta muestra sus opciones (solo lectura; se crean en /api/opciones/)
    opciones = OpcionSerializer(many=True, read_only=True)
    curso_titulo = serializers.CharField(source='curso.titulo', read_only=True)

    class Meta:
        model = Pregunta
        fields = ['id', 'curso', 'curso_titulo', 'cuestionario', 'texto', 'tipo', 'orden', 'opciones']


class BloqueContenidoSerializer(serializers.ModelSerializer): # esta clase convierte el modelo BloqueContenido a JSON y valida los datos que llegan, incluyendo el titulo del curso al que pertenece
    curso_titulo = serializers.CharField(source='curso.titulo', read_only=True)

    class Meta:
        model = BloqueContenido
        fields = ['id', 'curso', 'curso_titulo', 'seccion', 'titulo', 'texto', 'url_imagen', 'url_video', 'enlace', 'orden']


class CursoSerializer(serializers.ModelSerializer): # esta clase convierte el modelo Curso a JSON y valida los datos que llegan, incluyendo sus bloques y preguntas
    # JSON anidado: cada curso muestra sus bloques y preguntas (solo lectura)
    bloques = BloqueContenidoSerializer(many=True, read_only=True)
    preguntas = PreguntaSerializer(many=True, read_only=True)

    class Meta:
        model = Curso
        fields = [
            'id', 'titulo', 'url_imagen', 'url_video', 'autor', 'descripcion', 'evaluacion',
            'es_inmersivo', 'orden', 'creado_en', 'bloques', 'preguntas',
        ]
        read_only_fields = ['creado_en']



class ResultadoSerializer(serializers.ModelSerializer): # esta clase convierte el modelo Resultado a JSON y valida los datos que llegan, incluyendo el nombre y correo del alumno y el titulo del curso al que pertenece, 
    # ademas de que solo se puede editar el campo `repeticion_permitida` (por el profesor) y todo lo demas es de solo lectura
    alumno_nombre = serializers.CharField(source='alumno.first_name', read_only=True)
    alumno_correo = serializers.CharField(source='alumno.email', read_only=True)
    curso_titulo = serializers.CharField(source='curso.titulo', read_only=True)

    class Meta:
        model = Resultado
        fields = [
            'id', 'alumno', 'alumno_nombre', 'alumno_correo', 'curso', 'curso_titulo',
            'puntaje', 'total', 'porcentaje', 'intentos', 'repeticion_permitida', 'fecha_envio',
        ]
        read_only_fields = [f for f in fields if f != 'repeticion_permitida']


class RespuestasSerializer(serializers.Serializer): # esta clase valida el JSON que envía el alumno con sus respuestas a un cuestionario, que es un diccionario con el id de la pregunta como clave y la respuesta como valor
    respuestas = serializers.JSONField(help_text='Ej: {"12": 41, "13": [44, 46], "14": "texto"}')

    def validate_respuestas(self, valor):
        if not isinstance(valor, dict):
            raise serializers.ValidationError('Las respuestas deben ser un objeto: {"id de la pregunta": respuesta}.')
        return valor

class BloqueInicioSerializer(serializers.ModelSerializer): # esta clase convierte el modelo BloqueInicio a JSON y valida los datos que llegan, incluyendo el titulo, texto, url de la imagen, url del video y el orden de cada bloque
    class Meta:
        model = BloqueInicio
        fields = ['id', 'titulo', 'texto', 'url_imagen', 'url_video', 'orden']


class TextoSitioSerializer(serializers.ModelSerializer): # esta clase convierte el modelo TextoSitio a JSON y valida los datos que llegan, incluyendo la clave unica, el valor del texto y la fecha de ultima edicion
    class Meta:
        model = TextoSitio
        fields = ['id', 'clave', 'valor', 'actualizado_en']
        read_only_fields = ['actualizado_en']

class UsuarioSerializer(serializers.ModelSerializer): # esta clase convierte el modelo Perfil a JSON y valida los datos que llegan, incluyendo el correo, nombre, rol, activo y contraseña del usuario, 
    #ademas de que la contraseña solo se puede enviar al crear o cambiar la clave y nunca se devuelve en las respuestas

    email = serializers.EmailField(source='usuario.email')
    nombre = serializers.CharField(source='usuario.first_name', max_length=150)
    activo = serializers.BooleanField(source='usuario.is_active', default=True)
    password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})

    class Meta:
        model = Perfil
        fields = ['id', 'usuario', 'email', 'nombre', 'rol', 'activo', 'password']
        read_only_fields = ['usuario']

    def validate_email(self, valor): # esta funcion valida que el correo no este ya usado por otra persona, ignorando mayusculas y minusculas y espacios al principio y al final
        valor = valor.lower()
        usados = User.objects.filter(username__iexact=valor) | User.objects.filter(email__iexact=valor)
        if self.instance:
            usados = usados.exclude(pk=self.instance.usuario_id)
        if usados.exists():
            raise serializers.ValidationError('Ya existe una cuenta con ese correo.')
        return valor

    def validate_password(self, valor): # esta funcion valida que la contraseña cumpla con las reglas de seguridad de Django, como largo mínimo, no demasiado común y no solo números
        try:
            validate_password(valor)
        except DjangoValidationError as error:  # se convierte en un error 400 de la API
            raise serializers.ValidationError(list(error.messages))
        return valor

    def validate(self, attrs): # esta funcion valida que al crear un usuario la contraseña sea obligatoria y que un administrador no pueda cambiar su propio rol ni desactivarse a sí mismo
        if self.instance is None and not attrs.get('password'):
            raise serializers.ValidationError({'password': 'La contraseña es obligatoria al crear un usuario.'})
        request = self.context.get('request')
        if self.instance and request and self.instance.usuario_id == request.user.pk:
            if 'rol' in attrs and attrs['rol'] != self.instance.rol:
                raise serializers.ValidationError({'rol': 'No puedes cambiar tu propio rol.'})
            if attrs.get('usuario', {}).get('is_active') is False:
                raise serializers.ValidationError({'activo': 'No puedes desactivar tu propia cuenta.'})
        return attrs

    @transaction.atomic # este decorador hace que si algo falla al crear el usuario o el perfil, se deshaga todo y no quede nada guardado en la base de datos
    def create(self, validated_data): # esta funcion crea un usuario y su perfil, guardando la contraseña cifrada y el rol del perfil, y devolviendo el perfil creado
        datos = validated_data.pop('usuario')
        password = validated_data.pop('password')
        usuario = User.objects.create_user(
            username=datos['email'], email=datos['email'], first_name=datos['first_name'],
            is_active=datos.get('is_active', True), password=password,  # create_user guarda la clave CIFRADA
        )
        perfil = usuario.perfil  # lo creó la señal (signals.py) con rol «alumno»
        perfil.rol = validated_data.get('rol', Perfil.ALUMNO)
        perfil.save()
        return perfil

    @transaction.atomic # este decorador hace que si algo falla al actualizar el usuario o el perfil, se deshaga todo y no quede nada guardado en la base de datos
    def update(self, instance, validated_data): # esta funcion actualiza un usuario y su perfil, guardando la contraseña cifrada si se cambio y el rol del perfil, y devolviendo el perfil actualizado
        datos = validated_data.pop('usuario', {})
        password = validated_data.pop('password', None)
        usuario = instance.usuario
        if 'email' in datos:
            usuario.email = usuario.username = datos['email']
        if 'first_name' in datos:
            usuario.first_name = datos['first_name']
        if 'is_active' in datos:
            usuario.is_active = datos['is_active']
        if password:
            usuario.set_password(password)
        usuario.save()
        if 'rol' in validated_data:
            instance.rol = validated_data['rol']
            instance.save()
        return instance


class LoginSerializer(serializers.Serializer): # esta clase valida los datos que se envían para iniciar sesión, que son el correo o usuario y la contraseña, y no devuelve la contraseña en las respuestas
    username = serializers.CharField(label='Correo o usuario')
    password = serializers.CharField(style={'input_type': 'password'})
