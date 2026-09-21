from flask import Blueprint, request, jsonify
from models import db, User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'message': 'Faltan datos requeridos'}), 400

    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'message': 'El correo ya está registrado'}), 400

    # Determinar rol (por defecto 'student', a menos que manden 'admin' - OJO: en producción esto se protege)
    role = data.get('role', 'student')
    if role not in ['student', 'admin']:
        role = 'student'

    new_user = User(
        name=data.get('name'),
        email=data.get('email'),
        role=role
    )
    new_user.set_password(data.get('password'))

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Usuario registrado exitosamente'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Faltan credenciales'}), 400

    user = User.query.filter_by(email=data.get('email')).first()

    if not user or not user.check_password(data.get('password')):
        return jsonify({'message': 'Correo o contraseña incorrectos'}), 401

    # Crear token con el ID del usuario como identidad
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'token': access_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    # Obtener la identidad del JWT actual (el ID del usuario)
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'message': 'Usuario no encontrado'}), 404
        
    return jsonify(user.to_dict()), 200
