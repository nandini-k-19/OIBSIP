from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_websocket_tracking():
    order_id = 1
    with client.websocket_connect(f"/ws/orders/{order_id}") as websocket:
        websocket.send_text("ping")
        data = websocket.receive_text()
        assert data == "pong"

