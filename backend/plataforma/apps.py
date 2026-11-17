from django.apps import AppConfig

class PlataformaConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'plataforma'

    def ready(self):
        from . import signals  # noqa: F401
