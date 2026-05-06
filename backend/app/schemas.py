from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="任务标题")
    description: Optional[str] = Field(None, description="任务描述")
    priority: Optional[str] = Field("medium", pattern="^(critical|high|medium|low)$", description="优先级")
    status: Optional[str] = Field("todo", pattern="^(todo|in_progress|review|done)$", description="状态")
    category: Optional[str] = Field("personal", pattern="^(work|personal|study|health|finance)$", description="分类")
    due_date: Optional[str] = Field(None, description="截止日期 ISO格式")
    estimated_hours: Optional[float] = Field(None, ge=0, description="预计耗时")
    tags: Optional[List[str]] = Field(default=[], description="标签列表")
    progress: Optional[int] = Field(0, ge=0, le=100, description="进度")


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255, description="任务标题")
    description: Optional[str] = Field(None, description="任务描述")
    priority: Optional[str] = Field(None, pattern="^(critical|high|medium|low)$", description="优先级")
    status: Optional[str] = Field(None, pattern="^(todo|in_progress|review|done)$", description="状态")
    category: Optional[str] = Field(None, pattern="^(work|personal|study|health|finance)$", description="分类")
    due_date: Optional[str] = Field(None, description="截止日期 ISO格式")
    estimated_hours: Optional[float] = Field(None, ge=0, description="预计耗时")
    tags: Optional[List[str]] = Field(None, description="标签列表")
    progress: Optional[int] = Field(None, ge=0, le=100, description="进度")


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    priority: str
    status: str
    category: str
    due_date: Optional[str] = None
    estimated_hours: Optional[float] = None
    tags: List[str] = []
    progress: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class TaskStats(BaseModel):
    total: int
    todo: int
    in_progress: int
    review: int
    done: int
    overdue: int


class TaskListResponse(BaseModel):
    tasks: List[TaskResponse]
    total: int
    page: int
    page_size: int
