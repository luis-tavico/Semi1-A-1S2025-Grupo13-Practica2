from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from functools import wraps

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            request.user = {'id': user_id}
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({"message": "Token inválido o expirado"}), 401
    return decorated

# Alias para mantener compatibilidad con el código existente
auth_required = token_required