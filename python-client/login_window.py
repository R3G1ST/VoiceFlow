import customtkinter as ctk
from tkinter import messagebox
from api_client import api
import json
import os

class LoginWindow(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        # Настройки
        self.title("VoiceFlow - Вход")
        self.geometry("500x650")
        self.resizable(False, False)
        self.center_window()
        
        # Тема
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")
        
        # Переменные
        self.is_login_mode = True
        
        # Создание UI
        self.create_widgets()
    
    def center_window(self):
        self.update_idletasks()
        width = self.winfo_width()
        height = self.winfo_height()
        x = (self.winfo_screenwidth() // 2) - (width // 2)
        y = (self.winfo_screenheight() // 2) - (height // 2)
        self.geometry(f'{width}x{height}+{x}+{y}')
    
    def create_widgets(self):
        # Заголовок
        self.title_label = ctk.CTkLabel(
            self,
            text="🎤 VoiceFlow",
            font=ctk.CTkFont(size=32, weight="bold")
        )
        self.title_label.pack(pady=30)
        
        # Подзаголовок
        self.subtitle_label = ctk.CTkLabel(
            self,
            text="Вход",
            font=ctk.CTkFont(size=20)
        )
        self.subtitle_label.pack(pady=10)
        
        # Фрейм для полей
        self.input_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.input_frame.pack(pady=20, padx=40, fill="x")
        
        # Email
        self.email_label = ctk.CTkLabel(
            self.input_frame,
            text="EMAIL *",
            font=ctk.CTkFont(size=12, weight="bold"),
            text_color="#b9bbbe"
        )
        self.email_label.pack(anchor="w")
        
        self.email_entry = ctk.CTkEntry(
            self.input_frame,
            placeholder_text="test@test.com",
            height=40,
            font=ctk.CTkFont(size=14)
        )
        self.email_entry.pack(pady=8, fill="x")
        
        # Password
        self.password_label = ctk.CTkLabel(
            self.input_frame,
            text="ПАРОЛЬ *",
            font=ctk.CTkFont(size=12, weight="bold"),
            text_color="#b9bbbe"
        )
        self.password_label.pack(anchor="w")
        
        self.password_entry = ctk.CTkEntry(
            self.input_frame,
            placeholder_text="password123",
            height=40,
            font=ctk.CTkFont(size=14),
            show="•"
        )
        self.password_entry.pack(pady=8, fill="x")
        
        # Кнопка
        self.action_button = ctk.CTkButton(
            self.input_frame,
            text="Войти",
            height=44,
            font=ctk.CTkFont(size=16, weight="bold"),
            fg_color="#5865F2",
            hover_color="#4752C4",
            command=self.on_action
        )
        self.action_button.pack(pady=20, fill="x")
        
        # Статус
        self.status_label = ctk.CTkLabel(
            self,
            text="✅ Введите данные для входа",
            font=ctk.CTkFont(size=12),
            text_color="#43b581"
        )
        self.status_label.pack(pady=20)
    
    def on_action(self):
        """Обработка кнопки"""
        # Получаем данные напрямую из Entry
        email = self.email_entry.get().strip()
        password = self.password_entry.get().strip()
        
        print(f"\n{'='*50}")
        print(f"📝 Login attempt:")
        print(f"   Email: '{email}' (length: {len(email)})")
        print(f"   Password: '{'*' * len(password)}' (length: {len(password)})")
        print(f"{'='*50}\n")
        
        # Проверка
        if not email:
            messagebox.showerror("Ошибка", "❌ Введите EMAIL")
            self.email_entry.focus()
            return
        
        if not password:
            messagebox.showerror("Ошибка", "❌ Введите ПАРОЛЬ")
            self.password_entry.focus()
            return
        
        if '@' not in email:
            messagebox.showerror("Ошибка", "❌ Email должен содержать '@'")
            return
        
        try:
            print(f"🔌 Connecting to API...")
            print(f"📡 Sending login request...")
            
            result = api.login(email, password)
            print(f"✅ Login successful: {result['user']['username']}")
            
            api.set_token(result['accessToken'])
            
            # Сохраняем email
            self.save_email(email)
            
            messagebox.showinfo("Успех", f"✅ С возвращением, {result['user']['username']}!")
            self.open_main_window()
            
        except Exception as e:
            error_msg = str(e)
            print(f"❌ Error: {error_msg}")
            
            if "400" in error_msg or "401" in error_msg:
                messagebox.showerror("Ошибка", "❌ Неверный email или пароль")
            elif "409" in error_msg:
                messagebox.showerror("Ошибка", "❌ Пользователь уже существует")
            elif "Connection" in error_msg or "refused" in error_msg.lower():
                messagebox.showerror("Ошибка", "❌ Не удалось подключиться к серверу")
            else:
                messagebox.showerror("Ошибка", f"❌ {error_msg}")
    
    def save_email(self, email):
        """Сохранить email"""
        try:
            with open("voiceflow_config.json", 'w') as f:
                json.dump({'email': email}, f)
            print(f"✅ Saved email: {email}")
        except Exception as e:
            print(f"⚠️ Could not save email: {e}")
    
    def open_main_window(self):
        print(f"🚀 Opening main window...")
        self.withdraw()
        from main_window import MainWindow
        main = MainWindow()
        main.protocol("WM_DELETE_WINDOW", lambda: self.on_close(main))
        main.mainloop()
    
    def on_close(self, main_window):
        main_window.destroy()
        self.destroy()


def run_login_window():
    app = LoginWindow()
    app.mainloop()


if __name__ == "__main__":
    run_login_window()
