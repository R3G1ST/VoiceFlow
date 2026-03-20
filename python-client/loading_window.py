import customtkinter as ctk
from tkinter import messagebox
from api_client import api

class SimpleLoadingWindow(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        # Настройки
        self.title("VoiceFlow")
        self.geometry("500x400")
        self.resizable(False, False)
        self.center_window()
        
        # Тема
        ctk.set_appearance_mode("dark")
        
        # Переменные
        self.progress_var = ctk.DoubleVar(value=0)
        self.marquee_text = "Загрузка VoiceFlow... • TeamSpeak качество • Discord удобство • Подключение к серверу... • "
        self.marquee_index = 0
        
        # UI
        self.create_simple_ui()
        
        # Запуск
        self.after(100, self.start_loading)
        self.animate_marquee()
    
    def center_window(self):
        self.update_idletasks()
        width = self.winfo_width()
        height = self.winfo_height()
        x = (self.winfo_screenwidth() // 2) - (width // 2)
        y = (self.winfo_screenheight() // 2) - (height // 2)
        self.geometry(f'{width}x{height}+{x}+{y}')
    
    def create_simple_ui(self):
        # Главный фрейм
        self.main_frame = ctk.CTkFrame(self, fg_color="#0f0f12")
        self.main_frame.pack(fill="both", expand=True)
        
        # НАЗВАНИЕ СВЕРХУ ПО ЦЕНТРУ
        self.title_label = ctk.CTkLabel(
            self.main_frame,
            text="VoiceFlow",
            font=ctk.CTkFont(size=36, weight="bold"),
            text_color="white"
        )
        self.title_label.pack(pady=40)
        
        # Подзаголовок
        self.subtitle_label = ctk.CTkLabel(
            self.main_frame,
            text="Добро пожаловать",
            font=ctk.CTkFont(size=16),
            text_color="#72767d"
        )
        self.subtitle_label.pack(pady=10)
        
        # Прогресс бар (по центру)
        self.progress_frame = ctk.CTkFrame(self.main_frame, fg_color="transparent")
        self.progress_frame.pack(pady=60, padx=60, fill="x")
        
        self.progress_bar = ctk.CTkProgressBar(
            self.progress_frame,
            variable=self.progress_var,
            height=6,
            corner_radius=3,
            fg_color="#1e1f22",
            progress_color="#5865F2"
        )
        self.progress_bar.pack(fill="x")
        
        self.status_label = ctk.CTkLabel(
            self.progress_frame,
            text="Инициализация...",
            font=ctk.CTkFont(size=13),
            text_color="#b9bbbe"
        )
        self.status_label.pack(pady=10)
        
        # БЕГУЩАЯ СТРОКА СНИЗУ
        self.marquee_frame = ctk.CTkFrame(self.main_frame, fg_color="transparent")
        self.marquee_frame.pack(side="bottom", pady=20, fill="x")
        
        self.marquee_label = ctk.CTkLabel(
            self.marquee_frame,
            text=self.marquee_text,
            font=ctk.CTkFont(size=12),
            text_color="#5865F2"
        )
        self.marquee_label.pack()
        
        # Статус подключения
        self.connection_label = ctk.CTkLabel(
            self.main_frame,
            text="🔌 Подключение к серверу...",
            font=ctk.CTkFont(size=11),
            text_color="#72767d"
        )
        self.connection_label.pack(pady=5, side="bottom")
    
    def animate_marquee(self):
        # Простая анимация бегущей строки (смена текста)
        texts = [
            "Загрузка VoiceFlow... • TeamSpeak качество • Discord удобство •",
            "Подключение к API... • Синхронизация данных... • Подготовка серверов... •",
            "Загрузка профиля... • Проверка каналов... • Голосовая связь... •",
            "Почти готово... • Ожидание пользователя... • Добро пожаловать! •"
        ]
        
        self.marquee_label.configure(text=texts[self.marquee_index % len(texts)])
        self.marquee_index += 1
        
        self.after(2000, self.animate_marquee)
    
    def start_loading(self):
        self.check_connection()
    
    def check_connection(self):
        try:
            connected = api.check_connection()
            if connected:
                self.connection_label.configure(
                    text="✅ Сервер подключен",
                    text_color="#43b581"
                )
                self.start_progress_animation()
            else:
                self.connection_label.configure(
                    text="❌ Сервер недоступен",
                    text_color="#f04747"
                )
                messagebox.showerror("Ошибка", "Сервер недоступен!")
                self.destroy()
        except Exception as e:
            self.connection_label.configure(
                text=f"❌ {str(e)}",
                text_color="#f04747"
            )
    
    def start_progress_animation(self):
        self.progress_var.set(0)
        
        steps = [
            (0, "Инициализация..."),
            (20, "Загрузка ресурсов..."),
            (40, "Подготовка интерфейса..."),
            (60, "Подключение к API..."),
            (80, "Синхронизация..."),
            (100, "Готово!")
        ]
        
        current_step = 0
        
        def next_step():
            nonlocal current_step
            if current_step < len(steps):
                value, text = steps[current_step]
                self.smooth_progress(value, text)
                current_step += 1
                self.after(600, next_step)
            else:
                # Прямой переход ко входу без затухания
                self.after(500, self.open_login)
        
        next_step()
    
    def smooth_progress(self, target_value, text):
        current = self.progress_var.get()
        step = (target_value - current) / 20
        
        def animate():
            nonlocal current
            current += step
            if current < target_value:
                self.progress_var.set(current)
                self.status_label.configure(text=text)
                self.after(30, animate)
            else:
                self.progress_var.set(target_value)
                self.status_label.configure(text=text)
        
        animate()
    
    def open_login(self):
        """Открыть окно входа"""
        print("Opening login window...")
        self.withdraw()  # Скрыть заставку
        
        try:
            from login_window import LoginWindow
            login = LoginWindow()
            login.mainloop()
            self.destroy()
        except Exception as e:
            print(f"Error opening login: {e}")
            messagebox.showerror("Ошибка", f"Не удалось открыть окно входа: {e}")
            self.destroy()
    
    def on_close(self, login_window):
        """Закрытие приложения"""
        login_window.destroy()
        self.destroy()


def run_loading_window():
    app = SimpleLoadingWindow()
    app.mainloop()


if __name__ == "__main__":
    run_loading_window()
