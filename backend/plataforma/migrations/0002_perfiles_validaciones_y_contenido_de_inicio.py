import django.core.validators
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('plataforma', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='BloqueInicio',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('titulo', models.CharField(max_length=200, verbose_name='título')),
                ('texto', models.TextField(blank=True, verbose_name='texto')),
                ('url_imagen', models.URLField(blank=True, verbose_name='imagen (URL)')),
                ('url_video', models.URLField(blank=True, verbose_name='video de YouTube')),
                ('orden', models.PositiveIntegerField(default=0, verbose_name='posición')),
            ],
            options={
                'verbose_name': 'bloque de inicio',
                'verbose_name_plural': 'bloques de inicio',
                'ordering': ['orden', 'id'],
            },
        ),
        migrations.CreateModel(
            name='TextoSitio',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('clave', models.SlugField(max_length=100, unique=True, verbose_name='clave')),
                ('valor', models.TextField(verbose_name='texto')),
                ('actualizado_en', models.DateTimeField(auto_now=True, verbose_name='última edición')),
            ],
            options={
                'verbose_name': 'texto del sitio',
                'verbose_name_plural': 'textos del sitio',
                'ordering': ['clave'],
            },
        ),
        migrations.AlterModelOptions(
            name='bloquecontenido',
            options={'ordering': ['curso', 'seccion', 'orden', 'id'], 'verbose_name': 'bloque de contenido', 'verbose_name_plural': 'bloques de contenido'},
        ),
        migrations.AlterModelOptions(
            name='curso',
            options={'ordering': ['orden', 'id'], 'verbose_name': 'curso', 'verbose_name_plural': 'cursos'},
        ),
        migrations.AlterModelOptions(
            name='opcion',
            options={'ordering': ['pregunta', 'orden', 'id'], 'verbose_name': 'opción', 'verbose_name_plural': 'opciones'},
        ),
        migrations.AlterModelOptions(
            name='pregunta',
            options={'ordering': ['curso', 'cuestionario', 'orden', 'id'], 'verbose_name': 'pregunta', 'verbose_name_plural': 'preguntas'},
        ),
        migrations.AlterModelOptions(
            name='resultado',
            options={'ordering': ['-fecha_envio'], 'verbose_name': 'resultado', 'verbose_name_plural': 'resultados'},
        ),
        migrations.AddField(
            model_name='bloquecontenido',
            name='orden',
            field=models.PositiveIntegerField(default=0, verbose_name='posición'),
        ),
        migrations.AddField(
            model_name='curso',
            name='creado_en',
            field=models.DateTimeField(default=django.utils.timezone.now, editable=False, verbose_name='fecha de creación'),
        ),
        migrations.AddField(
            model_name='opcion',
            name='orden',
            field=models.PositiveIntegerField(default=0, verbose_name='posición'),
        ),
        migrations.AddField(
            model_name='pregunta',
            name='orden',
            field=models.PositiveIntegerField(default=0, verbose_name='posición'),
        ),
        migrations.AlterField(
            model_name='bloquecontenido',
            name='enlace',
            field=models.URLField(blank=True, verbose_name='enlace a un recurso'),
        ),
        migrations.AlterField(
            model_name='bloquecontenido',
            name='seccion',
            field=models.CharField(choices=[('teoria', 'Teórico'), ('practica', 'Práctico')], max_length=10, verbose_name='apartado'),
        ),
        migrations.AlterField(
            model_name='bloquecontenido',
            name='texto',
            field=models.TextField(blank=True, verbose_name='contenido'),
        ),
        migrations.AlterField(
            model_name='bloquecontenido',
            name='titulo',
            field=models.CharField(max_length=200, verbose_name='título'),
        ),
        migrations.AlterField(
            model_name='bloquecontenido',
            name='url_imagen',
            field=models.URLField(blank=True, verbose_name='imagen (URL)'),
        ),
        migrations.AlterField(
            model_name='bloquecontenido',
            name='url_video',
            field=models.URLField(blank=True, verbose_name='video de YouTube'),
        ),
        migrations.AlterField(
            model_name='curso',
            name='autor',
            field=models.CharField(blank=True, max_length=150, verbose_name='autor / docente'),
        ),
        migrations.AlterField(
            model_name='curso',
            name='descripcion',
            field=models.TextField(blank=True, verbose_name='descripción'),
        ),
        migrations.AlterField(
            model_name='curso',
            name='es_inmersivo',
            field=models.BooleanField(default=False, verbose_name='realidad inmersiva'),
        ),
        migrations.AlterField(
            model_name='curso',
            name='evaluacion',
            field=models.TextField(blank=True, verbose_name='actividad de evaluación'),
        ),
        migrations.AlterField(
            model_name='curso',
            name='orden',
            field=models.PositiveIntegerField(default=0, verbose_name='posición'),
        ),
        migrations.AlterField(
            model_name='curso',
            name='titulo',
            field=models.CharField(max_length=200, verbose_name='título'),
        ),
        migrations.AlterField(
            model_name='curso',
            name='url_imagen',
            field=models.URLField(blank=True, verbose_name='imagen de portada (URL)'),
        ),
        migrations.AlterField(
            model_name='curso',
            name='url_video',
            field=models.URLField(blank=True, verbose_name='video (enlace de YouTube)'),
        ),
        migrations.AlterField(
            model_name='opcion',
            name='es_correcta',
            field=models.BooleanField(default=False, verbose_name='es correcta'),
        ),
        migrations.AlterField(
            model_name='opcion',
            name='texto',
            field=models.CharField(max_length=300, verbose_name='opción'),
        ),
        migrations.AlterField(
            model_name='pregunta',
            name='cuestionario',
            field=models.CharField(choices=[('practica', 'Test práctico (intentos ilimitados)'), ('prueba', 'Prueba final (un solo intento)')], max_length=10, verbose_name='cuestionario'),
        ),
        migrations.AlterField(
            model_name='pregunta',
            name='texto',
            field=models.CharField(max_length=500, verbose_name='pregunta'),
        ),
        migrations.AlterField(
            model_name='pregunta',
            name='tipo',
            field=models.CharField(choices=[('unica', 'Opción única'), ('multiple', 'Varias opciones'), ('texto', 'Respuesta corta (no se corrige)')], default='unica', max_length=10, verbose_name='tipo'),
        ),
        migrations.AlterField(
            model_name='resultado',
            name='fecha_envio',
            field=models.DateTimeField(auto_now=True, verbose_name='último envío'),
        ),
        migrations.AlterField(
            model_name='resultado',
            name='intentos',
            field=models.PositiveIntegerField(default=1, verbose_name='intentos'),
        ),
        migrations.AlterField(
            model_name='resultado',
            name='porcentaje',
            field=models.PositiveIntegerField(default=0, validators=[django.core.validators.MaxValueValidator(100)], verbose_name='porcentaje'),
        ),
        migrations.AlterField(
            model_name='resultado',
            name='puntaje',
            field=models.PositiveIntegerField(default=0, verbose_name='respuestas correctas'),
        ),
        migrations.AlterField(
            model_name='resultado',
            name='repeticion_permitida',
            field=models.BooleanField(default=False, verbose_name='permitir repetir'),
        ),
        migrations.AlterField(
            model_name='resultado',
            name='total',
            field=models.PositiveIntegerField(default=0, verbose_name='preguntas corregibles'),
        ),
        migrations.CreateModel(
            name='Perfil',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rol', models.CharField(choices=[('alumno', 'Alumno'), ('profesor', 'Profesor'), ('admin', 'Administrador')], default='alumno', max_length=10, verbose_name='rol')),
                ('usuario', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='perfil', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'perfil',
                'verbose_name_plural': 'perfiles',
                'ordering': ['usuario__first_name', 'usuario__username'],
            },
        ),
    ]
