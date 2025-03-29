from flask import Blueprint
from controllers.user_controller import register, login, get_profile, update_profile

user_bp = Blueprint('user_routes', __name__)

user_bp.route('/register', methods=['POST'])(register)
user_bp.route('/login', methods=['POST'])(login)
user_bp.route('/profile', methods=['GET'])(get_profile)
user_bp.route('/profile', methods=['PUT'])(update_profile)