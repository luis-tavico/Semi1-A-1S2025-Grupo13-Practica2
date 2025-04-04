from flask import Blueprint
from controllers.user_controller import register, login

user_bp = Blueprint('user_routes', __name__)

user_bp.route('/register', methods=['POST'])(register)
user_bp.route('/login', methods=['POST'])(login)
