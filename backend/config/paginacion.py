from rest_framework.pagination import PageNumberPagination


class PaginacionEstandar(PageNumberPagination):
    """
    Paginación de todos los listados de la API (se activa en settings.py -> REST_FRAMEWORK).

    - 10 registros por página (se cambia en `page_size`).
    - El cliente puede elegir la página con   ?page=2
    - Y el tamaño con                          ?page_size=3   (máximo 100)
    La respuesta trae: count (total), next, previous y results (los registros de esa página).
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
