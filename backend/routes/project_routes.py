from flask import Blueprint, request, jsonify
from db import get_db_connection
from utils.decorators import token_required, role_required

project_bp = Blueprint("project", __name__)

# creating project API
@project_bp.route("/projects", methods = ["POST"])
@token_required
@role_required("admin")
def create_project():
    data = request.json

    name = data.get("name")
    description = data.get("description", "")

    if not name or not name.strip():
        return jsonify({"error": "Project name is required"}),

    user_id = request.user["user_id"] 

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary = True)

        cursor.execute(
            "INSERT INTO projects(name, description, created_by) VALUES (%s, %s, %s)",
            (name.strip(), description.strip(), user_id)
        )

        conn.commit()

        project_id = cursor.lastrowid

        cursor.execute(
            "INSERT INTO project_members (project_id, user_id, role) VALUES(%s, %s, %s)",
            (project_id, user_id, "admin")
        )
        conn.commit()

        return jsonify(
            {
                "message": "Project created successfully",
                "project_id" : project_id
            }
        ),201
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@project_bp.route("/projects", methods =["GET"])
@token_required
def get_projects():
    user_id = request.user["user_id"]

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary = True)

        cursor.execute("""
            SELECT p.id, p.name, p.description, p.created_by, p.created_at, pm.role
            FROM projects p
            JOIN project_members pm ON p.id = pm.project_id
            WHERE pm.user_id = %s
            ORDER BY created_at DESC
            """, (user_id,)
        )

        projects = cursor.fetchall()

        return jsonify(projects),200
    
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# getting one project by id

@project_bp.route("/projects/<int:project_id>", methods =["GET"])
@token_required
def get_project(project_id):
    user_id = request.user["user_id"]

    conn = None
    cursor = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary = True)

        cursor.execute("""
        SELECT p.id, p.name, p.description, p.created_by, p.created_at
        FROM projects p
        JOIN project_members pm ON p.id = pm.project_id
        WHERE p.id = %s AND pm.user_id = %s
        """, (project_id, user_id))

        project = cursor.fetchone()

        if not project:
            return jsonify({"error": "Project not found or access denied"}), 404

        return jsonify(project), 200

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Update project (Only admin should update)
@project_bp.route("/projects/<int:project_id>", methods=["PUT"])
@token_required
@role_required("admin")
def update_project(project_id):
    data = request.json
    name = data.get("name")
    description = data.get("description")

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM projects WHERE id = %s", (project_id,))
        project = cursor.fetchone()

        if not project:
            return jsonify({"error": "Project not found"}), 404

        cursor.execute("""
            UPDATE projects
            SET name = %s, description = %s
            WHERE id = %s
        """, (name, description, project_id))

        conn.commit()

        return jsonify({"message": "Project updated successfully"}), 200

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


#deleting project (only admin should)

@project_bp.route("/projects/<int:project_id>", methods=["DELETE"])
@token_required
@role_required("admin")
def delete_project(project_id):
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM projects WHERE id = %s", (project_id,))
        project = cursor.fetchone()

        if not project:
            return jsonify({"error": "Project not found"}), 404

        cursor.execute("DELETE FROM projects WHERE id = %s", (project_id,))
        conn.commit()

        return jsonify({"message": "Project deleted successfully"}), 200

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Add member to project (Only admin should do this)

@project_bp.route("/projects/<int:project_id>/members", methods=["POST"])
@token_required
@role_required("admin")
def add_member(project_id):
    data = request.json
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404

        cursor.execute("""
            SELECT * FROM project_members
            WHERE project_id = %s AND user_id = %s
        """, (project_id, user_id))

        existing = cursor.fetchone()
        if existing:
            return jsonify({"error": "User already added to this project"}), 400

        cursor.execute("""
            INSERT INTO project_members (project_id, user_id, role)
            VALUES (%s, %s, %s)
        """, (project_id, user_id, "member"))

        conn.commit()

        return jsonify({"message": "Member added successfully"}), 201

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# Get project members

@project_bp.route("/projects/<int:project_id>/members", methods=["GET"])
@token_required
def get_project_members(project_id):
    user_id = request.user["user_id"]

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT * FROM project_members
            WHERE project_id = %s AND user_id = %s
        """, (project_id, user_id))

        access = cursor.fetchone()
        if not access:
            return jsonify({"error": "Access denied"}), 403

        cursor.execute("""
            SELECT u.id, u.name, u.email, pm.role, pm.joined_at
            FROM users u
            JOIN project_members pm ON u.id = pm.user_id
            WHERE pm.project_id = %s
        """, (project_id,))

        members = cursor.fetchall()

        return jsonify(members), 200

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()