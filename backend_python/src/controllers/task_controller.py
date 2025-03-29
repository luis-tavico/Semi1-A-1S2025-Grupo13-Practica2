from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from models.task_model import Task
from models.user_model import User
from config.database import db
from middleware.auth_middleware import auth_required

@auth_required
def create_task():
    print("create_task")
    try:
        data = request.get_json() if request.is_json else request.form
        title = data.get("title")
        description = data.get("description")
        creation_date = data.get("creation_date")
        
        user_id = get_jwt_identity()
        
        new_task = Task(
            title=title,
            description=description,
            user_id=user_id,
            creation_date=creation_date
        )
        db.session.add(new_task)
        db.session.commit()
        
        return jsonify({"message": "Tarea creada exitosamente."}), 201
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
        task = Task.query.get(task_id)
        
        if not task:
            return jsonify({"message": "Tarea no encontrada"}), 404
            
        return jsonify(task.to_dict()), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@auth_required
def update_task(task_id):
    try:
        data = request.get_json() if request.is_json else request.form
        title = data.get("title")
        description = data.get("description")
        creation_date = data.get("creation_date")
        
        task = Task.query.get(task_id)
        
        if not task:
            return jsonify({"message": "Tarea no encontrada"}), 404

        if title:
            task.title = title
        if description:
            task.description = description
        if creation_date:
            task.creation_date = creation_date

        db.session.commit()
        
        return jsonify({"message": "Tarea actualizada exitosamente."}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@auth_required
def update_state_task(task_id):
    try:
        data = request.get_json() if request.is_json else request.form
        completed = data.get("completed")
        
        task = Task.query.get(task_id)
        
        if not task:
            return jsonify({"message": "Tarea no encontrada"}), 404

        # Handle different types of input for completed
        if isinstance(completed, str):
            task.completed = completed.lower() == 'true'
        elif completed is not None:
            task.completed = bool(completed)
        else:
            task.completed = not task.completed

        db.session.commit()
        
        return jsonify({"message": "Tarea actualizada exitosamente."}), 200
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
        
        return jsonify({"message": "Tarea eliminada exitosamente."}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500