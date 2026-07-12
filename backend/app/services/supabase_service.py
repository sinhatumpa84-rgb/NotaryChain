"""
Supabase Service for Backend
Handles database operations and storage with service role privileges
"""
import os
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from supabase import create_client, Client
from fastapi import HTTPException, UploadFile
import uuid

class SupabaseService:
    """Supabase service for backend operations"""
    
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables")
        
        self.client: Client = create_client(supabase_url, supabase_key)
        self.storage_bucket = "documents"
    
    # ========================================================================
    # USER OPERATIONS
    # ========================================================================
    
    async def create_user(self, firebase_uid: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create user profile in Supabase"""
        data = {
            "id": firebase_uid,
            "email": user_data["email"],
            "first_name": user_data["first_name"],
            "last_name": user_data["last_name"],
            "full_name": user_data["full_name"],
            "phone": user_data.get("phone"),
            "role": user_data["role"],
            "photo_url": user_data.get("photo_url"),
            "is_email_verified": user_data.get("is_email_verified", False),
            "is_phone_verified": user_data.get("is_phone_verified", False),
            "is_identity_verified": False,
            "is_active": True,
            "is_approved": user_data.get("is_approved", True),
            "mfa_enabled": False,
        }
        
        result = self.client.table("users").insert(data).execute()
        return result.data[0] if result.data else None
    
    async def get_user(self, firebase_uid: str) -> Optional[Dict[str, Any]]:
        """Get user by Firebase UID"""
        result = self.client.table("users").select("*").eq("id", firebase_uid).execute()
        return result.data[0] if result.data else None
    
    async def update_user(self, firebase_uid: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update user profile"""
        result = self.client.table("users").update(updates).eq("id", firebase_uid).execute()
        return result.data[0] if result.data else None
    
    async def get_users_by_role(self, role: str) -> List[Dict[str, Any]]:
        """Get all users with specific role"""
        result = self.client.table("users").select("*").eq("role", role).eq("is_active", True).execute()
        return result.data
    
    # ========================================================================
    # DOCUMENT OPERATIONS
    # ========================================================================
    
    async def upload_document(
        self,
        file: UploadFile,
        user_id: str,
        metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Upload document to Supabase Storage and create database record"""
        
        # Validate file
        self._validate_file(file)
        
        # Generate unique file path
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = file.filename.split(".")[-1]
        file_path = f"{user_id}/{timestamp}_{uuid.uuid4()}.{file_extension}"
        
        # Upload to storage
        file_content = await file.read()
        storage_result = self.client.storage.from_(self.storage_bucket).upload(
            file_path,
            file_content,
            {"content-type": file.content_type}
        )
        
        if hasattr(storage_result, 'error') and storage_result.error:
            raise HTTPException(status_code=500, detail=f"Storage upload failed: {storage_result.error}")
        
        # Get public URL
        public_url = self.client.storage.from_(self.storage_bucket).get_public_url(file_path)
        
        # Create document record
        document_data = {
            "uploaded_by": user_id,
            "company_id": metadata.get("company_id"),
            "document_type": metadata["document_type"],
            "document_name": metadata["document_name"],
            "document_number": metadata.get("document_number"),
            "file_url": public_url,
            "file_path": file_path,
            "file_size": file.size,
            "mime_type": file.content_type,
            "status": "uploaded",
            "is_encrypted": False,
            "is_signed": False,
            "uploaded_at": datetime.utcnow().isoformat(),
            "metadata": {
                "original_filename": file.filename,
                "uploaded_at": datetime.utcnow().isoformat(),
            }
        }
        
        result = self.client.table("documents").insert(document_data).execute()
        
        if not result.data:
            # Rollback: delete uploaded file
            self.client.storage.from_(self.storage_bucket).remove([file_path])
            raise HTTPException(status_code=500, detail="Failed to create document record")
        
        return result.data[0]
    
    async def get_document(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get document by ID"""
        result = self.client.table("documents").select("*").eq("id", document_id).execute()
        return result.data[0] if result.data else None
    
    async def get_user_documents(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all documents uploaded by user"""
        result = self.client.table("documents").select("*").eq("uploaded_by", user_id).order("created_at", desc=True).execute()
        return result.data
    
    async def update_document(self, document_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update document metadata"""
        result = self.client.table("documents").update(updates).eq("id", document_id).execute()
        return result.data[0] if result.data else None
    
    async def delete_document(self, document_id: str) -> bool:
        """Delete document and file"""
        # Get document to get file path
        document = await self.get_document(document_id)
        if not document:
            return False
        
        # Delete from storage
        self.client.storage.from_(self.storage_bucket).remove([document["file_path"]])
        
        # Delete database record
        self.client.table("documents").delete().eq("id", document_id).execute()
        return True
    
    async def create_signed_url(self, document_id: str, expires_in: int = 3600) -> str:
        """Generate signed URL for secure document download"""
        document = await self.get_document(document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        result = self.client.storage.from_(self.storage_bucket).create_signed_url(
            document["file_path"],
            expires_in
        )
        
        return result["signedURL"]
    
    # ========================================================================
    # COMPANY OPERATIONS
    # ========================================================================
    
    async def create_company(self, company_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create company record"""
        result = self.client.table("companies").insert(company_data).execute()
        return result.data[0] if result.data else None
    
    async def get_company(self, company_id: str) -> Optional[Dict[str, Any]]:
        """Get company by ID"""
        result = self.client.table("companies").select("*").eq("id", company_id).execute()
        return result.data[0] if result.data else None
    
    async def get_user_companies(self, user_id: str) -> List[Dict[str, Any]]:
        """Get companies owned by user"""
        result = self.client.table("companies").select("*").eq("owner_id", user_id).execute()
        return result.data
    
    # ========================================================================
    # NOTARY REQUEST OPERATIONS
    # ========================================================================
    
    async def create_notary_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create notary request"""
        result = self.client.table("notary_requests").insert(request_data).execute()
        return result.data[0] if result.data else None
    
    async def get_notary_request(self, request_id: str) -> Optional[Dict[str, Any]]:
        """Get notary request by ID"""
        result = self.client.table("notary_requests").select("*").eq("id", request_id).execute()
        return result.data[0] if result.data else None
    
    async def get_user_notary_requests(self, user_id: str) -> List[Dict[str, Any]]:
        """Get notary requests for user"""
        result = self.client.table("notary_requests").select("*").eq("requested_by", user_id).order("created_at", desc=True).execute()
        return result.data
    
    async def update_notary_request(self, request_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update notary request"""
        result = self.client.table("notary_requests").update(updates).eq("id", request_id).execute()
        return result.data[0] if result.data else None
    
    # ========================================================================
    # AUDIT LOG OPERATIONS
    # ========================================================================
    
    async def create_audit_log(self, log_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create audit log entry"""
        result = self.client.table("audit_logs").insert(log_data).execute()
        return result.data[0] if result.data else None
    
    async def get_audit_logs(
        self,
        user_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get audit logs with filters"""
        query = self.client.table("audit_logs").select("*")
        
        if user_id:
            query = query.eq("user_id", user_id)
        if resource_type:
            query = query.eq("resource_type", resource_type)
        
        result = query.order("created_at", desc=True).limit(limit).execute()
        return result.data
    
    # ========================================================================
    # NOTIFICATION OPERATIONS
    # ========================================================================
    
    async def create_notification(self, notification_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create notification"""
        result = self.client.table("notifications").insert(notification_data).execute()
        return result.data[0] if result.data else None
    
    async def get_user_notifications(
        self,
        user_id: str,
        unread_only: bool = False
    ) -> List[Dict[str, Any]]:
        """Get user notifications"""
        query = self.client.table("notifications").select("*").eq("user_id", user_id)
        
        if unread_only:
            query = query.eq("is_read", False)
        
        result = query.order("created_at", desc=True).execute()
        return result.data
    
    async def mark_notification_read(self, notification_id: str) -> Dict[str, Any]:
        """Mark notification as read"""
        result = self.client.table("notifications").update({"is_read": True}).eq("id", notification_id).execute()
        return result.data[0] if result.data else None
    
    # ========================================================================
    # VERIFICATION LOG OPERATIONS
    # ========================================================================
    
    async def create_verification_log(self, log_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create verification log"""
        result = self.client.table("verification_logs").insert(log_data).execute()
        return result.data[0] if result.data else None
    
    async def get_user_verification_logs(self, user_id: str) -> List[Dict[str, Any]]:
        """Get verification logs for user"""
        result = self.client.table("verification_logs").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return result.data
    
    # ========================================================================
    # HELPER METHODS
    # ========================================================================
    
    def _validate_file(self, file: UploadFile) -> None:
        """Validate uploaded file"""
        max_size = 50 * 1024 * 1024  # 50MB
        allowed_types = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg",
            "image/png",
        ]
        
        if file.size > max_size:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum allowed size of 50MB"
            )
        
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file.content_type} not allowed. Allowed: PDF, DOCX, JPEG, PNG"
            )

# Global instance
supabase_service = SupabaseService()
