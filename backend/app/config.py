import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "VietHeritage-QSafe"
    UPLOAD_DIR: str = "data/uploads"
    DATABASE_URL: str = "sqlite:///./data/vietheritage.db"
    
    class Config:
        env_file = ".env"

settings = Settings()

# Construct absolute paths relative to the project root or backend directory if needed, 
# but for now, we'll stick to the requirements.
# In a real app, we might use Path(__file__).parent.parent
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs("data", exist_ok=True)
