from flask import request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity
from models.user_model import User
from config.database import db
from middleware.auth_middleware import auth_required
from werkzeug.security import generate_password_hash
import os
import uuid
from werkzeug.utils import secure_filename


UPLOAD_FOLDER = 'uploads/profiles'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Función para validar archivos permitidos
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def register():
    try:
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')

        profile_picture = None

        # Manejo de la imagen de perfil
        if 'profile_picture' in request.files:
            file = request.files['profile_picture']
            if file and file.filename != '':
                upload_folder = 'backend_python/src/uploads/profiles/'
                if not os.path.exists(upload_folder):
                    os.makedirs(upload_folder)
                # Guardar la imagen con un nombre único
                filename = f"{uuid.uuid4()}_{secure_filename(file.filename)}"
                profile_picture_path = os.path.join(upload_folder, filename)
                file.save(profile_picture_path)

                # Guardar la ruta en la base de datos
                profile_picture = profile_picture_path

        # Verificar si el usuario ya existe
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"message": "El correo electrónico ya está registrado"}), 409

        # Crear nuevo usuario con la imagen
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
        print(f"Error en register: {str(e)}")
        return jsonify({"message": str(e)}), 500


def login():
    try:
        # Intentar obtener datos tanto de form-data como de JSON
        print("Request data:", request.form, request.get_json())
        
        # Primero intentar obtener de form-data
        username = request.form.get('username')
        password = request.form.get('password')
        
        # Si no hay datos en form-data, intentar con JSON
        if not username or not password:
            data = request.get_json()
            if data:
                username = data.get('username')
                password = data.get('password')
                
        print("Username:", username)
        print("Password:", password)
        
        if not username or not password:
            return jsonify({"message": "Datos de inicio de sesión incompletos"}), 400
            
        user = User.query.filter_by(username=username).first()
        
        if not user or not user.check_password(password):
            return jsonify({"message": "Credenciales inválidas"}), 401
        
        # Generar token JWT
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            "message": "Inicio de sesión exitoso",
            "token": access_token,
            "user": user.to_dict()
        }), 200
    except Exception as e:
        print("Error en login:", str(e))
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
                if not os.path.exists(UPLOAD_FOLDER):
                    os.makedirs(UPLOAD_FOLDER)

                # Guardar archivo con nombre único
                filename = secure_filename(file.filename)
                unique_filename = f"{uuid.uuid4()}_{filename}"
                file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
                file.save(file_path)
                user.profile_picture = file_path  # Guardar ruta en la base de datos
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