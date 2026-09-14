import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_pizzas():
    response = client.get("/api/pizzas")
    assert response.status_code == 200
    pizzas = response.json()
    assert len(pizzas) >= 5
    assert any(p["name"] == "Margherita Classica" for p in pizzas)

def test_get_custom_options():
    response = client.get("/api/pizzas/custom-options")
    assert response.status_code == 200
    data = response.json()
    assert len(data["bases"]) == 5
    assert len(data["sauces"]) == 5
    assert len(data["cheeses"]) >= 4
    assert len(data["vegetables"]) >= 6

def test_user_login():
    response = client.post("/api/auth/login", json={
        "email": "user@pizzahub.com",
        "password": "user123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "user"

def test_admin_login():
    response = client.post("/api/auth/admin/login", json={
        "email": "admin@pizzahub.com",
        "password": "admin123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"

def test_invalid_login():
    response = client.post("/api/auth/login", json={
        "email": "user@pizzahub.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_regular_user_cannot_access_admin_login():
    response = client.post("/api/auth/admin/login", json={
        "email": "user@pizzahub.com",
        "password": "user123"
    })
    assert response.status_code == 403

def test_inventory_list():
    response = client.get("/api/inventory")
    assert response.status_code == 200
    items = response.json()
    assert len(items) > 10
