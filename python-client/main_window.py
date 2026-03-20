import customtkinter as ctk
from tkinter import messagebox, scrolledtext
from api_client import api
import json

class MainWindow(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        # Настройки окна
        self.title("VoiceFlow")
        self.geometry("1400x900")
        self.state('zoomed')  # На весь экран
        
        # Цветовая тема
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")
        
        # Данные
        self.user = None
        self.servers = []
        self.current_server = None
        self.channels = []
        
        # Создание UI
        self.create_layout()
        
        # Загрузка данных
        self.load_data()
    
    def create_layout(self):
        """Создать основную разметку"""
        
        # Главный контейнер
        self.main_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.main_frame.pack(fill="both", expand=True, padx=5, pady=5)
        
        # Левая панель (серверы)
        self.server_list_frame = ctk.CTkFrame(
            self.main_frame,
            width=80,
            fg_color="#202225"
        )
        self.server_list_frame.pack(side="left", fill="y", padx=(0, 5))
        
        # Панель каналов
        self.channel_list_frame = ctk.CTkFrame(
            self.main_frame,
            width=240,
            fg_color="#2f3136"
        )
        self.channel_list_frame.pack(side="left", fill="y", padx=(0, 5))
        
        # Центральная область (чат)
        self.chat_frame = ctk.CTkFrame(
            self.main_frame,
            fg_color="#36393f"
        )
        self.chat_frame.pack(side="left", fill="both", expand=True, padx=(0, 5))
        
        # Правая панель (участники)
        self.member_list_frame = ctk.CTkFrame(
            self.main_frame,
            width=200,
            fg_color="#2f3136"
        )
        self.member_list_frame.pack(side="left", fill="y")
        
        # Создание виджетов
        self.create_server_list()
        self.create_channel_list()
        self.create_chat_area()
        self.create_member_list()
        self.create_user_panel()
    
    def create_server_list(self):
        """Создать список серверов"""
        
        # Заголовок
        self.server_title = ctk.CTkLabel(
            self.server_list_frame,
            text="🏠",
            font=ctk.CTkFont(size=24)
        )
        self.server_title.pack(pady=10)
        
        # Разделитель
        ctk.CTkFrame(
            self.server_list_frame,
            height=2,
            fg_color="#36393f"
        ).pack(pady=5, padx=10, fill="x")
        
        # Список серверов
        self.servers_scroll = ctk.CTkScrollableFrame(
            self.server_list_frame,
            fg_color="transparent"
        )
        self.servers_scroll.pack(fill="both", expand=True, padx=5)
        
        # Кнопка создания сервера
        self.add_server_btn = ctk.CTkButton(
            self.servers_scroll,
            text="+",
            width=50,
            height=50,
            font=ctk.CTkFont(size=24),
            fg_color="#36393f",
            hover_color="#23a559",
            command=self.create_server
        )
        self.add_server_btn.pack(pady=10)
    
    def create_channel_list(self):
        """Создать список каналов"""
        
        # Заголовок сервера
        self.server_name_label = ctk.CTkLabel(
            self.channel_list_frame,
            text="Выберите сервер",
            font=ctk.CTkFont(size=16, weight="bold"),
            text_color="white"
        )
        self.server_name_label.pack(pady=15, padx=10, fill="x")
        
        # Разделитель
        ctk.CTkFrame(
            self.channel_list_frame,
            height=1,
            fg_color="#36393f"
        ).pack(pady=5, padx=10, fill="x")
        
        # Текстовые каналы
        self.text_channels_label = ctk.CTkLabel(
            self.channel_list_frame,
            text="ТЕКСТОВЫЕ КАНАЛЫ",
            font=ctk.CTkFont(size=11, weight="bold"),
            text_color="#8e9297"
        )
        self.text_channels_label.pack(pady=(15, 5), padx=10, fill="x")
        
        self.channels_scroll = ctk.CTkScrollableFrame(
            self.channel_list_frame,
            fg_color="transparent"
        )
        self.channels_scroll.pack(fill="both", expand=True, padx=5, pady=5)
        
        # Голосовые каналы
        self.voice_channels_label = ctk.CTkLabel(
            self.channel_list_frame,
            text="ГОЛОСОВЫЕ КАНАЛЫ",
            font=ctk.CTkFont(size=11, weight="bold"),
            text_color="#8e9297"
        )
        self.voice_channels_label.pack(pady=(10, 5), padx=10, fill="x")
        
        self.voice_scroll = ctk.CTkScrollableFrame(
            self.channel_list_frame,
            fg_color="transparent"
        )
        self.voice_scroll.pack(fill="x", padx=5, pady=5)
    
    def create_chat_area(self):
        """Создать область чата"""
        
        # Заголовок канала
        self.channel_header = ctk.CTkFrame(self.chat_frame, fg_color="#36393f", height=50)
        self.channel_header.pack(fill="x", padx=10, pady=10)
        
        self.channel_name = ctk.CTkLabel(
            self.channel_header,
            text="# general",
            font=ctk.CTkFont(size=20, weight="bold"),
            text_color="white"
        )
        self.channel_name.pack(side="left", pady=10, padx=10)
        
        # Область сообщений
        self.messages_area = scrolledtext.ScrolledText(
            self.chat_frame,
            bg="#36393f",
            fg="white",
            font=("Arial", 12),
            wrap="word",
            padx=10,
            pady=10
        )
        self.messages_area.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Поле ввода
        self.input_frame = ctk.CTkFrame(self.chat_frame, fg_color="#36393f")
        self.input_frame.pack(fill="x", padx=10, pady=10)
        
        self.message_entry = ctk.CTkEntry(
            self.input_frame,
            placeholder_text="Написать сообщение...",
            height=45,
            font=ctk.CTkFont(size=14)
        )
        self.message_entry.pack(side="left", fill="x", expand=True, padx=(0, 10))
        
        self.send_btn = ctk.CTkButton(
            self.input_frame,
            text="➤",
            width=50,
            height=45,
            font=ctk.CTkFont(size=18),
            command=self.send_message
        )
        self.send_btn.pack(side="right")
    
    def create_member_list(self):
        """Создать список участников"""
        
        # Заголовок
        self.members_title = ctk.CTkLabel(
            self.member_list_frame,
            text="УЧАСТНИКИ",
            font=ctk.CTkFont(size=11, weight="bold"),
            text_color="#8e9297"
        )
        self.members_title.pack(pady=15, padx=10, fill="x")
        
        # Список участников
        self.members_scroll = ctk.CTkScrollableFrame(
            self.member_list_frame,
            fg_color="transparent"
        )
        self.members_scroll.pack(fill="both", expand=True, padx=5, pady=5)
    
    def create_user_panel(self):
        """Создать панель пользователя"""
        
        self.user_panel = ctk.CTkFrame(
            self.channel_list_frame,
            fg_color="#292b2f",
            height=60
        )
        self.user_panel.pack(side="bottom", fill="x", padx=5, pady=5)
        
        self.user_info = ctk.CTkLabel(
            self.user_panel,
            text="Загрузка...",
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color="white"
        )
        self.user_info.pack(side="left", padx=10, pady=10)
        
        # Кнопка выхода
        self.logout_btn = ctk.CTkButton(
            self.user_panel,
            text="🚪",
            width=40,
            height=40,
            font=ctk.CTkFont(size=18),
            fg_color="#da373c",
            hover_color="#b32d32",
            command=self.logout
        )
        self.logout_btn.pack(side="right", padx=5, pady=10)
    
    def load_data(self):
        """Загрузить данные"""
        try:
            # Загрузка пользователя
            self.user = api.get_user()
            self.user_info.configure(text=f"👤 {self.user['username']}#{self.user['discriminator']}")
            
            # Загрузка серверов
            self.servers = api.get_servers()
            self.refresh_server_list()
            
            # Приветственное сообщение
            self.messages_area.insert("end", f"🎉 Добро пожаловать в VoiceFlow, {self.user['username']}!\n\n")
            self.messages_area.insert("end", "💡 Выберите сервер слева чтобы начать.\n")
            self.messages_area.configure(state="disabled")
            
        except Exception as e:
            messagebox.showerror("Ошибка", f"Не удалось загрузить данные: {str(e)}")
            self.logout()
    
    def refresh_server_list(self):
        """Обновить список серверов"""
        # Очистка
        for widget in self.servers_scroll.winfo_children():
            widget.destroy()
        
        # Добавление серверов
        for server in self.servers:
            btn = ctk.CTkButton(
                self.servers_scroll,
                text=server['name'][:2].upper(),
                width=50,
                height=50,
                font=ctk.CTkFont(size=18, weight="bold"),
                fg_color="#36393f",
                hover_color="#5865F2",
                command=lambda s=server: self.select_server(s)
            )
            btn.pack(pady=5)
    
    def select_server(self, server):
        """Выбрать сервер"""
        self.current_server = server
        self.server_name_label.configure(text=server['name'])
        
        # Очистка каналов
        for widget in self.channels_scroll.winfo_children():
            widget.destroy()
        
        # Добавление каналов (пока заглушка)
        channel_btn = ctk.CTkButton(
            self.channels_scroll,
            text="# general",
            anchor="w",
            fg_color="transparent",
            hover_color="#36393f",
            text_color="white",
            command=lambda: self.select_channel("general")
        )
        channel_btn.pack(fill="x", pady=2)
    
    def select_channel(self, channel_name):
        """Выбрать канал"""
        self.channel_name.configure(text=f"# {channel_name}")
        self.messages_area.configure(state="normal")
        self.messages_area.delete("1.0", "end")
        self.messages_area.insert("end", f"📍 Канал #{channel_name}\n\n")
        self.messages_area.insert("end", "Пока нет сообщений.\n")
        self.messages_area.configure(state="disabled")
    
    def send_message(self):
        """Отправить сообщение"""
        message = self.message_entry.get()
        if message:
            self.messages_area.configure(state="normal")
            self.messages_area.insert("end", f"\n👤 Вы: {message}\n")
            self.messages_area.see("end")
            self.messages_area.configure(state="disabled")
            self.message_entry.delete(0, "end")
    
    def create_server(self):
        """Создать сервер"""
        dialog = ctk.CTkInputDialog(
            text="Введите название сервера:",
            title="Создать сервер"
        )
        name = dialog.get_input()
        
        if name:
            try:
                server = api.create_server(name)
                self.servers.append(server)
                self.refresh_server_list()
                messagebox.showinfo("Успех", f"Сервер '{name}' создан!")
            except Exception as e:
                messagebox.showerror("Ошибка", f"Не удалось создать сервер: {str(e)}")
    
    def logout(self):
        """Выйти"""
        if messagebox.askyesno("Выход", "Вы уверены что хотите выйти?"):
            api.clear_token()
            self.destroy()
            from login_window import LoginWindow
            login = LoginWindow()
            login.mainloop()


def run_main_window():
    """Запустить главное окно"""
    app = MainWindow()
    app.mainloop()


if __name__ == "__main__":
    run_main_window()
