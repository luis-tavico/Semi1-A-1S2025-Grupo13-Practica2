from flask import request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity
from models.user_model import User
from config.database import db
from middleware.auth_middleware import auth_required
from werkzeug.security import generate_password_hash
import os

def register():
    try:
        # Cambio de JSON a FormData
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        
        # Manejo de archivos (imagen de perfil)
        profile_picture = None
        if 'profile_picture' in request.files:
            file = request.files['profile_picture']
            if file and file.filename != '':
                # Crear directorio si no existe
                upload_folder = 'uploads/profiles'
                if not os.path.exists(upload_folder):
                    os.makedirs(upload_folder)
                
                # Guardar archivo

        
        # Verificar si el usuario ya existe
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"message": "El correo electrónico ya está registrado"}), 409
        
        # Crear nuevo usuario
        new_user = User(
            username=username,
            email=email,
            password=password,
            profile_picture=profile_picture
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({"message": "Usuario registrado exitosamente"}), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def login():
    try:
        # Cambio de JSON a FormData
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username).first()
        
        if not user or not user.check_password(password):
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
def update_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"message": "Usuario no encontrado"}), 404
        
        # Cambio de JSON a FormData
        if 'username' in request.form:
            user.username = request.form.get('username')
        if 'email' in request.form:
            user.email = request.form.get('email')
        if 'password' in request.form:
            user.password = generate_password_hash(request.form.get('password'))
        
        # Manejo de archivos (imagen de perfil)
        if 'profile_picture' in request.files:
            file = request.files['profile_picture']
            if file and file.filename != '':
                # Eliminar imagen anterior si existe
                if user.profile_picture and os.path.exists(user.profile_picture):
                    os.remove(user.profile_picture)
                
                # Crear directorio si no existe
                upload_folder = 'uploads/profiles'
                if not os.path.exists(upload_folder):
                    os.makedirs(upload_folder)
                
                # Guardar archivo

        
        db.session.commit()
        
        return jsonify({"message": "Perfil actualizado exitosamente", "user": user.to_dict()}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# Mantener el método get_profile sin cambios ya que no recibe datos
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