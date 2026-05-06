#!/bin/bash
set -e

PROJECT_DIR="/home/ubuntu/noob_test"
DEPLOY_ID="a46094c5-4cff-434b-a815-3e73fc6d39a6"
REPO_URL="https://github.com/ankun-eric/local_xiaobai_test.git"

echo "=== 个人任务管理系统 部署脚本 ==="

if [ -d "$PROJECT_DIR" ]; then
    echo "项目目录已存在，更新代码..."
    cd "$PROJECT_DIR"
    git pull origin main || true
else
    echo "克隆项目..."
    git clone "$REPO_URL" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi

echo "停止旧容器..."
docker-compose down || true

echo "构建并启动服务..."
docker-compose up -d --build

echo "等待服务就绪..."
sleep 10

echo "检查服务状态..."
docker-compose ps

echo ""
echo "=== 部署完成 ==="
echo "前端地址: http://newbb.test.bangbangvip.com/autodev/${DEPLOY_ID}/"
echo "API地址:   http://newbb.test.bangbangvip.com/autodev/${DEPLOY_ID}/api/"
echo ""
echo "请确保 gateway nginx 已配置好对应的 location 规则（参见 nginx-gateway.conf）"
