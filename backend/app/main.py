from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import tasks
from app.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="个人任务管理系统", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "个人任务管理系统运行正常"}
