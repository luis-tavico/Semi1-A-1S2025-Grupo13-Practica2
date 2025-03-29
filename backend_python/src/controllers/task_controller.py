from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from models.task_model import Task
from models.user_model import User
from config.database import db
from middleware.auth_middleware import auth_required

@auth_required
def create_task():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        new_task = Task(
            title=data.get("title"),
            description=data.get("description"),
            user_id=user_id
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify({"message": "Tarea creada exitosamente", "task": new_task.to_dict()}), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@auth_required
def get_tasks_by_user():
    try:
        user_id = get_jwt_identity()
        tasks = Task.query.filter_by(user_id=user_id).all()
        user = User.query.get(user_id)

        if not user:
            return jsonify({"message": "Usuario no encontrado"}), 404

        return jsonify({
            "tasks": [task.to_dict() for task in tasks], 
            "user": user.to_dict()
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@auth_required
def get_task_by_id(task_id):
    try:
        user_id = get_jwt_identity()
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()
        
        if not task:
            return jsonify({"message": "Tarea no encontrada"}), 404
            
        return jsonify(task.to_dict()), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@auth_required
def update_task(task_id):
    try:
        user_id = get_jwt_identity()
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()
        
        if not task:
            return jsonify({"message": "Tarea no encontrada"}), 404

        data = request.get_json()
        if 'title' in data:
            task.title = data.get("title")
        if 'description' in data:
            task.description = data.get("description")

        db.session.commit()
        return jsonify({"message": "Tarea actualizada exitosamente", "task": task.to_dict()}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@auth_required
def update_state_task(task_id):
    try:
        user_id = get_jwt_identity()
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()
        
        if not task:
            return jsonify({"message": "Tarea no encontrada"}), 404

        data = request.get_json()
        task.completed = data.get("completed", not task.completed)

        db.session.commit()
        return jsonify({"message": "Estado de tarea actualizado exitosamente", "task": task.to_dict()}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@auth_required
def delete_task(task_id):
    try:
        user_id = get_jwt_identity()
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()

        if not task:
            return jsonify({"message": "Tarea no encontrada"}), 404

        db.session.delete(task)
        db.session.commit()
        return jsonify({"message": "Tarea eliminada exitosamente"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500