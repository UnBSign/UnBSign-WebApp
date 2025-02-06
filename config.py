import os
from dotenv import load_dotenv

class Config:
    def __init__(self, env_file='.env'):
        # Carrega as variáveis de ambiente do arquivo .env
        load_dotenv(env_file)

    @property
    def api_url(self):
        return os.getenv("API_URL")
    
    @property
    def api_url_back(self):
        return os.getenv("API_URL_BACK")

config = Config()
