import bcrypt
import jwt
from datetime import datetime, timedelta
from config import config

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

def check_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def generate_token(user):
    payload={
        "user_id": user["id"],
        "email": user["email"],
        "role": user["role"],
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, config.SECRET_KEY, algorithm="HS256")