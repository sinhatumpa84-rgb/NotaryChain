import logging
from pymongo import MongoClient
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from config import settings

logger = logging.getLogger("face_service.database")

class Database:
    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.db = None
        self.collection = None

    def connect(self):
        try:
            self.client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)
            self.db = self.client[settings.DATABASE_NAME]
            self.collection = self.db[settings.COLLECTION_NAME]
            # Ensure unique index on user_id
            self.collection.create_index("user_id", unique=True)
            logger.info("Connected to MongoDB Atlas successfully")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB Atlas: {e}")
            raise e

    def save_face_embedding(self, user_id: str, name: str, embedding: List[float], image_url: Optional[str] = None) -> Dict[str, Any]:
        """
        Stores or updates a face embedding in MongoDB.
        Only image URL is saved if provided, never raw image bytes.
        """
        doc = {
            "user_id": user_id,
            "name": name,
            "embedding": embedding,
            "image_url": image_url,
            "updated_at": datetime.now(timezone.utc),
        }
        
        # Upsert record
        result = self.collection.update_one(
            {"user_id": user_id},
            {
                "$set": doc,
                "$setOnInsert": {"created_at": datetime.now(timezone.utc)}
            },
            upsert=True
        )
        return doc

    def get_all_embeddings(self) -> List[Dict[str, Any]]:
        """
        Retrieves all stored face embedding records for similarity comparison.
        """
        cursor = self.collection.find({}, {"_id": 0, "user_id": 1, "name": 1, "embedding": 1, "image_url": 1, "created_at": 1})
        return list(cursor)

    def get_embedding_by_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        return self.collection.find_one({"user_id": user_id}, {"_id": 0})

    def delete_face_embedding(self, user_id: str) -> bool:
        res = self.collection.delete_one({"user_id": user_id})
        return res.deleted_count > 0

db = Database()
