from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from config.database import db
from models.file_model import File
from models.user_model import User
from middleware.auth_middleware import auth_required

@auth_required
def upload_file():
    try:
        data = request.get_json()
        
        if not data or 'file_name' not in data or 'file_url' not in data:
            return jsonify({"message": "Informacion del archivo incompleta."}), 400
            
        file_name = data.get('file_name')
        file_type = data.get('file_type', '')
        file_url = data.get('file_url')
        
        user_id = get_jwt_identity()
        
        new_file = File(
            file_name=file_name,
            file_type=file_type,
            file_url=file_url,
            user_id=user_id
        )
        
        db.session.add(new_file)
        db.session.commit()
        
        return jsonify(new_file.to_dict()), 201
            
    except Exception as e:
        print(f"Error uploading file: {str(e)}")
        return jsonify({"message": str(e)}), 500

@auth_required
def get_files_by_user():
    try:
        user_id = get_jwt_identity()
        files = File.query.filter_by(user_id=user_id).all()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"message": "Usuario no encontrado"}), 404
        
        return jsonify({
            "files": [file.to_dict() for file in files],
            "user": user.to_dict()
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@auth_required
def get_file_by_id(file_id):
    try:
        file = File.query.get(file_id)
        
        if not file:
            return jsonify({"message": "Archivo no encontrado."}), 404

        return jsonify(file.to_dict()), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@auth_required
def delete_file(file_id):
    try:
        file = File.query.get(file_id)
        
        if not file:
            return jsonify({"message": "Archivo no encontrado."}), 404

        db.session.delete(file)
        db.session.commit()

        return "", 204
    except Exception as e:
        return jsonify({"message": str(e)}), 500