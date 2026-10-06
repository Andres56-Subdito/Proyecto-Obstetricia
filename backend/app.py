import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from models import db, bcrypt
from flask_jwt_extended import JWTManager
from routes import auth_bp

# Cargar variables de entorno desde .env
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Permitir peticiones desde el frontend (React suele correr en el 5173)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Configuración
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///local_database.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'default-secret-key')
    
    # Inicializar extensiones
    db.init_app(app)
    bcrypt.init_app(app)
    jwt = JWTManager(app)
    
    # Registrar rutas
    app.register_blueprint(auth_bp, url_prefix='/api')
    
    # Crear tablas si no existen (útil para desarrollo)
    with app.app_context():
        db.create_all()
        
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
