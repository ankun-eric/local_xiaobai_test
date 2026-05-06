import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.models import Task

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def sample_task():
    db = SessionLocal()
    task = Task(
        title="测试任务",
        description="这是一个测试任务",
        priority="high",
        status="todo",
        category="work",
        tags=["测试", "重要"],
        progress=0,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    task_id = task.id
    db.close()
    return task_id


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_create_task():
    response = client.post("/api/tasks", json={
        "title": "新任务",
        "description": "任务描述",
        "priority": "high",
        "status": "todo",
        "category": "work",
        "tags": ["标签1"],
        "progress": 20,
    })
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "新任务"
    assert data["priority"] == "high"
    assert data["progress"] == 20
    assert "id" in data


def test_create_task_invalid_priority():
    response = client.post("/api/tasks", json={
        "title": "无效优先级",
        "priority": "invalid",
    })
    assert response.status_code == 422


def test_get_tasks(sample_task):
    response = client.get("/api/tasks")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert len(data["tasks"]) >= 1


def test_get_tasks_with_filter(sample_task):
    response = client.get("/api/tasks?status=todo")
    assert response.status_code == 200
    data = response.json()
    for task in data["tasks"]:
        assert task["status"] == "todo"


def test_get_tasks_with_search(sample_task):
    response = client.get("/api/tasks?search=测试任务")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1


def test_get_task_by_id(sample_task):
    response = client.get(f"/api/tasks/{sample_task}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_task
    assert data["title"] == "测试任务"


def test_get_task_not_found():
    response = client.get("/api/tasks/99999")
    assert response.status_code == 404
    assert response.json()["detail"] == "任务不存在"


def test_update_task(sample_task):
    response = client.put(f"/api/tasks/{sample_task}", json={
        "title": "已更新任务",
        "progress": 50,
        "status": "in_progress",
    })
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "已更新任务"
    assert data["progress"] == 50
    assert data["status"] == "in_progress"


def test_update_task_not_found():
    response = client.put("/api/tasks/99999", json={"title": "不存在"})
    assert response.status_code == 404


def test_delete_task(sample_task):
    response = client.delete(f"/api/tasks/{sample_task}")
    assert response.status_code == 204

    response = client.get(f"/api/tasks/{sample_task}")
    assert response.status_code == 404


def test_delete_task_not_found():
    response = client.delete("/api/tasks/99999")
    assert response.status_code == 404


def test_get_stats(sample_task):
    response = client.get("/api/tasks/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "todo" in data
    assert "in_progress" in data
    assert "done" in data
    assert "overdue" in data


def test_pagination():
    for i in range(5):
        client.post("/api/tasks", json={"title": f"分页任务{i}"})

    response = client.get("/api/tasks?page=1&page_size=3")
    assert response.status_code == 200
    data = response.json()
    assert data["page"] == 1
    assert data["page_size"] == 3
    assert len(data["tasks"]) <= 3
