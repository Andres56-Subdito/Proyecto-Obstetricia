"""
Carga datos de ejemplo para probar y demostrar la API.

Uso:    python manage.py cargar_datos_demo
        python manage.py cargar_datos_demo --password OtraClave123

Crea:
  - 3 usuarios de prueba, uno por rol:  alumno@demo.cl · profesor@demo.cl · admin@demo.cl
  - 12 cursos (más de 10, para poder demostrar la paginación) con bloques Teórico/Práctico
  - preguntas y opciones del test práctico y de la Prueba final en el primer curso
  - 1 bloque y 2 textos de la página de inicio

Es seguro ejecutarlo varias veces: no duplica nada (busca antes de crear, con el ORM).
La contraseña es SOLO para pruebas locales: no uses estos usuarios fuera de tu computador.
"""
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from plataforma.models import BloqueContenido, BloqueInicio, Curso, Opcion, Perfil, Pregunta, TextoSitio

CLAVE_POR_DEFECTO = 'demo12345'

USUARIOS = [
    ('alumno@demo.cl', 'Alumna Demo', Perfil.ALUMNO),
    ('profesor@demo.cl', 'Profesor Demo', Perfil.PROFESOR),
    ('admin@demo.cl', 'Administrador Demo', Perfil.ADMIN),
]

CURSOS = [
    # (título, autor, es_inmersivo, descripción)
    ('Fisio-balón en el Trabajo de Parto', 'Kinesióloga Obstétrica', True,
     'El fisiobalón facilita el movimiento de la pelvis y ayuda en el descenso fetal.'),
    ('Normativa Legal y Derechos Durante la Atención Obstétrica', 'Equipo Sentir Nacer', True,
     'Revisa el marco jurídico que protege los derechos de las mujeres durante la atención obstétrica.'),
    ('Aromaterapia en la Gestación y el Parto', 'Especialista en Aromaterapia', False,
     'Los aceites esenciales pueden favorecer la relajación y el bienestar durante el parto.'),
    ('Rebozo: Ritmo, Balance y Alivio en el Parto', 'Especialista en Rebozo', True,
     'Aprende a utilizar el rebozo como herramienta de apoyo durante el embarazo y el parto.'),
    ('Camilla de Parto Humanizada: Posiciones y Ergonomía Clínica', 'Especialistas en Camillas de Parto', False,
     'Las ventajas del uso de la camilla de parto humano durante el proceso de nacimiento.'),
    ('Musicoterapia Sensorial en el Parto', 'María Fernández Gómez', False,
     'La musicoterapia es una herramienta no farmacológica para la gestión del estrés y el dolor.'),
    ('Respiración y Relajación en el Trabajo de Parto', 'Matrona Especialista', False,
     'Técnicas de respiración consciente para sobrellevar las contracciones.'),
    ('Acompañamiento Emocional en el Puerperio', 'Psicóloga Perinatal', False,
     'Cómo acompañar los cambios emocionales durante las primeras semanas después del parto.'),
    ('Lactancia Materna: Primeros Pasos', 'Matrona y Asesora de Lactancia', False,
     'Posiciones, agarre y resolución de las dudas más frecuentes al comenzar a amamantar.'),
    ('Masaje Perineal Durante la Gestación', 'Kinesióloga Perineal', True,
     'Preparación del periné en las últimas semanas del embarazo.'),
    ('Posiciones Verticales Para el Expulsivo', 'Equipo Sentir Nacer', True,
     'Ventajas de las posiciones verticales y cómo practicarlas con apoyo.'),
    ('Plan de Parto: Cómo Construirlo', 'Matrona Docente', False,
     'Guía paso a paso para escribir un plan de parto realista y respetuoso.'),
]


