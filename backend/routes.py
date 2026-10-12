from flask import Blueprint, request, jsonify
from models import db, User, bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import os

try:
    from db_config import db_firestore
except ImportError:
    db_firestore = None

auth_bp = Blueprint('auth', __name__)

USE_FIRESTORE = os.environ.get('USE_FIRESTORE', 'false').lower() == 'true'

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'message': 'Faltan datos requeridos'}), 400

    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    role = data.get('role', 'student')
    
    if role not in ['student', 'admin']:
        role = 'student'

    if USE_FIRESTORE and db_firestore:
        # Lógica para Firestore
        users_ref = db_firestore.collection('users')
        docs = users_ref.where('email', '==', email).stream()
        if len(list(docs)) > 0:
            return jsonify({'message': 'El correo ya está registrado'}), 400
            
        password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user_ref = users_ref.document()
        new_user_ref.set({
            'name': name,
            'email': email,
            'password_hash': password_hash,
            'role': role
        })
    else:
        # Lógica para SQLAlchemy (PostgreSQL / SQLite)
        if User.query.filter_by(email=email).first():
            return jsonify({'message': 'El correo ya está registrado'}), 400

        new_user = User(name=name, email=email, role=role)
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

    return jsonify({'message': 'Usuario registrado exitosamente'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Faltan credenciales'}), 400

    email = data.get('email')
    password = data.get('password')
    user_id = None
    user_data = None

    if USE_FIRESTORE and db_firestore:
        users_ref = db_firestore.collection('users')
        docs = list(users_ref.where('email', '==', email).stream())
        
        if not docs:
            return jsonify({'message': 'Correo o contraseña incorrectos'}), 401
            
        doc = docs[0]
        doc_data = doc.to_dict()
        
        if not bcrypt.check_password_hash(doc_data.get('password_hash'), password):
            return jsonify({'message': 'Correo o contraseña incorrectos'}), 401
            
        user_id = doc.id
        user_data = {
            'id': doc.id,
            'name': doc_data.get('name'),
            'email': doc_data.get('email'),
            'role': doc_data.get('role')
        }
    else:
        user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            return jsonify({'message': 'Correo o contraseña incorrectos'}), 401
            
        user_id = str(user.id)
        user_data = user.to_dict()

    access_token = create_access_token(identity=user_id)
    
    return jsonify({
        'token': access_token,
        'user': user_data
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    current_user_id = get_jwt_identity()
    
    if USE_FIRESTORE and db_firestore:
        doc_ref = db_firestore.collection('users').document(current_user_id)
        doc = doc_ref.get()
        if not doc.exists:
            return jsonify({'message': 'Usuario no encontrado'}), 404
            
        doc_data = doc.to_dict()
        user_data = {
            'id': doc.id,
            'name': doc_data.get('name'),
            'email': doc_data.get('email'),
            'role': doc_data.get('role')
        }
        return jsonify(user_data), 200
    else:
        user = User.query.get(int(current_user_id))
        if not user:
            return jsonify({'message': 'Usuario no encontrado'}), 404
            
        return jsonify(user.to_dict()), 200
