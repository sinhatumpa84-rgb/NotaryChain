"""
API v1 router
"""
from fastapi import APIRouter

from app.api.v1 import auth, users, companies, documents, notary, admin

api_router = APIRouter()

# Include sub-routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(companies.router, prefix="/companies", tags=["Companies"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
api_router.include_router(notary.router, prefix="/notary", tags=["Notary"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])

__all__ = ["api_router"]
