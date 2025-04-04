from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config.database import db
from routes.user_routes import user_bp
from routes.task_routes import task_bp
from routes.file_routes import file_bp
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)
#CORS(app, resources={r"/*": {"origins": "*"}})
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True, allow_headers=["Content-Type", "Authorization"])


# Configuración de la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASS')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configuración de JWT
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET')

# Inicializar extensiones
db.init_app(app)
jwt = JWTManager(app)

# Registrar blueprints
app.register_blueprint(user_bp, url_prefix='/api/users')
app.register_blueprint(task_bp, url_prefix='/api/tasks')
app.register_blueprint(file_bp, url_prefix='/api/files')

# Crear carpeta de uploads si no existe
if not os.path.exists('uploads'):
    os.makedirs('uploads')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=int(os.getenv('PORT', 4000)))