from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class RegisterFaceRequest(BaseModel):
    user_id: str = Field(..., description="Unique ID of the user")
    name: str = Field(..., description="Full name of the user")
    image_base64: str = Field(..., description="Base64 encoded face image or data URL")
    image_url: Optional[str] = Field(None, description="Optional public/cloud image URL")

class RecognizeFaceRequest(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded face image or data URL from webcam")
    threshold: Optional[float] = Field(0.60, description="Override similarity threshold (0.0 to 1.0)")

class FaceMatchResponse(BaseModel):
    authenticated: bool
    status: str
    user_id: Optional[str] = None
    name: Optional[str] = None
    similarity_score: float = 0.0
    confidence_percentage: float = 0.0
    image_url: Optional[str] = None
    message: str

class FaceRegisterResponse(BaseModel):
    success: bool
    message: str
    user_id: str
    name: str
    embedding_size: int
    created_at: datetime

class StoredFaceRecord(BaseModel):
    user_id: str
    name: str
    embedding: List[float]
    image_url: Optional[str] = None
    created_at: datetime
