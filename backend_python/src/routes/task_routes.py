from flask import Blueprint
from controllers.task_controller import (
    create_task,
    get_tasks_by_user,
    get_task_by_id,
    update_task,
    update_state_task,
    delete_task
)

task_bp = Blueprint("task_bp", __name__)

task_bp.route("/", methods=["POST"])(create_task)
task_bp.route("/", methods=["GET"])(get_tasks_by_user)
task_bp.route("/<int:task_id>", methods=["GET"])(get_task_by_id)
task_bp.route("/<int:task_id>", methods=["PUT"])(update_task)
task_bp.route("/state/<int:task_id>", methods=["PUT"])(update_state_task)
task_bp.route("/<int:task_id>", methods=["DELETE"])(delete_task)