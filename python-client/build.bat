@echo off
chcp 65001 >nul
echo ========================================
echo   VoiceFlow - Сборка в EXE
echo ========================================
echo.

REM Проверка Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python не найден!
    pause
    exit /b 1
)

echo ✅ Python найден
echo.

REM Установка pyinstaller
echo 📦 Установка PyInstaller...
pip install pyinstaller >nul 2>&1
echo ✅ PyInstaller установлен
echo.

REM Сборка
echo 🔨 Сборка приложения...
pyinstaller --onefile --windowed --name "VoiceFlow" --icon="assets/icon.ico" main.py 2>nul
if errorlevel 1 (
    echo Пробуем без иконки...
    pyinstaller --onefile --windowed --name "VoiceFlow" main.py
)

echo.
echo ========================================
if exist "dist\VoiceFlow.exe" (
    echo ✅ СБОРКА ЗАВЕРШЕНА!
    echo.
    echo Файл: dist\VoiceFlow.exe
    echo.
    echo Хотите открыть папку с файлом?
    set /p OPEN="Открыть (y/n): "
    if /i "%OPEN%"=="y" explorer dist
) else (
    echo ❌ ОШИБКА СБОРКИ!
    echo Проверьте логи выше.
)
echo ========================================
echo.
pause
