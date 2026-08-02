import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

from config import settings
from database import db
from schemas import (
    RegisterFaceRequest,
    RecognizeFaceRequest,
    FaceMatchResponse,
    FaceRegisterResponse
)
from face_engine import face_engine
from similarity import find_best_match

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("face_service")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    logger.info("Initializing Face Recognition Microservice...")
    db.connect()
    yield
    # Shutdown
    logger.info("Shutting down Face Recognition Microservice...")

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="AI-based Face Recognition & Verification Service using InsightFace/FaceNet and MongoDB vector similarity.",
    lifespan=lifespan
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "online",
        "service": settings.APP_NAME,
        "database": "connected" if db.client is not None else "disconnected",
        "engine": "InsightFace" if face_engine.use_insightface else "OpenCV Deep Embedder",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.post("/api/v1/register", response_model=FaceRegisterResponse, tags=["Face Recognition"])
def register_face(req: RegisterFaceRequest):
    """
    Extracts face embedding vector from uploaded webcam image and stores it in MongoDB.
    """
    try:
        image_bgr = face_engine.decode_base64_image(req.image_base64)
        embedding, bbox = face_engine.extract_face_embedding(image_bgr)
        
        if not embedding:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No clear face detected in the captured image. Please align your face with the camera."
            )
            
        record = db.save_face_embedding(
            user_id=req.user_id,
            name=req.name,
            embedding=embedding,
            image_url=req.image_url
        )
        
        logger.info(f"Registered face embedding for user: {req.name} (ID: {req.user_id})")
        
        return FaceRegisterResponse(
            success=True,
            message="Face template successfully registered!",
            user_id=req.user_id,
            name=req.name,
            embedding_size=len(embedding),
            created_at=record.get("created_at", datetime.now(timezone.utc))
        )
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error registering face: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process face registration: {str(e)}"
        )

@app.post("/api/v1/recognize", response_model=FaceMatchResponse, tags=["Face Recognition"])
def recognize_face(req: RecognizeFaceRequest):
    """
    Captures user's face from webcam, extracts embedding, compares with MongoDB stored templates
    using Cosine Similarity, and authenticates if score >= threshold.
    """
    try:
        # 1. Decode captured webcam image
        image_bgr = face_engine.decode_base64_image(req.image_base64)
        captured_embedding, _ = face_engine.extract_face_embedding(image_bgr)
        
        if not captured_embedding:
            return FaceMatchResponse(
                authenticated=False,
                status="no_face_detected",
                similarity_score=0.0,
                confidence_percentage=0.0,
                message="No face detected in webcam stream. Please center your face."
            )

        # 2. Fetch stored candidates from MongoDB
        candidates = db.get_all_embeddings()
        
        if not candidates:
            return FaceMatchResponse(
                authenticated=False,
                status="no_registered_users",
                similarity_score=0.0,
                confidence_percentage=0.0,
                message="No registered Face ID profiles exist in the system."
            )

        # 3. Perform Cosine Similarity matching
        threshold = req.threshold if req.threshold is not None else settings.SIMILARITY_THRESHOLD
        best_match, highest_sim = find_best_match(captured_embedding, candidates, threshold=threshold)

        confidence_pct = round(min(highest_sim * 100.0, 99.9), 2)

        if best_match:
            user_id = best_match.get("user_id")
            name = best_match.get("name")
            image_url = best_match.get("image_url")
            
            logger.info(f"Face Match SUCCESS: {name} ({user_id}) | Similarity: {highest_sim:.4f}")
            
            return FaceMatchResponse(
                authenticated=True,
                status="matched",
                user_id=user_id,
                name=name,
                similarity_score=round(highest_sim, 4),
                confidence_percentage=confidence_pct,
                image_url=image_url,
                message=f"Welcome back, {name}! Face ID verified."
            )
        else:
            logger.info(f"Face Match REJECTED | Best Similarity: {highest_sim:.4f} < Threshold: {threshold}")
            
            return FaceMatchResponse(
                authenticated=False,
                status="unknown_person",
                similarity_score=round(highest_sim, 4),
                confidence_percentage=confidence_pct,
                message="Unknown Person. Face similarity below authentication threshold."
            )

    except Exception as e:
        logger.error(f"Error during face recognition: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Face recognition processing failed: {str(e)}"
        )

@app.get("/api/v1/users/{user_id}", tags=["Face Recognition"])
def get_user_face_status(user_id: str):
    record = db.get_embedding_by_user(user_id)
    if not record:
        return {"registered": False, "user_id": user_id}
    return {
        "registered": True,
        "user_id": record.get("user_id"),
        "name": record.get("name"),
        "created_at": record.get("created_at"),
        "image_url": record.get("image_url")
    }

@app.delete("/api/v1/users/{user_id}", tags=["Face Recognition"])
def delete_user_face(user_id: str):
    deleted = db.delete_face_embedding(user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Face ID profile not found for user")
    return {"success": True, "message": f"Face ID template deleted for user {user_id}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
