from sqlalchemy.orm import Session
from . import models
from passlib.context import CryptContext
import secrets

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, username: str, email: str, password: str):
    hashed_password = get_password_hash(password)
    verification_token = secrets.token_urlsafe(32)
    db_user = models.User(
        username=username,
        email=email,
        hashed_password=hashed_password,
        verification_token=verification_token
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def set_user_admin(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        user.role = "admin"
        db.commit()
        db.refresh(user)
    return user

def delete_user(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        db.delete(user)
        db.commit()
        return True
    return False

def delete_test(db: Session, test_id: int):
    test = db.query(models.Test).filter(models.Test.id == test_id).first()
    if test:
        db.delete(test)
        db.commit()
        return True
    return False 