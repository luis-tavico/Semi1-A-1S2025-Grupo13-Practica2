from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from config.database import db
from models.file_model import File
from models.user_model import User
import os
import uuid
import base64
from werkzeug.utils import secure_filename
import boto3
import dotenv
from middleware.auth_middleware import auth_required

# Load environment variables
dotenv.load_dotenv()

# AWS S3 configuration
AWS_ACCESS_KEY = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.getenv('AWS_REGION')
S3_BUCKET_NAME = os.getenv('S3_BUCKET')

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'docx'}

# Initialize S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=AWS_REGION
)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_file_to_s3(file_bytes, filename, content_type):
    """Save file to S3 bucket and return the URL"""
    try:
        s3_path = f"files/{filename}"
        s3_client.put_object(
            Bucket=S3_BUCKET_NAME,
            Key=s3_path,
            Body=file_bytes,
            ContentType=content_type,
            ACL='public-read'
        )
        # Generate S3 URL
        s3_url = f"https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{s3_path}"
        return s3_url
    except Exception as e:
        print(f"Error saving to S3: {str(e)}")
        raise e

@auth_required
def upload_file():
    try:
        # Get data from request
        data = request.get_json()
        
        # Check if file data is provided directly
        if 'file_name' in data and 'file_url' in data:
            # Direct file data provided (similar to Node.js version)
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
            
        # Handle file upload with base64 content
        elif 'file' in data:
            file_data = data.get('file')
            if 'name' not in file_data or 'content' not in file_data or 'type' not in file_data:
                return jsonify({"message": "Información del archivo incompleta."}), 400
                
            filename = file_data['name']
            file_content = file_data['content']
            file_type = file_data['type']
            
            if not allowed_file(filename):
                return jsonify({"message": "Tipo de archivo no permitido."}), 400
    
            # Generate unique filename
            secure_name = secure_filename(filename)
            unique_filename = f"{uuid.uuid4()}_{secure_name}"
            
            # Decode base64 content
            try:
                if ',' in file_content:
                    file_content = file_content.split(',', 1)[1]
                    
                file_bytes = base64.b64decode(file_content)
            except Exception as e:
                return jsonify({"message": f"Error al decodificar el archivo: {str(e)}"}), 400
    
            # Upload to S3
            file_url = save_file_to_s3(file_bytes, unique_filename, file_type)
            
            user_id = get_jwt_identity()
    
            new_file = File(
                file_name=filename, 
                file_type=file_type, 
                file_url=file_url,
                user_id=user_id
            )
            db.session.add(new_file)
            db.session.commit()
    
            return jsonify(new_file.to_dict()), 201
        else:
            return jsonify({"message": "Datos incompletos"}), 400
            
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
        
        # Format response similar to Node.js version
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

        # Delete file from S3 if it's stored there
        if file.file_url and file.file_url.startswith('https://'):
            try:
                s3_key = file.file_url.split(f"{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/")[1]
                s3_client.delete_object(Bucket=S3_BUCKET_NAME, Key=s3_key)
            except Exception as e:
                print(f"Error deleting from S3: {str(e)}")

        db.session.delete(file)
        db.session.commit()

        # Return 204 No Content as in the Node.js version
        return "", 204
    except Exception as e:
        return jsonify({"message": str(e)}), 500