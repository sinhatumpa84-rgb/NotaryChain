"""
Authentication endpoint tests
"""
import pytest
from httpx import AsyncClient
from fastapi import status


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Test health check endpoint"""
    response = await client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "service" in data
    assert "version" in data


@pytest.mark.asyncio
async def test_register_user(client: AsyncClient):
    """Test user registration"""
    user_data = {
        "email": "test@example.com",
        "password": "TestPass123!",
        "first_name": "Test",
        "last_name": "User",
        "role": "company"
    }
    
    response = await client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == user_data["email"]
    assert data["first_name"] == user_data["first_name"]
    assert "id" in data


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    """Test registering with duplicate email"""
    user_data = {
        "email": "duplicate@example.com",
        "password": "TestPass123!",
        "first_name": "Test",
        "last_name": "User",
        "role": "company"
    }
    
    # First registration
    await client.post("/api/v1/auth/register", json=user_data)
    
    # Second registration with same email
    response = await client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.asyncio
async def test_login(client: AsyncClient):
    """Test user login"""
    # Register user first
    user_data = {
        "email": "login@example.com",
        "password": "TestPass123!",
        "first_name": "Test",
        "last_name": "User",
        "role": "company"
    }
    await client.post("/api/v1/auth/register", json=user_data)
    
    # Login
    login_data = {
        "email": user_data["email"],
        "password": user_data["password"]
    }
    response = await client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    """Test login with invalid credentials"""
    login_data = {
        "email": "nonexistent@example.com",
        "password": "WrongPass123!"
    }
    response = await client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.asyncio
async def test_get_current_user(client: AsyncClient):
    """Test getting current user profile"""
    # Register and login
    user_data = {
        "email": "profile@example.com",
        "password": "TestPass123!",
        "first_name": "Test",
        "last_name": "User",
        "role": "company"
    }
    await client.post("/api/v1/auth/register", json=user_data)
    
    login_response = await client.post("/api/v1/auth/login", json={
        "email": user_data["email"],
        "password": user_data["password"]
    })
    token = login_response.json()["access_token"]
    
    # Get profile
    response = await client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == user_data["email"]
