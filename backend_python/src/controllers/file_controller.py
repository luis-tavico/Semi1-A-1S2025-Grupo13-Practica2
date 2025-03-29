from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from config.database import db
from models.file_model import File
from werkzeug.utils import secure_filename
import os
import uuid
from middleware.auth_middleware import auth_required

UPLOAD_FOLDER = 'uploads/files'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@auth_required
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({"message": "No se ha subido ningún archivo."}), 400

        file = request.files['file']
        if file.filename == '' or not allowed_file(file.filename):
            return jsonify({"message": "Archivo no permitido."}), 400

        # Crear directorio si no existe
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)

        # Generar nombre único para el archivo
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(file_path)

        user_id = get_jwt_identity()

        new_file = File(
            file_name=filename, 
            file_type=file.content_type if hasattr(file, 'content_type') else file.mimetype, 
            file_url=file_path, 
            user_id=user_id
        )
        db.session.add(new_file)
        db.session.commit()

        return jsonify({
            "message": "Archivo subido exitosamente.", 
            "file": new_file.to_dict()
        }), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# Los métodos de obtención y eliminación no necesitan cambios
@auth_required
def get_files_by_user():
    try:
        user_id = get_jwt_identity()
        files = File.query.filter_by(user_id=user_id).all()
        return jsonify([file.to_dict() for file in files]), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@auth_required
def get_file_by_id(file_id):
    try:
        user_id = get_jwt_identity()
        file = File.query.filter_by(id=file_id, user_id=user_id).first()
        
        if not file:
            return jsonify({"message": "Archivo no encontrado."}), 404

        return jsonify(file.to_dict()), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@auth_required
def delete_file(file_id):
    try:
        user_id = get_jwt_identity()
        file = File.query.filter_by(id=file_id, user_id=user_id).first()
        
        if not file:
            return jsonify({"message": "Archivo no encontrado."}), 404

        # Eliminar archivo físico
        if os.path.exists(file.file_url):
            os.remove(file.file_url)

        db.session.delete(file)
        db.session.commit()

        return jsonify({"message": "Archivo eliminado exitosamente."}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500