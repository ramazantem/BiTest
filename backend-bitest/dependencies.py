from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from .auth import verify_access_token
from sqlalchemy.orm import Session
from .database import SessionLocal
from . import crud

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Kimlik doğrulama başarısız.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = verify_access_token(token)
    if payload is None:
        raise credentials_exception
    user = db.query(crud.models.User).filter_by(id=payload.get("user_id")).first()
    if user is None:
        raise credentials_exception
    return user

def require_role(role: str):
    def role_checker(user = Depends(get_current_user)):
        if user.role != role:
            raise HTTPException(status_code=403, detail="Yetkisiz erişim.")
        return user
    return role_checker 