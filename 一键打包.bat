@echo off
echo ========================================
echo   益智游戏 - 一键打包工具
echo ========================================
echo.
echo 正在打包最新文件...
echo.

:: 删除旧ZIP
if exist yizhi-game-latest.zip (
    del yizhi-game-latest.zip
)

:: 打包所有需要上传的文件
powershell -Command "Compress-Archive -Path ^
    index.html, ^
    game.html, ^
    parent.html, ^
    game-standalone.html, ^
    css\main.css, ^
    css\components.css, ^
    css\game.css, ^
    css\parent.css, ^
    js\storage.js, ^
    js\audio.js, ^
    js\ui.js, ^
    js\app.js, ^
    js\game.js, ^
    js\parent.js, ^
    data\badges.json, ^
    data\questions\color\*, ^
    data\questions\shape\*, ^
    data\questions\number\*, ^
    audio\* ^
    -DestinationPath yizhi-game-latest.zip -Force"

echo.
echo 打包完成!
echo 文件位置: yizhi-game-latest.zip
echo.
echo ========================================
echo   上传步骤:
echo ========================================
echo.
echo 1. 打开 CloudBase 文件管理
echo 2. 删除旧文件(如果需要)
echo 3. 上传 yizhi-game-latest.zip
echo 4. 解压到根目录
echo 5. 完成!
echo.
echo ========================================
echo   本次修改内容:
echo ========================================
echo.
echo ✅ 倒计时功能
echo    - 5/10/15分钟快速选择
echo    - 首页倒计时显示
echo    - 休息提醒弹窗
echo.
echo ✅ 徽章系统(核心)
echo    - 25个徽章设计
echo    - 满星获得徽章
echo    - 首页显示最近徽章
echo    - 获得时全屏庆祝
echo.
echo ========================================
pause