class Command(BaseCommand):
    help = 'Carga usuarios, cursos y contenido de ejemplo para demostrar la API (sin duplicar).'

    def add_arguments(self, parser):
        parser.add_argument('--password', default=CLAVE_POR_DEFECTO, help='Contraseña de los 3 usuarios de prueba.')

    def handle(self, *args, **opciones):
        self._usuarios(opciones['password'])
        self._cursos()
        self._contenido_del_primer_curso()
        self._inicio()
        self.stdout.write(self.style.SUCCESS('Datos de ejemplo cargados.'))
        self.stdout.write('Usuarios de prueba (contraseña: %s):' % opciones['password'])
        for correo, _, rol in USUARIOS:
            self.stdout.write(f'   {rol:<9} -> {correo}')

    def _usuarios(self, clave):
        for correo, nombre, rol in USUARIOS:
            usuario, _ = User.objects.get_or_create(username=correo, defaults={'email': correo, 'first_name': nombre})
            usuario.set_password(clave)  # se guarda CIFRADA
            usuario.save()
            Perfil.objects.update_or_create(usuario=usuario, defaults={'rol': rol})

    def _cursos(self):
        for posicion, (titulo, autor, inmersivo, descripcion) in enumerate(CURSOS):
            Curso.objects.get_or_create(titulo=titulo, defaults={
                'autor': autor, 'es_inmersivo': inmersivo, 'descripcion': descripcion, 'orden': posicion,
                'evaluacion': 'Realiza el test práctico y la prueba final de este curso.',
            })

    def _contenido_del_primer_curso(self):
        curso = Curso.objects.get(titulo=CURSOS[0][0])
        if curso.bloques.exists() or curso.preguntas.exists():
            return  # ya estaba cargado
        BloqueContenido.objects.create(curso=curso, seccion='teoria', titulo='¿Qué es el fisiobalón?', orden=0,
                                       texto='Pelota de gran tamaño que permite movilizar la pelvis durante las contracciones.')
        BloqueContenido.objects.create(curso=curso, seccion='teoria', titulo='Beneficios', orden=1,
                                       texto='Alivia el dolor lumbar y favorece el descenso del bebé.')
        BloqueContenido.objects.create(curso=curso, seccion='practica', titulo='Actividad: posturas sobre el balón', orden=0,
                                       texto='Practica tres posturas sobre el balón y descríbelas.')

        # Test práctico (intentos ilimitados)
        p = Pregunta.objects.create(curso=curso, cuestionario='practica', texto='¿Sobre qué se apoya la persona?', orden=0)
        Opcion.objects.create(pregunta=p, texto='Un balón de gran tamaño', es_correcta=True, orden=0)
        Opcion.objects.create(pregunta=p, texto='Una silla fija', es_correcta=False, orden=1)

        # Prueba final (un solo intento): una de opción única, una de varias opciones y una de respuesta corta
        p1 = Pregunta.objects.create(curso=curso, cuestionario='prueba', texto='¿Qué ayuda a movilizar el fisiobalón?',
                                     tipo='unica', orden=0)
        Opcion.objects.create(pregunta=p1, texto='La pelvis', es_correcta=True, orden=0)
        Opcion.objects.create(pregunta=p1, texto='El oído', es_correcta=False, orden=1)
        p2 = Pregunta.objects.create(curso=curso, cuestionario='prueba', texto='Marca los beneficios del fisiobalón',
                                     tipo='multiple', orden=1)
        Opcion.objects.create(pregunta=p2, texto='Alivia el dolor lumbar', es_correcta=True, orden=0)
        Opcion.objects.create(pregunta=p2, texto='Favorece el descenso fetal', es_correcta=True, orden=1)
        Opcion.objects.create(pregunta=p2, texto='Reemplaza al control médico', es_correcta=False, orden=2)
        Pregunta.objects.create(curso=curso, cuestionario='prueba', texto='Cuéntanos qué aprendiste',
                                tipo='texto', orden=2)

    def _inicio(self):
        BloqueInicio.objects.get_or_create(titulo='Bienvenida a Sentir Nacer', defaults={
            'texto': 'Plataforma educativa de obstetricia.', 'orden': 0})
        TextoSitio.objects.get_or_create(clave='hero_title', defaults={'valor': 'Sentir Nacer'})
        TextoSitio.objects.get_or_create(clave='hero_subtitle', defaults={'valor': 'Aprende, practica y acompaña.'})
