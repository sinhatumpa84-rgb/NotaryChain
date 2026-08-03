"""
Application configuration settings
"""
try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings  # type: ignore

try:
    from pydantic import Field, field_validator
except ImportError:
    from pydantic import Field, validator as field_validator  # type: ignore

from pathlib import Path


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "Digital Notary Platform"
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    DEBUG: bool = Field(default=True, env="DEBUG")
    API_VERSION: str = "v1"
    LOG_LEVEL: str = "INFO"
    
    # Database
    DATABASE_URL: str = Field(default="postgresql://postgres:password@localhost:5432/notarychain", env="DATABASE_URL")
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 40
    
    # Redis Configuration (Reads REDIS_URL env var)
    REDIS_URL: Optional[str] = Field(default=None, env="REDIS_URL")
    REDIS_HOST: Optional[str] = Field(default=None, env="REDIS_HOST")
    REDIS_PORT: Optional[int] = Field(default=None, env="REDIS_PORT")
    REDIS_PASSWORD: Optional[str] = Field(default=None, env="REDIS_PASSWORD")
    REDIS_USERNAME: Optional[str] = Field(default="default", env="REDIS_USERNAME")
    
    # JWT
    JWT_SECRET_KEY: str = Field(default="dev-jwt-secret-key-change-in-production", env="JWT_SECRET_KEY")
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # S3/MinIO
    S3_ENDPOINT: str = Field(default="http://localhost:9000", env="S3_ENDPOINT")
    S3_ACCESS_KEY: str = Field(default="minio_admin", env="S3_ACCESS_KEY")
    S3_SECRET_KEY: str = Field(default="minio_pass_dev", env="S3_SECRET_KEY")
    S3_BUCKET_NAME: str = "notary-documents"
    S3_REGION: str = "us-east-1"
    
    # Encryption
    DOCUMENT_ENCRYPTION_KEY: str = Field(default="dev-doc-encryption-key-change-in-prod-32bytes!", env="DOCUMENT_ENCRYPTION_KEY")
    AES_KEY: str = Field(default="dGVzdC1hZXMta2V5LTE2LWJ5dGVzLTEyMzQ1Ng==", env="AES_KEY")
    
    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM: str = "noreply@digitalnotary.com"
    SMTP_TLS: bool = True
    
    # SMS (Twilio)
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None
    
    # WhatsApp
    WHATSAPP_API_KEY: Optional[str] = None
    WHATSAPP_PHONE_NUMBER: Optional[str] = None
    
    # OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    MICROSOFT_CLIENT_ID: Optional[str] = None
    MICROSOFT_CLIENT_SECRET: Optional[str] = None
    
    # Aadhaar Verification
    AADHAAR_API_KEY: Optional[str] = None
    AADHAAR_API_URL: Optional[str] = None
    
    # Face Recognition
    FACE_RECOGNITION_API_KEY: Optional[str] = None
    FACE_RECOGNITION_ENDPOINT: Optional[str] = None
    
    # OCR
    TESSERACT_PATH: str = "/usr/bin/tesseract"
    OCR_LANGUAGE: str = "eng+hin"
    
    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4"
    
    # Digital Signature
    PKI_CERTIFICATE_PATH: Optional[str] = None
    PKI_PRIVATE_KEY_PATH: Optional[str] = None
    PKI_PASSPHRASE: Optional[str] = None
    
    # Blockchain
    BLOCKCHAIN_PROVIDER_URL: Optional[str] = None
    BLOCKCHAIN_PRIVATE_KEY: Optional[str] = None
    BLOCKCHAIN_CONTRACT_ADDRESS: Optional[str] = None
    
    # Security
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:80"]
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    RATE_LIMIT_PER_MINUTE: int = 60
    MAX_UPLOAD_SIZE_MB: int = 50
    
    # Celery
    CELERY_BROKER_URL: Optional[str] = Field(default=None, env="CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND: Optional[str] = Field(default=None, env="CELERY_RESULT_BACKEND")
    
    # Monitoring
    SENTRY_DSN: Optional[str] = None
    
    # File Upload
    ALLOWED_EXTENSIONS: List[str] = ["pdf", "docx", "doc", "png", "jpg", "jpeg"]
    MAX_FILE_SIZE_BYTES: int = 52428800  # 50MB
    
    # Geolocation
    GEOLOCATION_API_KEY: Optional[str] = None
    
    # Push Notifications
    FCM_SERVER_KEY: Optional[str] = None
    VAPID_PUBLIC_KEY: Optional[str] = None
    VAPID_PRIVATE_KEY: Optional[str] = None
    
    # Compliance
    DATA_RETENTION_DAYS: int = 2555  # ~7 years
    AUDIT_LOG_RETENTION_YEARS: int = 7
    GDPR_ENABLED: bool = True
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW_SECONDS: int = 60
    
    # Fraud Detection
    FRAUD_SCORE_THRESHOLD: float = 0.7
    ENABLE_DEEPFAKE_DETECTION: bool = True
    ENABLE_DOCUMENT_TAMPERING_DETECTION: bool = True
    
    # Session
    SESSION_SECRET: str = Field(default="dev-session-secret-change-in-production", env="SESSION_SECRET")
    SESSION_EXPIRY_HOURS: int = 24
    
    # Supabase
    SUPABASE_URL: Optional[str] = Field(None, env="SUPABASE_URL")
    SUPABASE_ANON_KEY: Optional[str] = Field(None, env="SUPABASE_ANON_KEY")
    SUPABASE_SERVICE_KEY: Optional[str] = Field(None, env="SUPABASE_SERVICE_KEY")
    
    # Firebase Admin
    FIREBASE_PROJECT_ID: Optional[str] = Field(None, env="FIREBASE_PROJECT_ID")
    FIREBASE_SERVICE_ACCOUNT_PATH: Optional[str] = Field(None, env="FIREBASE_SERVICE_ACCOUNT_PATH")
    FIREBASE_CLIENT_EMAIL: Optional[str] = Field(None, env="FIREBASE_CLIENT_EMAIL")
    FIREBASE_PRIVATE_KEY: Optional[str] = Field(None, env="FIREBASE_PRIVATE_KEY")
    
    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    TEMP_DIR: Path = BASE_DIR / "temp"
    LOG_DIR: Path = BASE_DIR / "logs"
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS origins from string or list"""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    @field_validator("ALLOWED_EXTENSIONS", mode="before")
    @classmethod
    def parse_allowed_extensions(cls, v):
        """Parse allowed extensions from string or list"""
        if isinstance(v, str):
            return [ext.strip() for ext in v.split(",")]
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"


# Create settings instance
settings = Settings()

# Create necessary directories
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.TEMP_DIR.mkdir(parents=True, exist_ok=True)
settings.LOG_DIR.mkdir(parents=True, exist_ok=True)
