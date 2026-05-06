from typing import Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Task
from app.schemas import TaskCreate, TaskUpdate, TaskResponse, TaskStats, TaskListResponse

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("/stats", response_model=TaskStats)
def get_stats(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    total = db.query(func.count(Task.id)).scalar()
    todo = db.query(func.count(Task.id)).filter(Task.status == "todo").scalar()
    in_progress = db.query(func.count(Task.id)).filter(Task.status == "in_progress").scalar()
    review = db.query(func.count(Task.id)).filter(Task.status == "review").scalar()
    done = db.query(func.count(Task.id)).filter(Task.status == "done").scalar()
    overdue = db.query(func.count(Task.id)).filter(
        Task.due_date < now,
        Task.status != "done"
    ).scalar()

    return TaskStats(
        total=total,
        todo=todo,
        in_progress=in_progress,
        review=review,
        done=done,
        overdue=overdue,
    )


@router.get("", response_model=TaskListResponse)
def get_tasks(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None, pattern="^(todo|in_progress|review|done)$"),
    priority: Optional[str] = Query(None, pattern="^(critical|high|medium|low)$"),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("created_at", pattern="^(created_at|due_date|priority|title)$"),
    sort_order: Optional[str] = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    query = db.query(Task)

    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if category:
        query = query.filter(Task.category == category)
    if search:
        query = query.filter(
            Task.title.contains(search) | Task.description.contains(search)
        )

    sort_column = getattr(Task, sort_by)
    if sort_order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    total = query.count()
    offset = (page - 1) * page_size
    tasks = query.offset(offset).limit(page_size).all()

    return TaskListResponse(
        tasks=[TaskResponse.model_validate(t.to_dict()) for t in tasks],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return TaskResponse.model_validate(task.to_dict())


@router.post("", response_model=TaskResponse, status_code=201)
def create_task(task_data: TaskCreate, db: Session = Depends(get_db)):
    task = Task(
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        status=task_data.status,
        category=task_data.category,
        due_date=datetime.fromisoformat(task_data.due_date) if task_data.due_date else None,
        estimated_hours=task_data.estimated_hours,
        tags=task_data.tags,
        progress=task_data.progress,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return TaskResponse.model_validate(task.to_dict())


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_data: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")

    update_dict = task_data.model_dump(exclude_unset=True)
    if "due_date" in update_dict and update_dict["due_date"] is not None:
        update_dict["due_date"] = datetime.fromisoformat(update_dict["due_date"])

    for key, value in update_dict.items():
        setattr(task, key, value)

    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return TaskResponse.model_validate(task.to_dict())


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    db.delete(task)
    db.commit()
    return None
