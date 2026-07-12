"""
Authentication API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, SecurityUtils
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    VerifyEmailRequest,
    VerifyPhoneRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
    EnableMFARequest,
    EnableMFAResponse,
    VerifyMFARequest,
    FirebaseSyncRequest,
)
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService
from app.services.user_service import UserService
from app.core.config import settings

router = APIRouter()


@router.post("/firebase/sync", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def sync_firebase_user(
    request: FirebaseSyncRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Sync Firebase user to database (called after Firebase Auth registration)
    """
    from app.models.user import UserRole
    import secrets
    
    logger.info(f"[Auth] Syncing Firebase user: {request.email} (uid={request.firebase_uid})")
    
    # Check if user already exists by Firebase UID
    existing_user = await UserService.get_user_by_firebase_uid(db, request.firebase_uid)
    if existing_user:
        # Update last login
        from sqlalchemy import update
        from app.models.user import User
        from datetime import datetime
        await db.execute(
            update(User)
            .where(User.firebase_uid == request.firebase_uid)
            .values(
                last_login_at=datetime.utcnow(),
                is_email_verified=request.email_verified if request.email_verified else existing_user.is_email_verified
            )
        )
        await db.commit()
        await db.refresh(existing_user)
        logger.info(f"[Auth] Updated existing user: {request.email}")
        return existing_user
    
    # Check if email already exists (without Firebase UID)
    existing_email = await UserService.get_user_by_email(db, request.email)
    if existing_email:
        # Link Firebase UID to existing account
        from sqlalchemy import update
        from app.models.user import User
        from datetime import datetime
        await db.execute(
            update(User)
            .where(User.id == existing_email.id)
            .values(
                firebase_uid=request.firebase_uid,
                last_login_at=datetime.utcnow(),
                is_email_verified=request.email_verified if request.email_verified else existing_email.is_email_verified
            )
        )
        await db.commit()
        await db.refresh(existing_email)
        logger.info(f"[Auth] Linked Firebase UID to existing user: {request.email}")
        return existing_email
    
    # Create new user
    from app.models.user import User
    from datetime import datetime
    
    try:
        role_enum = UserRole[request.role.upper()]
    except KeyError:
        role_enum = UserRole.COMPANY
        logger.warning(f"[Auth] Unknown role '{request.role}', defaulting to COMPANY")
    
    user = User(
        firebase_uid=request.firebase_uid,
        email=request.email,
        password_hash=SecurityUtils.hash_password(secrets.token_urlsafe(32)),
        first_name=request.first_name,
        last_name=request.last_name,
        role=role_enum,
        phone=request.phone,
        avatar_url=request.photo_url,
        is_email_verified=request.email_verified,
        is_active=True,
        is_approved=(role_enum != UserRole.NOTARY),
        last_login_at=datetime.utcnow()
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    logger.info(f"[Auth] Created new user: {request.email} (uid={request.firebase_uid})")
    return user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: UserRegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user
    
    - **email**: Valid email address
    - **password**: Strong password (min 8 chars, uppercase, lowercase, digit)
    - **first_name**: User's first name
    - **last_name**: User's last name
    - **phone**: Phone number (optional)
    - **role**: User role (company, notary, bank, admin)
    """
    # Check if user already exists
    existing_user = await UserService.get_user_by_email(db, request.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check phone if provided
    if request.phone:
        existing_phone = await UserService.get_user_by_phone(db, request.phone)
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already registered"
            )
    
    # Create user
    user = await UserService.create_user(
        db=db,
        email=request.email,
        password=request.password,
        first_name=request.first_name,
        last_name=request.last_name,
        role=request.role,
        phone=request.phone
    )
    
    # Send verification email
    await AuthService.send_verification_email(user)
    
    return user


@router.post("/login", response_model=TokenResponse)
async def login(
    request: UserLoginRequest,
    req: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Login with email and password
    
    - **email**: User's email
    - **password**: User's password
    - **mfa_code**: MFA code (required if MFA is enabled)
    """
    user, access_token, refresh_token = await AuthService.authenticate_user(
        db=db,
        email=request.email,
        password=request.password,
        mfa_code=request.mfa_code,
        request=req
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh access token using refresh token
    
    - **refresh_token**: Valid refresh token
    """
    new_access_token, new_refresh_token = await AuthService.refresh_access_token(
        db=db,
        refresh_token=request.refresh_token
    )
    
    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Logout current user
    
    Requires authentication.
    """
    await AuthService.logout(current_user["sub"])
    return {"message": "Logged out successfully"}


@router.post("/verify-email")
async def verify_email(
    request: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Verify email address with token
    
    - **token**: Email verification token
    """
    success = await AuthService.verify_email_token(db, request.token)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    return {"message": "Email verified successfully"}


@router.post("/resend-verification")
async def resend_verification(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """
    Resend email verification
    
    Requires authentication.
    """
    user = await UserService.get_user_by_id(db, current_user["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.is_email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    await AuthService.send_verification_email(user)
    return {"message": "Verification email sent"}


@router.post("/verify-phone")
async def verify_phone(
    request: VerifyPhoneRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Verify phone number with OTP
    
    - **phone**: Phone number
    - **otp**: 6-digit OTP code
    """
    success = await AuthService.verify_phone_otp(db, request.phone, request.otp)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    
    return {"message": "Phone verified successfully"}


@router.post("/send-phone-otp")
async def send_phone_otp(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """
    Send phone OTP
    
    Requires authentication.
    """
    user = await UserService.get_user_by_id(db, current_user["sub"])
    if not user or not user.phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number not found"
        )
    
    await AuthService.send_phone_otp(user.phone)
    return {"message": "OTP sent to phone"}


@router.post("/forgot-password")
async def forgot_password(
    request: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Request password reset
    
    - **email**: User's email address
    """
    user = await UserService.get_user_by_email(db, request.email)
    if user:
        # Always send token even if user doesn't exist (security best practice)
        await AuthService.send_password_reset_email(user)
    
    return {"message": "If the email exists, a password reset link has been sent"}


@router.post("/reset-password")
async def reset_password(
    token: str,
    new_password: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Reset password with token
    
    - **token**: Password reset token
    - **new_password**: New password
    """
    success = await AuthService.reset_password(db, token, new_password)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    return {"message": "Password reset successfully"}


@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Change password
    
    Requires authentication.
    
    - **old_password**: Current password
    - **new_password**: New password
    """
    user = await UserService.get_user_by_id(db, current_user["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify old password
    from app.core.security import SecurityUtils
    if not SecurityUtils.verify_password(request.old_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid current password"
        )
    
    # Update password
    success = await UserService.update_password(db, user.id, request.new_password)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password"
        )
    
    return {"message": "Password changed successfully"}


@router.post("/enable-mfa", response_model=EnableMFAResponse)
async def enable_mfa(
    request: EnableMFARequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Enable MFA for user
    
    Requires authentication.
    
    - **password**: User's password for confirmation
    """
    user = await UserService.get_user_by_id(db, current_user["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify password
    from app.core.security import SecurityUtils
    if not SecurityUtils.verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password"
        )
    
    if user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA already enabled"
        )
    
    # Generate MFA secret
    mfa_secret = AuthService.generate_mfa_secret()
    qr_code_url = AuthService.generate_mfa_qr_code(user.email, mfa_secret)
    backup_codes = AuthService.generate_backup_codes()
    
    # Enable MFA
    await UserService.enable_mfa(db, user.id, mfa_secret)
    
    return EnableMFAResponse(
        mfa_secret=mfa_secret,
        qr_code_url=qr_code_url,
        backup_codes=backup_codes
    )


@router.post("/verify-mfa")
async def verify_mfa(
    request: VerifyMFARequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Verify MFA code
    
    Requires authentication.
    
    - **code**: 6-digit MFA code
    """
    user = await UserService.get_user_by_id(db, current_user["sub"])
    if not user or not user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA not enabled"
        )
    
    if not AuthService.verify_mfa_code(user.mfa_secret, request.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid MFA code"
        )
    
    return {"message": "MFA code verified"}


@router.post("/disable-mfa")
async def disable_mfa(
    password: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Disable MFA
    
    Requires authentication.
    
    - **password**: User's password for confirmation
    """
    user = await UserService.get_user_by_id(db, current_user["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify password
    from app.core.security import SecurityUtils
    if not SecurityUtils.verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password"
        )
    
    await UserService.disable_mfa(db, user.id)
    return {"message": "MFA disabled successfully"}


@router.get("/oauth/google")
async def google_oauth_login(redirect_uri: str):
    """
    Initiate Google OAuth login
    
    - **redirect_uri**: Callback URL after authentication
    """
    from app.services.oauth_service import OAuthService
    import secrets
    
    # Generate state for CSRF protection
    state = secrets.token_urlsafe(32)
    
    # Store state in Redis (expires in 10 minutes)
    from app.services.redis_service import redis_service
    await redis_service.set(f"oauth_state:{state}", redirect_uri, expire=600)
    
    auth_url = OAuthService.get_google_auth_url(redirect_uri, state)
    return {"authorization_url": auth_url, "state": state}


@router.get("/oauth/google/callback")
async def google_oauth_callback(
    code: str,
    state: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Google OAuth callback
    
    - **code**: Authorization code from Google
    - **state**: State parameter for CSRF protection
    """
    from app.services.oauth_service import OAuthService
    from app.services.redis_service import redis_service
    from app.models.user import UserRole
    
    # Verify state
    stored_redirect_uri = await redis_service.get(f"oauth_state:{state}")
    if not stored_redirect_uri:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired state parameter"
        )
    
    # Delete state
    await redis_service.delete(f"oauth_state:{state}")
    
    # Get user info from Google
    user_info = await OAuthService.get_google_user_info(code, stored_redirect_uri)
    
    # Check if user exists
    user = await UserService.get_user_by_email(db, user_info["email"])
    
    if not user:
        # Create new user
        user = await UserService.create_user(
            db=db,
            email=user_info["email"],
            password=secrets.token_urlsafe(32),  # Random password
            first_name=user_info["first_name"],
            last_name=user_info["last_name"],
            role=UserRole.COMPANY,
        )
        
        # Mark email as verified
        await UserService.verify_email(db, user.id)
    
    # Update Google ID if not set
    if not user.google_id and user_info.get("google_id"):
        from sqlalchemy import update
        from app.models.user import User
        await db.execute(
            update(User)
            .where(User.id == user.id)
            .values(google_id=user_info["google_id"])
        )
        await db.commit()
    
    # Generate tokens
    access_token = SecurityUtils.create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role.value}
    )
    refresh_token = SecurityUtils.create_refresh_token(
        data={"sub": str(user.id)}
    )
    
    # Store refresh token
    await redis_service.set(
        f"refresh_token:{user.id}",
        refresh_token,
        expire=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.get("/oauth/microsoft")
async def microsoft_oauth_login(redirect_uri: str):
    """
    Initiate Microsoft OAuth login
    
    - **redirect_uri**: Callback URL after authentication
    """
    from app.services.oauth_service import OAuthService
    import secrets
    
    # Generate state for CSRF protection
    state = secrets.token_urlsafe(32)
    
    # Store state in Redis (expires in 10 minutes)
    from app.services.redis_service import redis_service
    await redis_service.set(f"oauth_state:{state}", redirect_uri, expire=600)
    
    auth_url = OAuthService.get_microsoft_auth_url(redirect_uri, state)
    return {"authorization_url": auth_url, "state": state}


@router.get("/oauth/microsoft/callback")
async def microsoft_oauth_callback(
    code: str,
    state: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Microsoft OAuth callback
    
    - **code**: Authorization code from Microsoft
    - **state**: State parameter for CSRF protection
    """
    from app.services.oauth_service import OAuthService
    from app.services.redis_service import redis_service
    from app.models.user import UserRole
    import secrets
    
    # Verify state
    stored_redirect_uri = await redis_service.get(f"oauth_state:{state}")
    if not stored_redirect_uri:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired state parameter"
        )
    
    # Delete state
    await redis_service.delete(f"oauth_state:{state}")
    
    # Get user info from Microsoft
    user_info = await OAuthService.get_microsoft_user_info(code, stored_redirect_uri)
    
    # Check if user exists
    user = await UserService.get_user_by_email(db, user_info["email"])
    
    if not user:
        # Create new user
        user = await UserService.create_user(
            db=db,
            email=user_info["email"],
            password=secrets.token_urlsafe(32),  # Random password
            first_name=user_info["first_name"],
            last_name=user_info["last_name"],
            role=UserRole.COMPANY,
        )
        
        # Mark email as verified
        await UserService.verify_email(db, user.id)
    
    # Update Microsoft ID if not set
    if not user.microsoft_id and user_info.get("microsoft_id"):
        from sqlalchemy import update
        from app.models.user import User
        await db.execute(
            update(User)
            .where(User.id == user.id)
            .values(microsoft_id=user_info["microsoft_id"])
        )
        await db.commit()
    
    # Generate tokens
    from app.core.security import SecurityUtils
    access_token = SecurityUtils.create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role.value}
    )
    refresh_token = SecurityUtils.create_refresh_token(
        data={"sub": str(user.id)}
    )
    
    # Store refresh token
    await redis_service.set(
        f"refresh_token:{user.id}",
        refresh_token,
        expire=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
