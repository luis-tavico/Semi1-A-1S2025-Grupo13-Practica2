from flask import request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity
from models.user_model import User
from config.database import db
from middleware.auth_middleware import auth_required
from werkzeug.security import generate_password_hash

def register():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"message": "No se recibieron datos"}), 400
            
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        profile_picture_url = data.get('profile_picture')
        
        if not username or not email or not password:
            return jsonify({"message": "Faltan datos obligatorios"}), 400
        
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return jsonify({"message": "El nombre de usuario ya existe"}), 409
            
        existing_email = User.query.filter_by(email=email).first()
        if existing_email:
            return jsonify({"message": "El correo electronico ya esta registrado"}), 409
        
        new_user = User(
            username=username,
            email=email,
            password=password,
            profile_picture=profile_picture_url
        )

        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "Usuario registrado exitosamente"}), 201
    except Exception as e:
        print(f"Error en register: {str(e)}")
        return jsonify({"message": f"Error al registrar usuario: {str(e)}"}), 500
    
def login():
    try:
        # Try to get data from both form-data and JSON
        data = request.get_json() or {}
        
        username = request.form.get('username') or data.get('username')
        password = request.form.get('password') or data.get('password')
        
        if not username or not password:
            return jsonify({"message": "Datos de inicio de sesión incompletos"}), 400
            
        user = User.query.filter_by(username=username).first()
        
        if not user or not user.check_password(password):
            return jsonify({"message": "Credenciales inválidas"}), 401
        
        # Generate JWT token
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            "message": "Inicio de sesión exitoso",
            "token": access_token,
            "user": user.to_dict()
        }), 200
    except Exception as e:
        print("Error en login:", str(e))
        return jsonify({"message": str(e)}), 500