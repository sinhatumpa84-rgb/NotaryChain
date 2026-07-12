"""
Document management API endpoints with Supabase Storage
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import Optional
import logging

from app.core.security import get_current_user
from app.services.supabase_service import supabase_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form(...),
    document_name: str = Form(...),
    document_number: Optional[str] = Form(None),
    company_id: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    """Upload a document to Supabase Storage"""
    try:
        user_id = current_user["sub"]
        
        metadata = {
            "document_type": document_type,
            "document_name": document_name,
            "document_number": document_number,
            "company_id": company_id
        }
        
        result = await supabase_service.upload_document(file, user_id, metadata)
        
        return {
            "success": True,
            "message": "Document uploaded successfully",
            "data": result
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document upload error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload document: {str(e)}"
        )


@router.get("/{document_id}")
async def get_document(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get document by ID"""
    try:
        document = await supabase_service.get_document(document_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        return {
            "success": True,
            "data": document
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get document error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/")
async def list_user_documents(
    current_user: dict = Depends(get_current_user)
):
    """List all documents for the current user"""
    try:
        user_id = current_user["sub"]
        documents = await supabase_service.get_user_documents(user_id)
        
        return {
            "success": True,
            "data": documents,
            "total": len(documents)
        }
    except Exception as e:
        logger.error(f"List documents error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/{document_id}")
async def update_document(
    document_id: str,
    status_update: Optional[str] = None,
    ocr_text: Optional[str] = None,
    fraud_score: Optional[float] = None,
    current_user: dict = Depends(get_current_user)
):
    """Update document metadata"""
    try:
        updates = {}
        if status_update:
            updates["status"] = status_update
        if ocr_text:
            updates["ocr_text"] = ocr_text
        if fraud_score is not None:
            updates["fraud_score"] = fraud_score
        
        if not updates:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No updates provided"
            )
        
        document = await supabase_service.update_document(document_id, updates)
        
        return {
            "success": True,
            "message": "Document updated successfully",
            "data": document
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update document error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete document and file"""
    try:
        success = await supabase_service.delete_document(document_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete document error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/{document_id}/download")
async def get_download_url(
    document_id: str,
    expires_in: int = 3600,
    current_user: dict = Depends(get_current_user)
):
    """Generate signed URL for secure document download"""
    try:
        signed_url = await supabase_service.create_signed_url(document_id, expires_in)
        
        return {
            "success": True,
            "data": {
                "signed_url": signed_url,
                "expires_in": expires_in
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Generate signed URL error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

