from flask import request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity
from models.user_model import User
from config.database import db
from middleware.auth_middleware import auth_required

def register():
    try:
        data = request.get_json()
        
        # Verificar si el usuario ya existe
        existing_user = User.query.filter_by(email=data.get('email')).first()
        if existing_user:
            return jsonify({"message": "El correo electrónico ya está registrado"}), 409
        
        # Crear nuevo usuario
        new_user = User(
            username=data.get('username'),
            email=data.get('email'),
            password=data.get('password'),
            profile_picture=data.get('profile_picture')
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({"message": "Usuario registrado exitosamente"}), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def login():
    try:
        data = request.get_json()
        
        user = User.query.filter_by(email=data.get('email')).first()
        
        if not user or not user.check_password(data.get('password')):
            return jsonify({"message": "Credenciales inválidas"}), 401
        
        # Generar token JWT
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            "message": "Inicio de sesión exitoso",
            "token": access_token,
            "user": user.to_dict()
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@auth_required
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"message": "Usuario no encontrado"}), 404
        
        return jsonify(user.to_dict()), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@auth_required
def update_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"message": "Usuario no encontrado"}), 404
        
        data = request.get_json()
        
        if 'username' in data:
            user.username = data['username']
        if 'email' in data:
            user.email = data['email']
        if 'password' in data:
            user.password = generate_password_hash(data['password'])
        if 'profile_picture' in data:
            user.profile_picture = data['profile_picture']
        
        db.session.commit()
        
        return jsonify({"message": "Perfil actualizado exitosamente", "user": user.to_dict()}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500