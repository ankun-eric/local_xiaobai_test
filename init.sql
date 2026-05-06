CREATE DATABASE IF NOT EXISTS taskdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE taskdb;

CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL COMMENT '任务标题',
    description TEXT COMMENT '任务描述',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级: critical/high/medium/low',
    status VARCHAR(20) DEFAULT 'todo' COMMENT '状态: todo/in_progress/review/done',
    category VARCHAR(50) DEFAULT 'personal' COMMENT '分类: work/personal/study/health/finance',
    due_date DATETIME NULL COMMENT '截止日期',
    estimated_hours FLOAT NULL COMMENT '预计耗时(小时)',
    tags JSON NULL COMMENT '标签列表',
    progress INT DEFAULT 0 COMMENT '进度 0-100',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_category (category),
    INDEX idx_due_date (due_date),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务表';
