#Formato de las respuestas (JSON):  { "<id de la pregunta>": <respuesta> }
#  opción única    -> id de la opción elegida              ej: {"12": 41}
#  varias opciones -> lista de ids de opciones             ej: {"13": [44, 46]}
#  respuesta corta -> texto (no se corrige)                ej: {"14": "mi respuesta"}

PORCENTAJE_APROBACION = 60  # porcentaje mínimo para aprobar 


# funcion para convertir la respuesta del cliente en un conjunto de ids, si el valor es una lista o tupla, se convierte en un conjunto de enteros 
# si es un solo valor, se convierte en un conjunto con un solo elemento y si el valor no es válido (por ejemplo, si no se puede convertir a entero), devuelve None

def _a_conjunto_de_ids(valor):
    valores = valor if isinstance(valor, (list, tuple)) else [valor]
    try:
        return {int(v) for v in valores if v is not None}
    except (TypeError, ValueError):
        return None


# funcion para corregir las respuestas de un cuestionario de un curso, las preguntas de respuesta corta no se corrigen
# devuelve una tupla con el puntaje, el total, el porcentaje y un detalle por pregunta indicando si fue correcta o no

def corregir(curso, cuestionario, respuestas):
    preguntas = curso.preguntas.filter(cuestionario=cuestionario).prefetch_related('opciones')
    detalle = []
    puntaje = 0
    total = 0

    for pregunta in preguntas:
        if pregunta.tipo == 'texto':
            continue
        total += 1
        correctas = {o.id for o in pregunta.opciones.all() if o.es_correcta}
        elegidas = _a_conjunto_de_ids(respuestas.get(str(pregunta.id)))
        acerto = bool(correctas) and elegidas == correctas
        puntaje += int(acerto)
        detalle.append({'pregunta': pregunta.id, 'correcta': acerto})

    porcentaje = round(puntaje * 100 / total) if total else 100
    return puntaje, total, porcentaje, detalle



