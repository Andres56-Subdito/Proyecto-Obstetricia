# vistas.py, estas clases reciben la petición, revisan el permiso y entregan el CRUD de cada modelo

# cada ViewSet define:
    # permission_classes -> quién puede usarlo (ver permisos.py)
    # filterset_fields   -> filtros exactos:  ?curso=1&seccion=teoria
    # search_fields      -> búsqueda de texto: ?search=lavanda
    # ordering_fields    -> ordenar:           ?ordering=-titulo
# ademas (la paginación ?page=2&page_size=5 es común a todos y se configura en settings.py)

import django_filters
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Max
from rest_framework import mixins, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .calificacion import PORCENTAJE_APROBACION, corregir
from .models import BloqueContenido, BloqueInicio, Curso, Opcion, Perfil, Pregunta, Resultado, TextoSitio
from .seguridad import esta_bloqueado, segundos_de_bloqueo
from .permisos import (AdminOLectura, PersonalOLectura, SoloAdmin, SoloPersonal, UsuarioConRol, datos_de_sesion, es_admin, es_personal, obtener_rol,)
from .serializers import (BloqueContenidoSerializer, BloqueInicioSerializer, CursoSerializer, LoginSerializer, OpcionSerializer, PreguntaSerializer, RespuestasSerializer, ResultadoSerializer, TextoSitioSerializer, UsuarioSerializer,)

