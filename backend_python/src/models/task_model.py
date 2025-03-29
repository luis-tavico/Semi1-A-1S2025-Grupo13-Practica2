from config.database import db
from datetime import datetime

class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    creation_date = db.Column(db.DateTime, default=datetime.utcnow)
    completed = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    def __init__(self, title, description, user_id, creation_date=None, completed=False):
        self.title = title
        self.description = description
        self.user_id = user_id
        self.creation_date = creation_date or datetime.utcnow()
        self.completed = completed
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'creation_date': self.creation_date.isoformat() if self.creation_date else None,
            'completed': self.completed,
            'user_id': self.user_id
        }