import os
import firebase_admin
from firebase_admin import credentials, firestore

def init_firebase():
    use_firestore = os.environ.get('USE_FIRESTORE', 'false').lower() == 'true'
    if not use_firestore:
        return None

    if not firebase_admin._apps:
        cred_path = os.environ.get('FIREBASE_CREDENTIALS_PATH', 'firebase-key.json')
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            print(f"Advertencia: No se encontró el archivo de credenciales de Firebase en {cred_path}")
            # Intenta inicializar con credenciales por defecto (variables de entorno de Google)
            firebase_admin.initialize_app()
            
    return firestore.client()

db_firestore = init_firebase()
