@echo off
REM ====================================================
REM  个人任务管理系统 - Windows 一键部署脚本
REM  请在能访问服务器的主机上执行
REM ====================================================

set SERVER=newbb.test.bangbangvip.com
set SSH_USER=ubuntu
set SSH_PASS=Newbang888
set DEPLOY_ID=a46094c5-4cff-434b-a815-3e73fc6d39a6
REM 请在下方填入您的 GitHub Token 和用户名（也可通过环境变量传入）
REM 如果不设置，将使用公开仓库方式访问
if "%GIT_TOKEN%"=="" set GIT_TOKEN=YOUR_GITHUB_TOKEN_HERE
if "%GIT_USER%"=="" set GIT_USER=ankun-eric

echo ============================================
echo  个人任务管理系统 - 部署开始
echo ============================================

echo.
echo [步骤1] 连接服务器并执行部署脚本...
echo.

REM 使用 sshpass 执行远程部署命令
REM 如果 sshpass 未安装，请先安装：
REM  - Ubuntu: sudo apt install sshpass
REM  - Windows: choco install sshpass 或下载 putty/plink

sshpass -p "%SSH_PASS%" ssh -o StrictHostKeyChecking=no %SSH_USER%@%SERVER% "GIT_TOKEN=%GIT_TOKEN% GIT_USER=%GIT_USER% bash /home/ubuntu/noob_test/deploy.sh" 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [提示] sshpass 未安装或执行失败。
    echo 请手动执行以下步骤：
    echo.
    echo 1. SSH 登录到服务器：
    echo    ssh ubuntu@%SERVER%
    echo    密码: %SSH_PASS%
    echo.
    echo 2. 在服务器上执行部署脚本：
    echo    export GIT_TOKEN="%GIT_TOKEN%"
    echo    export GIT_USER="%GIT_USER%"
    echo    bash /home/ubuntu/noob_test/deploy.sh
    echo.
    echo 如果项目目录不存在，请先手动克隆：
    echo    git clone https://github.com/ankun-eric/local_xiaobai_test.git /home/ubuntu/noob_test
    echo    cd /home/ubuntu/noob_test
    echo    bash deploy.sh
)

echo.
echo [步骤2] 配置 Gateway Nginx...
echo.
echo 请将以下配置添加到服务器 gateway nginx 的 server 块中：
echo.
echo   location /autodev/%DEPLOY_ID%/ {
echo       proxy_pass http://127.0.0.1:3000/autodev/%DEPLOY_ID%/;
echo       proxy_set_header Host $host;
echo       proxy_set_header X-Real-IP $remote_addr;
echo       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
echo       proxy_set_header X-Forwarded-Proto $scheme;
echo       proxy_http_version 1.1;
echo       proxy_set_header Upgrade $http_upgrade;
echo       proxy_set_header Connection "upgrade";
echo   }
echo.
echo   location /autodev/%DEPLOY_ID%/api/ {
echo       proxy_pass http://127.0.0.1:8000/api/;
echo       proxy_set_header Host $host;
echo       proxy_set_header X-Real-IP $remote_addr;
echo       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
echo       proxy_set_header X-Forwarded-Proto $scheme;
echo   }
echo.
echo   然后重载 nginx: sudo nginx -s reload
echo.

echo ============================================
echo  部署完成！
echo  前端地址: http://%SERVER%/autodev/%DEPLOY_ID%/
echo  API地址:  http://%SERVER%/autodev/%DEPLOY_ID%/api/
echo ============================================

pause