class LoginView(GenericAPIView): # esta clase maneja el inicio de sesión, que es un POST con usuario/correo y contraseña, y devuelve un token y los datos del usuario, incluido su rol
    
    # si alguien intenta iniciar sesión demasiadas veces con datos incorrectos, se bloquea temporalmente y responde 429 (anti fuerza bruta),
    # ademas Django valida el usuario y la contraseña, y si no tiene un perfil válido (rol) se le niega el acceso con 403.
    # Si todo está bien, devuelve un token y los datos del usuario, incluido su rol. Ese token se envía después en la cabecera:   Authorization: Token <token>

    
    
    permission_classes = [AllowAny]
    authentication_classes = []  # el login no exige estar autenticado
    serializer_class = LoginSerializer

    def get(self, request):
        # solo informativo: asi la interfaz navegable muestra el formulario sin un error 405.
        return Response({'detail': 'Envía tu usuario (correo) y contraseña con POST para obtener un token.'})

    def post(self, request): # esta funcion recibe el usuario/correo y la contraseña, valida que no haya demasiados intentos fallidos, autentica al usuario y devuelve un token y sus datos, incluido su rol
        datos = self.get_serializer(data=request.data)
        datos.is_valid(raise_exception=True)
        nombre = datos.validated_data['username'].strip()
        clave = datos.validated_data['password']

        # si escribio su correo y no su nombre de usuario, se busca a que usuario corresponde
        if not User.objects.filter(username=nombre).exists():
            otro = User.objects.filter(email__iexact=nombre).first()
            if otro:
                nombre = otro.username

        # aqui se aplica el limite de intentos (anti fuerza bruta): si ya falló demasiadas veces, se bloquea aquí con un 429, ademas
        # la regla que cuenta los fallos esta en seguridad.py que también protege /admin/ y el «Log in» de la interfaz navegable
        if esta_bloqueado(request, nombre):
            minutos = -(-segundos_de_bloqueo() // 60)  # segundos -> minutos, redondeando hacia arriba
            return Response(
                {'detail': f'Demasiados intentos fallidos. Intenta de nuevo en {minutos} minuto(s).'},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        usuario = authenticate(request, username=nombre, password=clave)  # cada fallo suma 1 al contador
        if usuario is None:
            return Response({'detail': 'Usuario o contraseña incorrectos.'}, status=status.HTTP_401_UNAUTHORIZED)
        if obtener_rol(usuario) is None:
            return Response({'detail': 'Tu cuenta no tiene acceso a la plataforma. Contacta al administrador.'},
                            status=status.HTTP_403_FORBIDDEN)

        token, _ = Token.objects.get_or_create(user=usuario)
        return Response({'token': token.key, 'usuario': datos_de_sesion(usuario)})


class LogoutView(GenericAPIView): # esta clase maneja el cierre de sesión, que es un POST que invalida el token de quien lo envía (cierra la sesión)
    permission_classes = [UsuarioConRol]
    serializer_class = None

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



class UsuarioFilter(django_filters.FilterSet):
    activo = django_filters.BooleanFilter(field_name='usuario__is_active')

    class Meta:
        model = Perfil
        fields = ['rol', 'activo']


class UsuarioViewSet(viewsets.ModelViewSet):
    """
    CRUD de usuarios (gestión de accesos), solo el administrador puede modificarla
    Excepción: GET /api/usuarios/me/ lo puede usar cualquier persona con sesión para ver su propio perfil y rol

    Filtros:   ?rol=alumno   ?activo=true
    Búsqueda:  ?search=correo  (nombre o correo)
    Orden:     ?ordering=nombre   ?ordering=-rol
    Además:  POST /api/login/   y   POST /api/logout/

    """
    queryset = Perfil.objects.select_related('usuario')
    serializer_class = UsuarioSerializer
    permission_classes = [SoloAdmin]
    filterset_class = UsuarioFilter
    search_fields = ['usuario__email', 'usuario__first_name']
    ordering_fields = ['usuario__first_name', 'usuario__email', 'rol']

    def get_permissions(self): # esta funcion permite que cualquier persona con sesión pueda usar el endpoint /api/usuarios/me/ para ver su propio perfil y rol, mientras que los demás endpoints siguen exigiendo ser administrador
        if self.action == 'me':
            return [UsuarioConRol()]
        return super().get_permissions()

    def perform_destroy(self, instance): # esta funcion borra un usuario y su perfil, pero no permite que un administrador se borre a sí mismo 
        if instance.usuario_id == self.request.user.pk:
            raise PermissionDenied('No puedes eliminar tu propia cuenta.')
        instance.usuario.delete()  # borra el usuario, su perfil y sus resultados se borran en cascada

    @action(detail=False, methods=['get']) # este decorador crea un endpoint /api/usuarios/me/ que devuelve los datos de la persona que inició sesión, incluido su rol
    def me(self, request): # esta funcion devuelve los datos de la persona que inició sesión, incluido su rol para saber quién es y qué permisos tiene
        return Response(datos_de_sesion(request.user))



class CursoViewSet(viewsets.ModelViewSet):
    """
    CRUD de cursos.
      - Lo lee cualquier persona con sesión.   - El Crear / editar / borrar solo lo pueden hacer el profesor o administrador
      - El cambiar la posición/orden lo puede hacer solo el Administrador

    Filtros:   ?es_inmersivo=true   ?autor=...
    Búsqueda:  ?search=aroma  (título, descripción, autor Y contenido Teórico/Práctico del curso)
    Orden:     ?ordering=titulo   ?ordering=-creado_en
    Además:  POST /api/cursos/{id}/rendir-practica/   y   POST /api/cursos/{id}/rendir-prueba/
    """
    queryset = Curso.objects.prefetch_related('bloques', 'preguntas__opciones')
    serializer_class = CursoSerializer
    permission_classes = [PersonalOLectura] #Ejemplo de permisos
    filterset_fields = ['es_inmersivo', 'autor']
    search_fields = ['titulo', 'descripcion', 'autor', 'bloques__titulo', 'bloques__texto']
    ordering_fields = ['orden', 'titulo', 'creado_en']

    def get_permissions(self): # esta funcion permite que cualquier persona con sesión pueda usar los endpoints /api/cursos/{id}/rendir-practica/ y /api/cursos/{id}/rendir-prueba/ para rendir el test práctico y la prueba final, 
        #mientras que los demás endpoints siguen exigiendo ser profesor o administrador
        if self.action in ('rendir_practica', 'rendir_prueba'):
            return [UsuarioConRol()]  # cualquier persona con sesión (alumno, profesor o admin) puede rendir
        return super().get_permissions()

    def perform_create(self, serializer): # esta funcion guarda un curso nuevo, asignándole la posición final de la lista salvo que el administrador indique otra posición, y no permite que un profesor cambie la posición de los cursos
        if es_admin(self.request.user) and 'orden' in self.request.data:
            serializer.save()
        else:
            ultimo = Curso.objects.aggregate(ultimo=Max('orden'))['ultimo']
            serializer.save(orden=0 if ultimo is None else ultimo + 1)

    def perform_update(self, serializer): # esta funcion actualiza un curso, pero no permite que un profesor cambie la posición de los cursos, solo el administrador puede hacerlo
        nuevo = serializer.validated_data.get('orden')
        if nuevo is not None and nuevo != serializer.instance.orden and not es_admin(self.request.user):
            raise PermissionDenied('Solo el Administrador puede cambiar la posición de los cursos.')
        serializer.save()

    @action(detail=True, methods=['get', 'post'], url_path='rendir-practica', serializer_class=RespuestasSerializer) # este decorador crea un endpoint /api/cursos/{id}/rendir-practica/ que permite rendir el test práctico, 
    #que es un POST con las respuestas y devuelve la corrección, sin guardar nada
    
    def rendir_practica(self, request, pk=None): # esta funcion recibe las respuestas del test práctico, las corrige y devuelve la corrección, sin guardar nada, y permite que cualquier persona con sesión pueda usarlo
        curso = self.get_object()
        if request.method == 'GET':  # solo informativo: así la interfaz navegable muestra el formulario sin error 405
            return Response({'detail': 'Envía tus respuestas con POST (formulario de abajo). Intentos ilimitados; no se guarda nada.'})
        datos = self.get_serializer(data=request.data)
        datos.is_valid(raise_exception=True)
        puntaje, total, porcentaje, detalle = corregir(curso, 'practica', datos.validated_data['respuestas'])
        return Response({
            'puntaje': puntaje, 'total': total, 'porcentaje': porcentaje,
            'aprobado': porcentaje >= PORCENTAJE_APROBACION, 'detalle': detalle,
        })

    @action(detail=True, methods=['get', 'post'], url_path='rendir-prueba', serializer_class=RespuestasSerializer) # este decorador crea un endpoint /api/cursos/{id}/rendir-prueba/ que permite rendir la prueba final, 
    # y que es un POST con las respuestas y devuelve la corrección, guardando el resultado si es un alumno y bloqueando la prueba hasta que un profesor autorice repetirla

    def rendir_prueba(self, request, pk=None): # esta funcion recibe las respuestas de la prueba final, las corrige y devuelve la corrección, guardando el resultado si es un alumno y bloqueando 
        # la prueba hasta que un profesor autorice repetirla, y permite que cualquier persona con sesión pueda usarlo
        curso = self.get_object()
        if request.method == 'GET':  # solo informativo: así la interfaz navegable muestra el formulario sin error 405
            return Response({'detail': 'Envía tus respuestas con POST (formulario de abajo). La Prueba se rinde una sola vez.'})
        datos = self.get_serializer(data=request.data)
        datos.is_valid(raise_exception=True)
        puntaje, total, porcentaje, detalle = corregir(curso, 'prueba', datos.validated_data['respuestas'])
        respuesta = {
            'puntaje': puntaje, 'total': total, 'porcentaje': porcentaje,
            'aprobado': porcentaje >= PORCENTAJE_APROBACION, 'detalle': detalle, 'guardado': False,
        }

        if es_personal(request.user):
            return Response(respuesta)

        with transaction.atomic():
            anterior = Resultado.objects.filter(alumno=request.user, curso=curso).first()
            # bloqueo: ya rindio la prueba y el profesor no autorizo repetirla.
            if anterior and not anterior.repeticion_permitida:
                raise PermissionDenied('Ya rendiste esta prueba. Tu profesor debe autorizar un nuevo intento.')
            Resultado.objects.update_or_create(
                alumno=request.user, curso=curso,
                defaults={
                    'puntaje': puntaje, 'total': total, 'porcentaje': porcentaje,
                    'intentos': anterior.intentos + 1 if anterior else 1,
                    'repeticion_permitida': False,  # el permiso se consume: vuelve a bloquearse
                },
            )
        respuesta['guardado'] = True
        return Response(respuesta, status=status.HTTP_201_CREATED)


class BloqueContenidoViewSet(viewsets.ModelViewSet): # esta clase maneja el CRUD de los bloques de contenido de los apartados teoricos y practicos, con filtros, búsqueda y ordenamiento
    """
    CRUD de los bloques de los apartados teoricos y practicos
    Filtros:   ?curso=1   ?seccion=teoria (o practica)       
    Búsqueda: ?search=texto (título y contenido)
    Orden:     ?ordering=orden   ?ordering=titulo

    """
    queryset = BloqueContenido.objects.select_related('curso')
    serializer_class = BloqueContenidoSerializer
    permission_classes = [PersonalOLectura]
    filterset_fields = ['curso', 'seccion']
    search_fields = ['titulo', 'texto']
    ordering_fields = ['orden', 'titulo']


class PreguntaViewSet(viewsets.ModelViewSet): # esta clase maneja el CRUD de las preguntas del Test practico y la prueba final, con filtros, búsqueda y ordenamiento
    """
    CRUD de las preguntas del Test practico (cuestionario=practica) y de la Prueba final (cuestionario=prueba)
    Filtros:   ?curso=1   ?cuestionario=prueba   ?tipo=unica       
    Búsqueda: ?search=texto
    Orden:     ?ordering=orden   ?ordering=texto

    """
    queryset = Pregunta.objects.select_related('curso').prefetch_related('opciones')
    serializer_class = PreguntaSerializer
    permission_classes = [PersonalOLectura]
    filterset_fields = ['curso', 'cuestionario', 'tipo']
    search_fields = ['texto']
    ordering_fields = ['orden']


class OpcionViewSet(viewsets.ModelViewSet): # esta clase maneja el CRUD de las alternativas de cada pregunta, que indican cuál es la correcta, con filtros, búsqueda y ordenamiento
    """
    CRUD de las alternativas de cada pregunta
    Solo el profesor y el administrador pueden crear, editar o borrar opciones. El alumno ve las opciones de cada pregunta, pero sin saber cuál es la correcta
    Filtros: ?pregunta=5   ?es_correcta=true
    Búsqueda: ?search=texto
    Orden: ?ordering=orden   ?ordering=texto

    """
    queryset = Opcion.objects.select_related('pregunta')
    serializer_class = OpcionSerializer
    permission_classes = [SoloPersonal]
    filterset_fields = ['pregunta', 'es_correcta']
    search_fields = ['texto']
    ordering_fields = ['orden']


class ResultadoViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin,
                       mixins.DestroyModelMixin, viewsets.GenericViewSet): # esta clase maneja el CRUD de los resultados de la prueba final, que se generan al rendirla y que solo puede ver el alumno que la rindió, 
                       #mientras que el profesor o administrador pueden ver todos los resultados y autorizar repetirla
    """
    Resultados de la Prueba final, no se crean aquí, estos se generan al rendir (POST /api/cursos/{id}/rendir-prueba/)
      - Listar / ver: el alumno ve solo sus resultados, el profesor y el administrador ven todos los resultados
      - Editar (PATCH repeticion_permitida), el profesor y el administrador son quienes pueden pulsar el boton «Autorizar repetición» para permitir que un alumno vuelva a rendir la prueba final
      - Eliminar: solo el administrador puede

    Filtros:   ?curso=1   ?alumno=3   ?repeticion_permitida=true
    Búsqueda:  ?search=maria  (nombre o correo del alumno, o título del curso)
    Orden:     ?ordering=fecha_envio   ?ordering=-porcentaje

    """
    serializer_class = ResultadoSerializer
    filterset_fields = ['curso', 'alumno', 'repeticion_permitida']
    search_fields = ['alumno__first_name', 'alumno__email', 'curso__titulo']
    ordering_fields = ['fecha_envio', 'porcentaje', 'puntaje']
    # primera defensa: PUT y POST ni siquiera existen en este endpoint (responden 405).
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']  # sin POST ni PUT

    def get_queryset(self):
        resultados = Resultado.objects.select_related('alumno', 'curso')
        if es_personal(self.request.user):
            return resultados
        return resultados.filter(alumno=self.request.user)  # el alumno solo ve lo suyo

    def get_permissions(self):
        # segunda defensa: aunque alguien habilitara PUT por error, solo profesor/admin lo podran editar
        # (Sin esto, un alumno podría activar su propio `repeticion_permitida` y repetir la Prueba.)
        if self.action in ('update', 'partial_update'):
            return [SoloPersonal()]
        if self.action == 'destroy':
            return [SoloAdmin()]
        return [UsuarioConRol()]


class BloqueInicioViewSet(viewsets.ModelViewSet): # esta clase maneja el CRUD de los bloques de la portada de la plataforma, que muestran un título, un texto, una imagen y/o un video y un orden para mostrarlos en la interfaz navegable

    """
    CRUD de los bloques «Más información» de la página de inicio
    Los Lee cualquier persona con sesion y para el Crear / editar / borrar solo el profesor o administrador pueden hacerlo 
    
    Búsqueda: ?search=texto (título y texto)
    Orden: ?ordering=orden   ?ordering=titulo

    """
    queryset = BloqueInicio.objects.all()
    serializer_class = BloqueInicioSerializer
    permission_classes = [PersonalOLectura]
    search_fields = ['titulo', 'texto']
    ordering_fields = ['orden', 'titulo']

    def perform_create(self, serializer):
        # El bloque nuevo queda al final de la lista.
        ultimo = BloqueInicio.objects.aggregate(ultimo=Max('orden'))['ultimo']
        serializer.save(orden=0 if ultimo is None else ultimo + 1)


class TextoSitioViewSet(viewsets.ModelViewSet): # esta clase maneja el CRUD de los textos editables de la portada, que se buscan por su clave y se pueden buscar por su contenido, y solo el administrador puede crear, editar o borrar estos textos
    """
    Textos editables de la portada, los lee cualquier persona con un inicio de sesion y los puede escribir solo el administrador
    Filtro: ?clave=hero_title      
    Busqueda: ?search=texto
    Orden: ?ordering=clave   ?ordering=actualizado_en

    """
    queryset = TextoSitio.objects.all()
    serializer_class = TextoSitioSerializer
    permission_classes = [AdminOLectura]
    filterset_fields = ['clave']
    search_fields = ['clave', 'valor']
    ordering_fields = ['clave', 'actualizado_en']
