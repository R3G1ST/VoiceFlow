@echo off
chcp 65001 >nul
echo ========================================
echo   VoiceFlow - Отправка на GitHub
echo ========================================
echo.

cd C:\Users\R3G1S\VoiceFlow

echo [1/4] Добавление всех файлов...
git add .

echo [2/4] Первый коммит...
git commit -m "Initial commit: VoiceFlow - TeamSpeak quality + Discord design"

echo [3/4] Переименование ветки в main...
git branch -M main

echo [4/4] Отправка на GitHub...
echo.
echo Введите ваш GitHub username:
set /p USERNAME=
git remote add origin https://github.com/%USERNAME%/VoiceFlow.git
git push -u origin main

echo.
echo ========================================
echo   ГОТОВО!
echo ========================================
echo.
echo Ваш проект на GitHub:
echo https://github.com/%USERNAME%/VoiceFlow
echo.
pause
