from flask import request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity
from models.user_model import User
from config.database import db
from middleware.auth_middleware import auth_required
from werkzeug.security import generate_password_hash
import os
import uuid
import time
from werkzeug.utils import secure_filename
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# AWS S3 Configuration
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.getenv('AWS_REGION')
S3_BUCKET = os.getenv('S3_BUCKET')

# Initialize S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Function to validate allowed files
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS



def register():
    try:
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        
        profile_picture_url = None
        
        # Handle file upload to S3
        if 'profile_picture' in request.files:
            file = request.files['profile_picture']
            if file and file.filename != '' and allowed_file(file.filename):
                profile_picture_url = upload_file_to_s3(file)
        
        # Validar usuario existente
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"message": "El correo electrónico ya está registrado"}), 409
        
        # Create new user with the profile picture URL
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
        return jsonify({"message": str(e)}), 500

def upload_file_to_s3(file):
    if file and file.filename:
        timestamp = int(time.time() * 1000)
        original_filename = secure_filename(file.filename)
        s3_key = f"profile_pictures/{timestamp}_{original_filename}"
        # Carga a s3
        try:
            # Metadata
            metadata = {'fieldName': 'profile_picture'}
            
            # Subir archivo a S3
            s3_client.upload_fileobj(
                file,
                S3_BUCKET,
                s3_key,
                ExtraArgs={
                    'ContentType': file.content_type,
                    'Metadata': metadata
                }
            )
            # Return the file URL
            file_url = f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{s3_key}"
            print(f"File uploaded successfully to: {file_url}")
            return file_url
        except Exception as e:
            print(f"Error uploading to S3: {str(e)}")
            return None
    return None
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

