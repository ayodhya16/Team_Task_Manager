from flask import Blueprint, request, jsonify
from db import get_db_connection
from utils.decorators import token_required, role_required

task_bp = Blueprint("task", __name__)

# Helper function: check project access

def check_project_membership(cursor, project_id, user_id):
    cursor.execute("""
        SELECT * FROM project_members
        WHERE project_id = %s AND user_id = %s
    """, (project_id, user_id))
    return cursor.fetchone()

@task_bp.route("/tasks", methods =["POST"])
@token_required
@role_required("admin")
def create_task():
    data = request.json

    title = data.get("title")
    description = data.get("description", "")
    status = data.get("status", "todo")
    priority = data.get("priority", "medium")
    due_date = data.get("due_date")
    project_id = data.get("project_id")
    assigned_to = data.get("assigned_to")

    if not title or not project_id:
        return jsonify({"error": "Title and project_id are required"}), 400

    user_id =request.user["user_id"]

    conn= None
    cursor =None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # check project exists and user has access
        if not check_project_membership(cursor, project_id, user_id):
            return jsonify({"error":"Access denied for this project"}),403
        
        # if assigned_to is provided, ensure user exists and is project member
        if assigned_to:
            cursor.execute("SELECT * FROM users WHERE id = %s", (assigned_to,))
            assignee = cursor.fetchone()
            if not assignee:
                return jsonify({"error": "Assigned user not found"}), 404

            if not check_project_membership(cursor, project_id, assigned_to):
                return jsonify({"error": "Assigned user is not a project member"}), 400

        cursor.execute("""
            INSERT INTO tasks_table
            (title, description, status, priority, due_date, project_id, assigned_to, created_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (title, description, status, priority, due_date, project_id, assigned_to, user_id))

        conn.commit()

        return jsonify({
            "message": "Task created successfully",
            "task_id": cursor.lastrowid
        }), 201

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# get all tasks for a project

@task_bp.route("/projects/<int:project_id>/tasks", methods=["GET"])
@token_required
def get_project_tasks(project_id):
    user_id = request.user["user_id"]

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        if not check_project_membership(cursor, project_id, user_id):
            return jsonify({"error": "Access denied for this project"}), 403

        cursor.execute("""
            SELECT 
                t.id, t.title, t.description, t.status, t.priority,
                t.due_date, t.project_id, t.assigned_to, t.created_by, t.created_at,
                u.name AS assigned_to_name
            FROM tasks_table t
            LEFT JOIN users u ON t.assigned_to = u.id
            WHERE t.project_id = %s
            ORDER BY t.created_at DESC
        """, (project_id,))

        tasks = cursor.fetchall()
        return jsonify(tasks), 200

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# get one task by ID

@task_bp.route("/tasks/<int:task_id>", methods=["GET"])
@token_required
def get_task(task_id):
    user_id = request.user["user_id"]

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT t.*, u.name AS assigned_to_name
            FROM tasks_table t
            LEFT JOIN users u ON t.assigned_to = u.id
            WHERE t.id = %s
        """, (task_id,))

        task = cursor.fetchone()

        if not task:
            return jsonify({"error": "Task not found"}), 404

        if not check_project_membership(cursor, task["project_id"], user_id):
            return jsonify({"error": "Access denied"}), 403

        return jsonify(task), 200

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Update task (admins to edit everything & assigned user to update status only)

@task_bp.route("/tasks/<int:task_id>", methods=["PUT"])
@token_required
def update_task(task_id):
    data = request.json
    user_id = request.user["user_id"]
    user_role = request.user["role"]

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM tasks_table WHERE id = %s", (task_id,))
        task = cursor.fetchone()

        if not task:
            return jsonify({"error": "Task not found"}), 404

        if not check_project_membership(cursor, task["project_id"], user_id):
            return jsonify({"error": "Access denied"}), 403

        # admin can update all fields
        if user_role == "admin":
            title = data.get("title", task["title"])
            description = data.get("description", task["description"])
            status = data.get("status", task["status"])
            priority = data.get("priority", task["priority"])
            due_date = data.get("due_date", task["due_date"])
            assigned_to = data.get("assigned_to", task["assigned_to"])

            if assigned_to:
                cursor.execute("SELECT * FROM users WHERE id = %s", (assigned_to,))
                assignee = cursor.fetchone()
                if not assignee:
                    return jsonify({"error": "Assigned user not found"}), 404

                if not check_project_membership(cursor, task["project_id"], assigned_to):
                    return jsonify({"error": "Assigned user is not a project member"}), 400

            cursor.execute("""
                UPDATE tasks_table
                SET title = %s,
                    description = %s,
                    status = %s,
                    priority = %s,
                    due_date = %s,
                    assigned_to = %s
                WHERE id = %s
            """, (title, description, status, priority, due_date, assigned_to, task_id))

        # member can only change status if assigned to them
        else:
            if task["assigned_to"] != user_id:
                return jsonify({"error": "Only assigned user can update status"}), 403

            status = data.get("status")
            if not status:
                return jsonify({"error": "Status is required"}), 400

            cursor.execute("""
                UPDATE tasks_table
                SET status = %s
                WHERE id = %s
            """, (status, task_id))

        conn.commit()
        return jsonify({"message": "Task updated successfully"}), 200

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# delete task (only admin can delete)

@task_bp.route("/tasks/<int:task_id>", methods=["DELETE"])
@token_required
@role_required("admin")
def delete_task(task_id):
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM tasks_table WHERE id = %s", (task_id,))
        task = cursor.fetchone()

        if not task:
            return jsonify({"error": "Task not found"}), 404

        cursor.execute("DELETE FROM tasks_table WHERE id = %s", (task_id,))
        conn.commit()

        return jsonify({"message": "Task deleted successfully"}), 200

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# get my tasks (returns tasks assigned to the logged-in user)

@task_bp.route("/tasks/my-tasks", methods=["GET"])
@token_required
def get_my_tasks():
    user_id = request.user["user_id"]

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                t.id, t.title, t.description, t.status, t.priority,
                t.due_date, t.project_id, t.created_at,
                p.name AS project_name
            FROM tasks_table t
            JOIN projects p ON t.project_id = p.id
            WHERE t.assigned_to = %s
            ORDER BY t.due_date ASC
        """, (user_id,))

        tasks = cursor.fetchall()
        return jsonify(tasks), 200

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# get overdue tasks

@task_bp.route("/tasks/overdue", methods=["GET"])
@token_required
def get_overdue_tasks():
    user_id = request.user["user_id"]

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                t.id, t.title, t.description, t.status, t.priority,
                t.due_date, t.project_id, p.name AS project_name
            FROM tasks_table t
            JOIN projects p ON t.project_id = p.id
            WHERE t.due_date < CURDATE()
              AND t.status != 'done'
              AND EXISTS (
                  SELECT 1
                  FROM project_members pm
                  WHERE pm.project_id = t.project_id
                    AND pm.user_id = %s
              )
            ORDER BY t.due_date ASC
        """, (user_id,))

        tasks = cursor.fetchall()
        return jsonify(tasks), 200

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()