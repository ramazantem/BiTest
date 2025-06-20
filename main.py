from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .database import init_db, SessionLocal
from . import schemas, crud
from .email_utils import send_verification_email
from .auth import create_access_token
from pydantic import BaseModel
from .dependencies import get_current_user, require_role
from .models import Test, TestResult
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Geliştirme için tüm originlere izin ver
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Veritabanı oturumu bağımlılığı

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "BiTest API'ye hoş geldiniz!"}

init_db()

