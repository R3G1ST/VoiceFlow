import customtkinter as ctk
from tkinter import messagebox
from api_client import api

class LoginWindow(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        # Настройки окна
        self.title("VoiceFlow - Вход")
        self.geometry("500x600")
        self.resizable(False, False)
        
        # Цветовая тема
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")
        
        # Переменные
        self.email_var = ctk.StringVar()
        self.password_var = ctk.StringVar()
        self.is_login_mode = True
        
        # Создание UI
        self.create_widgets()
        
    def create_widgets(self):
        """Создать элементы интерфейса"""
        
        # Заголовок
        self.title_label = ctk.CTkLabel(
            self,
            text="🎤 VoiceFlow",
            font=ctk.CTkFont(size=36, weight="bold")
        )
        self.title_label.pack(pady=40)
        
        # Подзаголовок
        self.subtitle_label = ctk.CTkLabel(
            self,
            text="Вход в аккаунт" if self.is_login_mode else "Регистрация",
            font=ctk.CTkFont(size=18)
        )
        self.subtitle_label.pack(pady=10)
        
        # Фрейм для полей ввода
        self.input_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.input_frame.pack(pady=20, padx=40, fill="x")
        
        # Email
        self.email_entry = ctk.CTkEntry(
            self.input_frame,
            textvariable=self.email_var,
            placeholder_text="Email",
            height=45,
            font=ctk.CTkFont(size=16)
        )
        self.email_entry.pack(pady=10, fill="x")
        
        # Username (только для регистрации)
        self.username_entry = ctk.CTkEntry(
            self.input_frame,
            placeholder_text="Имя пользователя",
            height=45,
            font=ctk.CTkFont(size=16)
        )
        
        # Password
        self.password_entry = ctk.CTkEntry(
            self.input_frame,
            textvariable=self.password_var,
            placeholder_text="Пароль",
            height=45,
            font=ctk.CTkFont(size=16),
            show="•"
        )
        self.password_entry.pack(pady=10, fill="x")
        
        # Кнопка входа/регистрации
        self.action_button = ctk.CTkButton(
            self.input_frame,
            text="Войти" if self.is_login_mode else "Зарегистрироваться",
            height=45,
            font=ctk.CTkFont(size=16, weight="bold"),
            command=self.on_action
        )
        self.action_button.pack(pady=20, fill="x")
        
        # Переключатель режим
        self.toggle_label = ctk.CTkLabel(
            self.input_frame,
            text="Нет аккаунта? Зарегистрироваться",
            font=ctk.CTkFont(size=14),
            text_color="#5865F2"
        )
        self.toggle_label.pack(pady=10)
        self.toggle_label.bind("<Button-1>", lambda e: self.toggle_mode())
        
        # Статус подключения
        self.status_label = ctk.CTkLabel(
            self,
            text="🔌 Подключение...",
            font=ctk.CTkFont(size=12),
            text_color="#96989d"
        )
        self.status_label.pack(pady=20)
        
        # Проверка подключения
        self.check_connection()
        
    def toggle_mode(self):
        """Переключить режим вход/регистрация"""
        self.is_login_mode = not self.is_login_mode
        
        if self.is_login_mode:
            self.subtitle_label.configure(text="Вход в аккаунт")
            self.action_button.configure(text="Войти")
            self.toggle_label.configure(text="Нет аккаунта? Зарегистрироваться")
            self.username_entry.pack_forget()
        else:
            self.subtitle_label.configure(text="Регистрация")
            self.action_button.configure(text="Зарегистрироваться")
            self.toggle_label.configure(text="Уже есть аккаунт? Войти")
            self.username_entry.pack(pady=10, fill="x", after=self.email_entry)
    
    def check_connection(self):
        """Проверить подключение к серверу"""
        try:
            connected = api.check_connection()
            if connected:
                self.status_label.configure(
                    text="✅ Сервер подключен",
                    text_color="#23a559"
                )
            else:
                self.status_label.configure(
                    text="❌ Сервер недоступен",
                    text_color="#da373c"
                )
        except Exception as e:
            self.status_label.configure(
                text=f"❌ Ошибка: {str(e)}",
                text_color="#da373c"
            )
    
    def on_action(self):
        """Обработка кнопки вход/регистрация"""
        email = self.email_var.get()
        password = self.password_var.get()
        
        if not email or not password:
            messagebox.showerror("Ошибка", "Заполните все поля")
            return
        
        try:
            if self.is_login_mode:
                # Вход
                result = api.login(email, password)
                api.set_token(result['accessToken'])
                
                messagebox.showinfo("Успех", f"Добро пожаловать, {result['user']['username']}!")
                self.open_main_window()
            else:
                # Регистрация
                username = self.username_entry.get()
                if not username:
                    messagebox.showerror("Ошибка", "Введите имя пользователя")
                    return
                
                result = api.register(email, username, password)
                api.set_token(result['accessToken'])
                
                messagebox.showinfo("Успех", f"Аккаунт создан! Добро пожаловать, {username}!")
                self.open_main_window()
                
        except Exception as e:
            error_msg = str(e)
            if "400" in error_msg:
                messagebox.showerror("Ошибка", "Неверный email или пароль")
            elif "409" in error_msg:
                messagebox.showerror("Ошибка", "Пользователь уже существует")
            else:
                messagebox.showerror("Ошибка", f"Произошла ошибка: {error_msg}")
    
    def open_main_window(self):
        """Открыть главное окно"""
        self.withdraw()
        from main_window import MainWindow
        main = MainWindow()
        main.protocol("WM_DELETE_WINDOW", lambda: self.on_close(main))
        main.mainloop()
    
    def on_close(self, main_window):
        """Закрытие приложения"""
        main_window.destroy()
        self.destroy()


def run_login_window():
    """Запустить окно входа"""
    app = LoginWindow()
    app.mainloop()


if __name__ == "__main__":
    run_login_window()
