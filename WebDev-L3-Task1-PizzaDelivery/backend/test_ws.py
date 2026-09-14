import asyncio
import websockets
import urllib.request
import json

async def test_websocket_tracking():
    order_id = 2
    ws_uri = f"ws://localhost:8000/ws/orders/{order_id}"
    
    print(f"[1] Connecting to WebSocket: {ws_uri} ...")
    async with websockets.connect(ws_uri) as ws:
        print("[2] WebSocket Connected! Listening for real-time broadcasts...")

        # Admin logs in and updates Order status to IN_KITCHEN
        login_req = urllib.request.Request(
            "http://localhost:8000/api/auth/admin/login",
            data=json.dumps({"email": "admin@pizzahub.com", "password": "admin123"}).encode(),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(login_req) as resp:
            admin_token = json.loads(resp.read())["access_token"]

        patch_req = urllib.request.Request(
            f"http://localhost:8000/api/admin/orders/{order_id}/status",
            data=json.dumps({"status": "SENT_TO_DELIVERY"}).encode(),
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {admin_token}"},
            method="PATCH"
        )
        with urllib.request.urlopen(patch_req) as resp:
            print("[3] Admin updated order status to 'SENT_TO_DELIVERY'")

        # Receive WebSocket message
        msg = await asyncio.wait_for(ws.recv(), timeout=5.0)
        print(f"[4] Real-time WebSocket Event Received:\n    {msg}")

if __name__ == "__main__":
    asyncio.run(test_websocket_tracking())
