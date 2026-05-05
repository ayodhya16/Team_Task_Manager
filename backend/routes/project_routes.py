from flask import Blueprint, request, jsonify
from db import get_db_connection
from utils.decorators import token_required

project_bp = Blueprint("projects", __name__)

# CREATE PROJECT (ANY USER CAN CREATE)
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
        # create project
        cursor.execute("""
            INSERT INTO projects (name, description, created_by)
            VALUES (%s, %s, %s)
        """, (name, description, user_id))

        project_id = cursor.lastrowid

        # 🔥 creator becomes project admin
        cursor.execute("""
            INSERT INTO project_members (project_id, user_id, role)
            VALUES (%s, %s, 'admin')
        """, (project_id, user_id))

        conn.commit()

        return jsonify({
            "message": "Project created",
            "project_id": project_id
        })

    finally:
        cursor.close()
        conn.close()


# GET USER PROJECTS
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

    return jsonify(cursor.fetchall())


# GET PROJECT DETAILS
@project_bp.route("/projects/<int:project_id>", methods=["GET"])
@token_required
def get_project(project_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM projects WHERE id = %s", (project_id,))
    project = cursor.fetchone()

    return jsonify(project)


# GET MEMBERS
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

    return jsonify(cursor.fetchall())


# ADD MEMBER (EMAIL BASED)
@project_bp.route("/projects/<int:project_id>/members", methods=["POST"])
@token_required
def add_member(project_id):
    data = request.json
    email = data.get("email")
    current_user_id = request.user["user_id"]

    if not email:
        return jsonify({"error": "Email required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # check current user is admin of project
        cursor.execute("""
            SELECT role FROM project_members
            WHERE project_id = %s AND user_id = %s
        """, (project_id, current_user_id))

        role = cursor.fetchone()

        if not role or role["role"] != "admin":
            return jsonify({"error": "Only project admin can add members"}), 403

        # find user by email
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "User not found"}), 404

        user_id = user["id"]

        # prevent duplicate
        cursor.execute("""
            SELECT * FROM project_members
            WHERE project_id = %s AND user_id = %s
        """, (project_id, user_id))

        if cursor.fetchone():
            return jsonify({"error": "User already a member"}), 400

        # add member
        cursor.execute("""
            INSERT INTO project_members (project_id, user_id, role)
            VALUES (%s, %s, 'member')
        """, (project_id, user_id))

        conn.commit()

        return jsonify({"message": "Member added successfully"})

    finally:
        cursor.close()
        conn.close()

#update project
@project_bp.route("/projects/<int:project_id>", methods=["PUT"])
@token_required
def update_project(project_id):
    data = request.json
    name = data.get("name")
    description = data.get("description")

    user_id = request.user["user_id"]

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # check admin
        cursor.execute("""
            SELECT role FROM project_members
            WHERE project_id = %s AND user_id = %s
        """, (project_id, user_id))

        role = cursor.fetchone()

        if not role or role["role"] != "admin":
            return jsonify({"error": "Only admin can edit project"}), 403

        cursor.execute("""
            UPDATE projects
            SET name=%s, description=%s
            WHERE id=%s
        """, (name, description, project_id))

        conn.commit()

        return jsonify({"message": "Project updated"})

    finally:
        cursor.close()
        conn.close()

# delete project
@project_bp.route("/projects/<int:project_id>", methods=["DELETE"])
@token_required
def delete_project(project_id):
    user_id = request.user["user_id"]

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # check admin
        cursor.execute("""
            SELECT role FROM project_members
            WHERE project_id = %s AND user_id = %s
        """, (project_id, user_id))

        role = cursor.fetchone()

        if not role or role["role"] != "admin":
            return jsonify({"error": "Only admin can delete project"}), 403

        cursor.execute("DELETE FROM projects WHERE id = %s", (project_id,))
        conn.commit()

        return jsonify({"message": "Project deleted"})

    finally:
        cursor.close()
        conn.close()

# remove member
@project_bp.route("/projects/<int:project_id>/members/<int:user_id>", methods=["DELETE"])
@token_required
def remove_member(project_id, user_id):
    current_user = request.user["user_id"]

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # check admin
        cursor.execute("""
            SELECT role FROM project_members
            WHERE project_id = %s AND user_id = %s
        """, (project_id, current_user))

        role = cursor.fetchone()

        if not role or role["role"] != "admin":
            return jsonify({"error": "Only admin can remove members"}), 403

        cursor.execute("""
            DELETE FROM project_members
            WHERE project_id = %s AND user_id = %s
        """, (project_id, user_id))

        conn.commit()

        return jsonify({"message": "Member removed"})

    finally:
        cursor.close()
        conn.close()