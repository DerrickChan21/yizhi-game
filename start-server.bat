@echo off
echo ========================================
echo   益智游戏 - 本地服务器启动器
echo ========================================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo [✓] Python已安装
    echo.
    echo 正在启动服务器...
    echo 请在浏览器访问: http://localhost:8000
    echo.
    echo 按 Ctrl+C 停止服务器
    echo.
    python -m http.server 8000
    goto :end
)

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo [✓] Node.js已安装
    echo.
    echo 正在启动服务器...
    echo 请在浏览器访问: http://localhost:8000
    echo.
    echo 按 Ctrl+C 停止服务器
    echo.
    npx http-server -p 8000
    goto :end
)

REM 都没有安装
echo [] 未找到Python或Node.js
echo.
echo 请安装以下任一软件:
echo   - Python: https://www.python.org/downloads/
echo   - Node.js: https://nodejs.org/
echo.
echo 或者直接双击 index.html 打开游戏(可能有些功能受限)
echo.
pause

:end
