#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
VoiceFlow - Python Desktop Client
Discord-like voice chat application
"""

import sys
import os

# Добавляем текущую папку в path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("🚀 Запуск VoiceFlow...")
print("📡 Подключение к серверу 77.105.133.95:3000")
print("")

try:
    # Запускаем окно загрузки
    from loading_window import run_loading_window
    run_loading_window()
    
except KeyboardInterrupt:
    print("\n👋 Завершение работы...")
    sys.exit(0)
except Exception as e:
    print(f"❌ Критическая ошибка: {e}")
    import traceback
    traceback.print_exc()
    input("\nНажмите Enter для выхода...")
    sys.exit(1)
