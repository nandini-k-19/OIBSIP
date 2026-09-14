import urllib.request
import json
import asyncio
import websockets
import uuid

async def run_e2e():
    print("==================================================")
    print("  PIZZAHUB E2E SYSTEM INTEGRATION TEST")
    print("==================================================")

    # 1. Customer Login
    login_req = urllib.request.Request(
        "http://localhost:8000/api/auth/login",
        data=json.dumps({"email": "user@pizzahub.com", "password": "user123"}).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(login_req) as resp:
        user_auth = json.loads(resp.read())
        user_token = user_auth["access_token"]
        user_id = user_auth["user"]["id"]
        print(f"[1] Customer Login: SUCCESS (User ID: {user_id})")

    # 2. Query Custom Options
    with urllib.request.urlopen("http://localhost:8000/api/pizzas/custom-options") as resp:
        opts = json.loads(resp.read())
        base = opts["bases"][0]
        sauce = opts["sauces"][0]
        cheese = opts["cheeses"][0]
        veg = opts["vegetables"][0]
        initial_base_stock = base["stock"]
        print(f"[2] Selected Ingredients: {base['name']} (Stock: {initial_base_stock}), {sauce['name']}, {cheese['name']}, {veg['name']}")

    # 3. Create Custom Order
    order_data = {
        "customer_name": "Alex Customer",
        "customer_phone": "9876543210",
        "delivery_address": "Suite 101, Tech Park, Bangalore",
        "items": [{
            "pizza_name": f"Custom {base['name']}",
            "quantity": 1,
            "is_custom": True,
            "customization": {
                "base_id": base["id"],
                "sauce_id": sauce["id"],
                "cheese_id": cheese["id"],
                "vegetable_ids": [veg["id"]]
            }
        }]
    }
    order_req = urllib.request.Request(
        "http://localhost:8000/api/orders",
        data=json.dumps(order_data).encode(),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {user_token}"}
    )
    with urllib.request.urlopen(order_req) as resp:
        order = json.loads(resp.read())
        order_id = order["id"]
        print(f"[3] Placed Pending Order #{order['order_number']} (ID: {order_id}, Grand Total: INR {order['grand_total']})")

    # 4. Connect WebSocket to listen for live updates
    ws_uri = f"ws://localhost:8000/ws/orders/{order_id}"
    async with websockets.connect(ws_uri) as ws:
        print(f"[4] WebSocket Connected for live tracking: {ws_uri}")

        # 5. Create Razorpay Test Order
        pay_create_req = urllib.request.Request(
            "http://localhost:8000/api/payments/create",
            data=json.dumps({"order_id": order_id}).encode(),
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {user_token}"}
        )
        with urllib.request.urlopen(pay_create_req) as resp:
            rzp = json.loads(resp.read())
            print(f"[5] Generated Razorpay Payment Order: {rzp['razorpay_order_id']}")

        # 6. Verify Payment (triggers safe DB transaction & inventory decrement)
        verify_req = urllib.request.Request(
            "http://localhost:8000/api/payments/verify",
            data=json.dumps({
                "order_id": order_id,
                "razorpay_order_id": rzp["razorpay_order_id"],
                "razorpay_payment_id": f"pay_live_{order_id}_{uuid.uuid4().hex[:6]}",
                "razorpay_signature": "mock_signature"
            }).encode(),
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {user_token}"}
        )
        with urllib.request.urlopen(verify_req) as resp:
            paid_order = json.loads(resp.read())
            print(f"[6] Payment Verified! Status: {paid_order['status']}, Payment Status: {paid_order['payment_status']}")

        # Receive WS event for payment confirmation
        try:
            msg = await asyncio.wait_for(ws.recv(), timeout=2.0)
            print(f"    -> WebSocket Live Event Received: {msg}")
        except Exception:
            pass

        # 7. Verify Inventory Decrement in Database
        with urllib.request.urlopen("http://localhost:8000/api/pizzas/custom-options") as resp:
            opts_after = json.loads(resp.read())
            new_base_stock = [b for b in opts_after["bases"] if b["id"] == base["id"]][0]["stock"]
            print(f"[7] Safe Inventory Decrement Verified: Base stock went from {initial_base_stock} -> {new_base_stock}")
            assert new_base_stock == initial_base_stock - 1, "Stock deduction error!"

        # 8. Admin Login
        admin_login_req = urllib.request.Request(
            "http://localhost:8000/api/auth/admin/login",
            data=json.dumps({"email": "admin@pizzahub.com", "password": "admin123"}).encode(),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(admin_login_req) as resp:
            admin_auth = json.loads(resp.read())
            admin_token = admin_auth["access_token"]
            print("[8] Admin Login: SUCCESS (Role: admin)")

        # 9. Admin Transitions Status -> IN_KITCHEN
        kitchen_req = urllib.request.Request(
            f"http://localhost:8000/api/admin/orders/{order_id}/status",
            data=json.dumps({"status": "IN_KITCHEN"}).encode(),
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {admin_token}"},
            method="PATCH"
        )
        with urllib.request.urlopen(kitchen_req) as resp:
            updated = json.loads(resp.read())
            print(f"[9] Admin Updated Status: {updated['status']}")

        msg = await asyncio.wait_for(ws.recv(), timeout=2.0)
        print(f"    -> WebSocket Live Event Received: {msg}")

        # 10. Admin Transitions Status -> SENT_TO_DELIVERY
        delivery_req = urllib.request.Request(
            f"http://localhost:8000/api/admin/orders/{order_id}/status",
            data=json.dumps({"status": "SENT_TO_DELIVERY"}).encode(),
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {admin_token}"},
            method="PATCH"
        )
        with urllib.request.urlopen(delivery_req) as resp:
            updated = json.loads(resp.read())
            print(f"[10] Admin Dispatched to Fleet: {updated['status']}")

        msg = await asyncio.wait_for(ws.recv(), timeout=2.0)
        print(f"    -> WebSocket Live Event Received: {msg}")

        # 11. Admin Transitions Status -> DELIVERED
        delivered_req = urllib.request.Request(
            f"http://localhost:8000/api/admin/orders/{order_id}/status",
            data=json.dumps({"status": "DELIVERED"}).encode(),
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {admin_token}"},
            method="PATCH"
        )
        with urllib.request.urlopen(delivered_req) as resp:
            updated = json.loads(resp.read())
            print(f"[11] Admin Marked Delivered: {updated['status']}")

        msg = await asyncio.wait_for(ws.recv(), timeout=2.0)
        print(f"    -> WebSocket Live Event Received: {msg}")

    print("==================================================")
    print("  ALL 11 END-TO-END SYSTEM STEPS PASSED 100%!")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_e2e())
