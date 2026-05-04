from flask import Blueprint, jsonify
from flask import request
from db import get_db_connection
from utils.decorators import token_required

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/dashboard/summary", methods=["GET"])
@token_required
def get_summary():
    user_id = request.user["user_id"]

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                COUNT(*) AS total_tasks,
                SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) AS completed_tasks,
                SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_tasks,
                SUM(CASE WHEN t.status = 'todo' THEN 1 ELSE 0 END) AS todo_tasks
            FROM tasks_table t
            WHERE EXISTS (
                SELECT 1 FROM project_members pm
                WHERE pm.project_id = t.project_id
                AND pm.user_id = %s
            )
        """, (user_id,))

        result = cursor.fetchone()
        return jsonify(result), 200

    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# overdue tasks
@dashboard_bp.route("/dashboard/overdue", methods=["GET"])
@token_required
def get_overdue():
    user_id = request.user["user_id"]

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                t.id, t.title, t.due_date, t.status,
                p.name AS project_name
            FROM tasks_table t
            JOIN projects p ON t.project_id = p.id
            WHERE t.due_date < CURDATE()
              AND t.status != 'done'
              AND EXISTS (
                  SELECT 1 FROM project_members pm
                  WHERE pm.project_id = t.project_id
                  AND pm.user_id = %s
              )
            ORDER BY t.due_date ASC
        """, (user_id,))

        tasks = cursor.fetchall()
        return jsonify(tasks), 200

    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# TASKS PER PROJECT (FOR CHARTS)
@dashboard_bp.route("/dashboard/project-stats", methods=["GET"])
@token_required
def project_stats():
    user_id = request.user["user_id"]

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                p.id,
                p.name,
                COUNT(t.id) AS total_tasks,
                SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) AS completed_tasks
            FROM projects p
            LEFT JOIN tasks_table t ON p.id = t.project_id
            JOIN project_members pm ON pm.project_id = p.id
            WHERE pm.user_id = %s
            GROUP BY p.id, p.name
        """, (user_id,))

        stats = cursor.fetchall()
        return jsonify(stats), 200

    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# my tasks summary

@dashboard_bp.route("/dashboard/my-tasks", methods=["GET"])
@token_required
def my_tasks_summary():
    user_id = request.user["user_id"]

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                COUNT(*) AS total,
                SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS completed,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress,
                SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) AS todo
            FROM tasks_table
            WHERE assigned_to = %s
        """, (user_id,))

        result = cursor.fetchone()
        return jsonify(result), 200

    finally:
        if cursor: cursor.close()
        if conn: conn.close()

