from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from .models import Curso, Opcion, Pregunta, Resultado


class CursoCrudTests(APITestCase):
    """Prueba el CRUD completo de un modelo (Curso) a través de la API."""

    def test_crud_de_cursos(self):
        # Crear (POST)
        r = self.client.post('/api/cursos/', {'titulo': 'Aromaterapia', 'autor': 'Especialista'})
        self.assertEqual(r.status_code, 201)
        pk = r.data['id']
        # Leer (GET): lista y detalle
        self.assertEqual(len(self.client.get('/api/cursos/').data), 1)
        self.assertEqual(self.client.get(f'/api/cursos/{pk}/').data['titulo'], 'Aromaterapia')
        # Actualizar (PUT)
        r = self.client.put(f'/api/cursos/{pk}/', {'titulo': 'Aromaterapia 2'})
        self.assertEqual(r.status_code, 200)
        self.assertEqual(Curso.objects.get(pk=pk).titulo, 'Aromaterapia 2')
        # Eliminar (DELETE)
        self.assertEqual(self.client.delete(f'/api/cursos/{pk}/').status_code, 204)
        self.assertEqual(Curso.objects.count(), 0)


class RelacionesTests(APITestCase):
    """Prueba que las relaciones entre modelos se reflejan en la API."""

    def setUp(self):
        self.curso = Curso.objects.create(titulo='Fisiobalón')

    def test_bloque_pertenece_a_un_curso_y_aparece_anidado(self):
        r = self.client.post('/api/bloques/', {'curso': self.curso.pk, 'seccion': 'teoria', 'titulo': 'Intro'})
        self.assertEqual(r.status_code, 201)
        curso = self.client.get(f'/api/cursos/{self.curso.pk}/').data
        self.assertEqual(curso['bloques'][0]['titulo'], 'Intro')

    def test_pregunta_con_sus_opciones(self):
        p = Pregunta.objects.create(curso=self.curso, cuestionario='prueba', texto='¿Cuál?')
        Opcion.objects.create(pregunta=p, texto='A', es_correcta=True)
        data = self.client.get(f'/api/preguntas/{p.pk}/').data
        self.assertEqual(data['opciones'][0]['texto'], 'A')

    def test_resultado_relaciona_alumno_y_curso(self):
        alumno = User.objects.create_user(username='ana', password='x')
        r = self.client.post('/api/resultados/', {'alumno': alumno.pk, 'curso': self.curso.pk, 'puntaje': 3, 'total': 4, 'porcentaje': 75})
        self.assertEqual(r.status_code, 201)
        self.assertEqual(Resultado.objects.get().alumno, alumno)

    def test_borrar_curso_borra_sus_bloques(self):
        self.client.post('/api/bloques/', {'curso': self.curso.pk, 'seccion': 'teoria', 'titulo': 'Intro'})
        self.curso.delete()
        self.assertEqual(self.client.get('/api/bloques/').data, [])
