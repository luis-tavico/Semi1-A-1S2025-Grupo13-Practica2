from flask import request, jsonify, abort
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from functools import wraps

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # Verificar si hay un header Authorization
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            abort(401, description="Token no proporcionado")
        try:
            # Verificar el token JWT
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            # Asegurar que user_id sea string
            if not isinstance(user_id, str):
                user_id = str(user_id)
            # Agregar usuario al request
            request.user = {"id": user_id}
            return f(*args, **kwargs)

        except Exception as e:
            abort(401, description="Token inválido o expirado")

    return decorated
# Alias para mantener compatibilidad con código existente
auth_required = token_required
