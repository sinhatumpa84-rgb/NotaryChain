import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "NotaryChain AI Face Recognition Service"
    API_V1_STR: str = "/api/v1"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # MongoDB Atlas Connection
    MONGODB_URI: str = os.getenv(
        "MONGODB_URI",
        "mongodb+srv://soumik7484_db_user:Soumik2025@cluster0.mvqix1c.mongodb.net/notarychain?retryWrites=true&w=majority&appName=Cluster0"
    )
    DATABASE_NAME: str = "notarychain"
    COLLECTION_NAME: str = "face_embeddings"
    
    # Face Recognition Parameters
    SIMILARITY_THRESHOLD: float = 0.60  # Cosine similarity threshold (0.0 to 1.0)
    EMBEDDING_DIMENSION: int = 512
    
    # Security
    ALLOWED_ORIGINS: list = ["*"]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
