"""
User management API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.user import UserResponse, UserUpdateRequest, UserKYCRequest
from app.services.user_service import UserService
from app.models.user import UserRole

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current user profile
    
    Requires authentication.
    """
    user = await UserService.get_user_by_id(db, current_user["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    update_data: UserUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update current user profile
    
    Requires authentication.
    
    - **first_name**: First name
    - **last_name**: Last name
    - **phone**: Phone number
    - **avatar_url**: Avatar URL
    """
    user = await UserService.update_user(db, current_user["sub"], update_data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get user by ID
    
    Requires authentication.
    Only admins can view other users.
    """
    # Check if user is admin or viewing own profile
    if str(user_id) != current_user["sub"] and current_user["role"] not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this user"
        )
    
    user = await UserService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    update_data: UserUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update user by ID
    
    Requires authentication.
    Only admins or the user themselves can update.
    """
    # Check if user is admin or updating own profile
    if str(user_id) != current_user["sub"] and current_user["role"] not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user"
        )
    
    user = await UserService.update_user(db, user_id, update_data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.delete("/{user_id}")
async def delete_user(
    user_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete user (soft delete)
    
    Requires authentication.
    Only admins can delete users.
    """
    # Check if user is admin
    if current_user["role"] not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete users"
        )
    
    # TODO: Implement soft delete
    # For now, return success message
    return {"message": "User deleted successfully"}


@router.post("/kyc/verify")
async def verify_kyc(
    kyc_data: UserKYCRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Submit KYC verification
    
    Requires authentication.
    
    - **aadhaar_number**: Aadhaar number (12 digits)
    - **pan_number**: PAN number (10 characters)
    - **passport_number**: Passport number
    - **document_front_url**: Document front image URL
    - **document_back_url**: Document back image URL
    - **selfie_url**: Selfie image URL
    """
    from app.services.biometric_service import BiometricService
    from pathlib import Path
    import tempfile
    
    user = await UserService.get_user_by_id(db, current_user["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # TODO: Download images from URLs to temp files
    # For now, assuming URLs are local file paths for testing
    
    try:
        # Step 1: Validate document quality
        doc_valid, doc_metrics = BiometricService.validate_document_photo_quality(
            kyc_data.document_front_url
        )
        
        if not doc_valid:
            return {
                "message": "Document quality check failed",
                "status": "rejected",
                "reason": "poor_document_quality",
                "details": doc_metrics
            }
        
        # Step 2: Extract face from document
        temp_dir = Path(tempfile.gettempdir())
        doc_face_path = temp_dir / f"doc_face_{user.id}.jpg"
        
        face_extracted = BiometricService.extract_face_from_document(
            kyc_data.document_front_url,
            str(doc_face_path)
        )
        
        if not face_extracted:
            return {
                "message": "Could not extract face from document",
                "status": "rejected",
                "reason": "no_face_in_document"
            }
        
        # Step 3: Encode face from document
        doc_face_encoding = BiometricService.encode_face(str(doc_face_path))
        
        if not doc_face_encoding:
            return {
                "message": "Could not encode face from document",
                "status": "rejected",
                "reason": "face_encoding_failed"
            }
        
        # Step 4: Verify selfie with liveness and face match
        verification_result = await BiometricService.verify_face_with_liveness(
            doc_face_encoding,
            kyc_data.selfie_url
        )
        
        if not verification_result["verified"]:
            return {
                "message": "Face verification failed",
                "status": "rejected",
                "reason": "face_mismatch" if not verification_result["face_match"] else "liveness_failed",
                "details": verification_result
            }
        
        # Step 5: Update user record
        from sqlalchemy import update
        from app.models.user import User
        
        await db.execute(
            update(User)
            .where(User.id == user.id)
            .values(
                is_identity_verified=True,
                face_encoding=doc_face_encoding,
                aadhaar_number=kyc_data.aadhaar_number,
                pan_number=kyc_data.pan_number,
                passport_number=kyc_data.passport_number,
            )
        )
        await db.commit()
        
        # Clean up temp files
        if doc_face_path.exists():
            doc_face_path.unlink()
        
        return {
            "message": "KYC verification completed successfully",
            "status": "approved",
            "verification_details": {
                "liveness_passed": verification_result["liveness_passed"],
                "face_match": verification_result["face_match"],
                "match_score": verification_result["match_score"],
                "document_quality": doc_metrics
            }
        }
    except Exception as e:
        logger.error(f"KYC verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"KYC verification failed: {str(e)}"
        )


@router.post("/face/verify")
async def verify_face(
    selfie_url: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Verify face with liveness detection
    
    Requires authentication.
    
    - **selfie_url**: Selfie image URL or path
    """
    from app.services.biometric_service import BiometricService
    
    user = await UserService.get_user_by_id(db, current_user["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.face_encoding:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No face encoding on file. Please complete KYC verification first."
        )
    
    try:
        # Verify face with liveness
        result = await BiometricService.verify_face_with_liveness(
            user.face_encoding,
            selfie_url
        )
        
        if not result["verified"]:
            return {
                "message": "Face verification failed",
                "verified": False,
                "liveness_passed": result["liveness_passed"],
                "face_match": result["face_match"],
                "match_score": result["match_score"]
            }
        
        return {
            "message": "Face verification completed successfully",
            "verified": True,
            "liveness_passed": result["liveness_passed"],
            "face_match": result["face_match"],
            "match_score": result["match_score"],
            "details": result.get("liveness_details", {})
        }
    except Exception as e:
        logger.error(f"Face verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Face verification failed: {str(e)}"
        )
