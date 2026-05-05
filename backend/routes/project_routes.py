from flask import Blueprint, request, jsonify
from db import get_db_connection
from utils.decorators import token_required

project_bp = Blueprint("projects", __name__)

# 🚀 CREATE PROJECT
@project_bp.route("/projects", methods=["POST"])
@token_required
def create_project():
    data = request.json
    name = data.get("name")
    description = data.get("description")

    user_id = request.user["user_id"]

    if not name:
        return jsonify({"error": "Project name required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            INSERT INTO projects (name, description, created_by)
            VALUES (%s, %s, %s)
        """, (name, description, user_id))

        project_id = cursor.lastrowid

        # add creator as admin
        cursor.execute("""
            INSERT INTO project_members (project_id, user_id, role)
            VALUES (%s, %s, 'admin')
        """, (project_id, user_id))

        conn.commit()

        return jsonify({"message": "Project created", "project_id": project_id})

    finally:
        cursor.close()
        conn.close()


# 🚀 GET PROJECTS
@project_bp.route("/projects", methods=["GET"])
@token_required
def get_projects():
    user_id = request.user["user_id"]

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT p.*
        FROM projects p
        JOIN project_members pm ON p.id = pm.project_id
        WHERE pm.user_id = %s
    """, (user_id,))

    projects = cursor.fetchall()

    return jsonify(projects)


# 🚀 GET PROJECT DETAILS
@project_bp.route("/projects/<int:project_id>", methods=["GET"])
@token_required
def get_project(project_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM projects WHERE id = %s", (project_id,))
    project = cursor.fetchone()

    return jsonify(project)


# 🚀 GET MEMBERS
@project_bp.route("/projects/<int:project_id>/members", methods=["GET"])
@token_required
def get_members(project_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT u.id, u.name, u.email, pm.role
        FROM project_members pm
        JOIN users u ON pm.user_id = u.id
        WHERE pm.project_id = %s
    """, (project_id,))

    members = cursor.fetchall()

    return jsonify(members)


# 🚀 ADD MEMBER (EMAIL BASED)
@project_bp.route("/projects/<int:project_id>/members", methods=["POST"])
@token_required
def add_member(project_id):
    data = request.json
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # find user by email
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "User not found"}), 404

        user_id = user["id"]

        # check already exists
        cursor.execute("""
            SELECT * FROM project_members
            WHERE project_id = %s AND user_id = %s
        """, (project_id, user_id))

        if cursor.fetchone():
            return jsonify({"error": "User already a member"}), 400

        cursor.execute("""
            INSERT INTO project_members (project_id, user_id, role)
            VALUES (%s, %s, 'member')
        """, (project_id, user_id))

        conn.commit()

        return jsonify({"message": "Member added successfully"})

    finally:
        cursor.close()
        conn.close()