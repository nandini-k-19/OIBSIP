from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.jwt import get_current_user
from app.database import get_db
from app.models.user import User, UserRole


def get_db_session(
    db: Session = Depends(get_db)
) -> Session:
    """
    Provides a database session for API endpoints.
    """
    return db


def require_authenticated_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Allows access only to authenticated users.
    """
    return current_user


def require_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Allows access only to users with the ADMIN role.
    """

    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden. Admin role required."
        )

    return current_user


def require_verified_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Allows access only to authenticated and verified users.
    """

    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before accessing this resource."
        )

    return current_user


def require_verified_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Allows access only to verified administrators.
    """

    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden. Admin role required."
        )

    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin email must be verified."
        )

    return current_user