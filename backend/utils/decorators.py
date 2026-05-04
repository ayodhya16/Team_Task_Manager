from flask import request, jsonify
import jwt
from config import config
from functools import wraps

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({"error":"Token missing"}), 401

        try:
            token = auth_header.split(" ")[1] # Bearer token
            data = jwt.decode(token, config.SECRET_KEY, algorithms=["HS256"])

            request.user = data #attach user info

        except Exception as e:
            return jsonify({"error": "Invalid or expired token"}), 401
        
        return f(*args, **kwargs)

    return decorated

def role_required(role):
    def wrapper(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user = request.user

            if user.get("role") != role:
                return jsonify({"error": "Access denied"}), 403
            return f(*args, **kwargs)

        return decorated
    return wrapper