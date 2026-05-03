from flask import Blueprint, request, jsonify
from db import get_db_connection
from utils.helpers import hash_password, check_password, generate_token

auth_bp = Blueprint('auth', __name__)

# register route

@auth_bp.route('/register', methods = ['POST'])
def register():
    data = request.json

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    if not name.strip() or not email.strip() or not password.strip():
        return jsonify({"error": "Fields cannot be empty"}), 400

    # check existing user
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary = True)

        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"error": "Email already exists"}), 400

        hashed = hash_password(password)

        cursor.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s)",
            (name, email, hashed.decode('utf-8'))
        )
        conn.commit()

        return jsonify({"message": "User registered successfully"})

    finally:
        cursor.close()
        conn.close()


# login api

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json

    email =data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary = True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if not user or not check_password(password, user["password_hash"]):
            return jsonify({"error": "Invalid credentials"}), 401

        token = generate_token(user)

        return jsonify({
            "token": token,
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"]
            }
        })

    finally:
        cursor.close()
        conn.close()
