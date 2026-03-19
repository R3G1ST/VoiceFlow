# VoiceFlow - Сборка клиента (Windows)
# Запустите от имени администратора

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VoiceFlow - Сборка клиента" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$envFile = "C:\Users\R3G1S\VoiceFlow\client\.env"

Write-Host "[1/5] Настройка .env..." -ForegroundColor Yellow
@"
VITE_API_URL=http://77.105.133.95:3000/api
VITE_WS_URL=ws://77.105.133.95:3001
"@ | Set-Content $envFile
Write-Host "✅ .env настроен" -ForegroundColor Green
Write-Host ""

Write-Host "[2/5] Установка зависимостей..." -ForegroundColor Yellow
Set-Location "C:\Users\R3G1S\VoiceFlow\client"
npm install
Write-Host "✅ Зависимости установлены" -ForegroundColor Green
Write-Host ""

Write-Host "[3/5] Сборка React..." -ForegroundColor Yellow
npm run build
Write-Host "✅ React собран" -ForegroundColor Green
Write-Host ""

Write-Host "[4/5] Сборка Electron..." -ForegroundColor Yellow
npm run electron:build
Write-Host "✅ Electron собран" -ForegroundColor Green
Write-Host ""

Write-Host "[5/5] Копирование на рабочий стол..." -ForegroundColor Yellow
$exeFile = Get-ChildItem "C:\Users\R3G1S\VoiceFlow\builds\*.exe" | Select-Object -First 1
if ($exeFile) {
    Copy-Item $exeFile.FullName "C:\Users\R3G1S\Desktop\" -Force
    Write-Host "✅ Файл скопирован на рабочий стол" -ForegroundColor Green
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ СБОРКА ЗАВЕРШЕНА!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Установщик:" -ForegroundColor Cyan
Write-Host "   C:\Users\R3G1S\Desktop\$($exeFile.Name)" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Веб-версия:" -ForegroundColor Cyan
Write-Host "   http://77.105.133.95:3000" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
