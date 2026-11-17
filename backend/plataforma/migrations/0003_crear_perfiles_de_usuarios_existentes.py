from django.db import migrations


def crear_perfiles(apps, schema_editor):
    """
    Los usuarios creados ANTES de existir la tabla Perfil (por ejemplo el superusuario de la pre-entrega)
    no tienen rol. Aquí se les asigna: superusuario -> admin, el resto -> alumno.
    """
    User = apps.get_model('auth', 'User')
    Perfil = apps.get_model('plataforma', 'Perfil')
    for usuario in User.objects.filter(perfil__isnull=True):
        Perfil.objects.create(usuario=usuario, rol='admin' if usuario.is_superuser else 'alumno')


class Migration(migrations.Migration):

    dependencies = [
        ('plataforma', '0002_perfiles_validaciones_y_contenido_de_inicio'),
    ]

    operations = [
        # El segundo argumento (noop) permite deshacer la migración sin hacer nada.
        migrations.RunPython(crear_perfiles, migrations.RunPython.noop),
    ]


