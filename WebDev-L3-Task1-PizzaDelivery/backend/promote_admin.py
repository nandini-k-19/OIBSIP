import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, Base, engine
from app.models.user import User, UserRole
from app.models.admin import Admin
from app.auth.passwords import hash_password

def promote_or_create_admin(email, password='admin123', full_name='Authorized Admin'):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email.strip().lower()).first()
        if user:
            user.role = UserRole.ADMIN
            user.is_verified = True
            if password:
                user.hashed_password = hash_password(password)
            print(f'Promoted existing user {email} to ADMIN role.')
        else:
            user = User(
                full_name=full_name,
                email=email.strip().lower(),
                hashed_password=hash_password(password),
                role=UserRole.ADMIN,
                is_verified=True
            )
            db.add(user)
            db.flush()
            print(f'Created new ADMIN user {email}.')

        admin_record = db.query(Admin).filter(Admin.user_id == user.id).first()
        if not admin_record:
            db.add(Admin(user_id=user.id, department='Executive Management', permissions='all'))
        db.commit()
        print('Admin setup complete and committed successfully.')
    finally:
        db.close()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python promote_admin.py <email> [password] [full_name]')
        sys.exit(1)
    email = sys.argv[1]
    password = sys.argv[2] if len(sys.argv) > 2 else 'admin123'
    name = sys.argv[3] if len(sys.argv) > 3 else 'Authorized Admin'
    promote_or_create_admin(email, password, name)
