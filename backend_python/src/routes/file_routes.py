from flask import Blueprint
from controllers.file_controller import upload_file, get_files_by_user, get_file_by_id, delete_file

file_bp = Blueprint('file_routes', __name__)

# Define routes on the blueprint
file_bp.route('/upload/', methods=['POST'])(upload_file)
file_bp.route('/', methods=['GET'])(get_files_by_user)
file_bp.route('/<int:file_id>', methods=['GET'])(get_file_by_id)
file_bp.route('/<int:file_id>', methods=['DELETE'])(delete_file)

def register_file_routes(app):
    # Register the blueprint with the app
    app.register_blueprint(file_bp, url_prefix='/api/files')