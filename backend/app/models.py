from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Float
from app.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False, comment="任务标题")
    description = Column(Text, nullable=True, comment="任务描述")
    priority = Column(String(20), default="medium", comment="优先级: critical/high/medium/low")
    status = Column(String(20), default="todo", comment="状态: todo/in_progress/review/done")
    category = Column(String(50), default="personal", comment="分类: work/personal/study/health/finance")
    due_date = Column(DateTime, nullable=True, comment="截止日期")
    estimated_hours = Column(Float, nullable=True, comment="预计耗时(小时)")
    tags = Column(JSON, nullable=True, comment="标签列表")
    progress = Column(Integer, default=0, comment="进度 0-100")
    created_at = Column(DateTime, default=datetime.utcnow, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "priority": self.priority,
            "status": self.status,
            "category": self.category,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "estimated_hours": self.estimated_hours,
            "tags": self.tags or [],
            "progress": self.progress,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
