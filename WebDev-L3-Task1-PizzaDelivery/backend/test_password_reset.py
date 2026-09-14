import urllib.request
import json
from app.database import SessionLocal
from app.models.user import PasswordResetToken

def test_password_reset():
    # 1. Request forgot password
    req = urllib.request.Request(
        "http://localhost:8000/api/auth/forgot-password",
        data=json.dumps({"email": "user@pizzahub.com"}).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        msg = json.loads(resp.read())["message"]
        print(f"[1] Forgot Password Requested: {msg}")

    # 2. Retrieve the generated token from database
    db = SessionLocal()
    token_obj = db.query(PasswordResetToken).order_by(PasswordResetToken.created_at.desc()).first()
    token = token_obj.token
    db.close()

    # 3. Submit reset password
    reset_req = urllib.request.Request(
        "http://localhost:8000/api/auth/reset-password",
        data=json.dumps({"token": token, "new_password": "user123"}).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(reset_req) as resp:
        msg = json.loads(resp.read())["message"]
        print(f"[2] Reset Password Response: {msg}")

    # 4. Verify login with the updated password
    login_req = urllib.request.Request(
        "http://localhost:8000/api/auth/login",
        data=json.dumps({"email": "user@pizzahub.com", "password": "user123"}).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(login_req) as resp:
        data = json.loads(resp.read())
        if "access_token" in data:
            print("[3] Login with Updated Password: SUCCESS (Token Received)")
        else:
            print("[3] Login with Updated Password: FAILED")

if __name__ == "__main__":
    test_password_reset()
