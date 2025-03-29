from config.database import db
from datetime import datetime

class File(db.Model):
    __tablename__ = 'files'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    file_name = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(100), nullable=False)
    file_url = db.Column(db.Text, nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

    def __init__(self, file_name, file_type, file_url, user_id):
        self.file_name = file_name
        self.file_type = file_type
        self.file_url = file_url
        self.user_id = user_id
    
    def to_dict(self):
        return {
            'id': self.id,
            'file_name': self.file_name,
            'file_type': self.file_type,
            'file_url': self.file_url,
            'upload_date': self.upload_date.isoformat() if self.upload_date else None,
            'user_id': self.user_id
        }