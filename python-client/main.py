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

# Запускаем окно входа
from login_window import run_login_window

if __name__ == "__main__":
    print("🚀 Запуск VoiceFlow...")
    print("📡 Подключение к серверу 77.105.133.95:3000")
    print("")
    
    try:
        run_login_window()
    except KeyboardInterrupt:
        print("\n👋 Завершение работы...")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Критическая ошибка: {e}")
        import traceback
        traceback.print_exc()
        input("\nНажмите Enter для выхода...")
        sys.exit(1)
