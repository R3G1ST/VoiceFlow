import requests
import json
from typing import Optional, Dict, List

class VoiceFlowAPI:
    def __init__(self, base_url: str = "http://77.105.133.95:3000/api"):
        self.base_url = base_url
        self.access_token: Optional[str] = None
        self.session = requests.Session()
        
    def set_token(self, token: str):
        """Установить токен авторизации"""
        self.access_token = token
        self.session.headers.update({'Authorization': f'Bearer {token}'})
    
    def clear_token(self):
        """Очистить токен"""
        self.access_token = None
        self.session.headers.pop('Authorization', None)
    
    def register(self, email: str, username: str, password: str) -> Dict:
        """Регистрация пользователя"""
        response = self.session.post(
            f"{self.base_url}/auth/register",
            json={'email': email, 'username': username, 'password': password}
        )
        response.raise_for_status()
        return response.json()
    
    def login(self, email: str, password: str) -> Dict:
        """Вход пользователя"""
        response = self.session.post(
            f"{self.base_url}/auth/login",
            json={'email': email, 'password': password}
        )
        response.raise_for_status()
        return response.json()
    
    def get_user(self) -> Dict:
        """Получить текущего пользователя"""
        response = self.session.get(f"{self.base_url}/users/me")
        response.raise_for_status()
        return response.json()
    
    def get_servers(self) -> List[Dict]:
        """Получить список серверов"""
        response = self.session.get(f"{self.base_url}/servers")
        response.raise_for_status()
        return response.json()
    
    def create_server(self, name: str) -> Dict:
        """Создать сервер"""
        response = self.session.post(
            f"{self.base_url}/servers",
            json={'name': name}
        )
        response.raise_for_status()
        return response.json()
    
    def check_connection(self) -> bool:
        """Проверить подключение к серверу"""
        try:
            response = self.session.get(
                f"{self.base_url}/auth/login",
                timeout=5
            )
            return response.status_code < 500
        except:
            return False

# Глобальный экземпляр API
api = VoiceFlowAPI()
