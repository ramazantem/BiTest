from fastapi import FastAPI, Depends, HTTPException, status, Body
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
    allow_origins=["*"],  # Geliştirme için tüm originlere izin ver (Frontend)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email zaten kayıtlı.")
    new_user = crud.create_user(db, username=user.username, email=user.email, password=user.password)
    send_verification_email(new_user.email, new_user.username, new_user.verification_token)
    return new_user

@app.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    user = db.query(crud.models.User).filter_by(verification_token=token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Geçersiz veya süresi dolmuş doğrulama linki.")
    user.is_verified = True
    user.verification_token = None
    db.commit()
    return {"message": "Email başarıyla doğrulandı."}

class Token(BaseModel):
    access_token: str
    token_type: str

@app.post("/login", response_model=Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if not db_user or not crud.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Geçersiz email veya şifre.")
    if not db_user.is_verified:
        raise HTTPException(status_code=403, detail="Email doğrulanmamış.")
    access_token = create_access_token({"user_id": db_user.id, "role": db_user.role})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/tests", response_model=schemas.TestOut)
def create_test(test: schemas.TestCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_test = Test(
        title=test.title,
        description=test.description,
        questions=json.dumps(test.questions),
        owner_id=current_user.id
    )
    db.add(db_test)
    db.commit()
    db.refresh(db_test)
    return db_test

@app.get("/tests", response_model=list[schemas.TestOut])
def list_tests(db: Session = Depends(get_db)):
    tests = db.query(Test).all()
    for t in tests:
        t.questions = json.loads(t.questions)
    return tests

@app.post("/tests/{test_id}/solve", response_model=schemas.TestResultOut)
def solve_test(test_id: int, answers: schemas.TestResultCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    test = db.query(Test).filter_by(id=test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test bulunamadı.")
    db_result = TestResult(
        user_id=current_user.id,
        test_id=test.id,
        answers=json.dumps(answers.answers),
        score=answers.score
    )
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    db_result.answers = json.loads(db_result.answers)
    return db_result

@app.post("/set-admin/{user_id}")
def set_admin(user_id: int, db: Session = Depends(get_db), current_user = Depends(require_role("admin"))):
    user = crud.set_user_admin(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    return {"message": f"{user.username} artık admin."}

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user = Depends(require_role("admin"))):
    if not crud.delete_user(db, user_id):
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    return {"message": "Kullanıcı silindi."}

@app.delete("/tests/{test_id}")
def delete_test(test_id: int, db: Session = Depends(get_db), current_user = Depends(require_role("admin"))):
    if not crud.delete_test(db, test_id):
        raise HTTPException(status_code=404, detail="Test bulunamadı.")
    return {"message": "Test silindi."}

@app.get("/my-results", response_model=list[schemas.TestResultOut])
def get_my_results(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    results = db.query(TestResult).filter_by(user_id=current_user.id).all()
    results = [r for r in results if r.test_id is not None]
    for r in results:
        r.answers = json.loads(r.answers)
    return results

@app.get("/users", response_model=list[schemas.UserOut])
def list_users(db: Session = Depends(get_db), current_user = Depends(require_role("admin"))):
    return db.query(crud.models.User).all()

@app.put("/users/{user_id}", response_model=schemas.UserOut)
def update_user(user_id: int, data: dict = Body(...), db: Session = Depends(get_db), current_user = Depends(require_role("admin"))):
    user = db.query(crud.models.User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    for key in ["username", "email", "role", "is_active", "is_verified"]:
        if key in data:
            setattr(user, key, data[key])
    db.commit()
    db.refresh(user)
    return user

@app.post("/make-admin/{user_id}")
def make_admin(user_id: int, db: Session = Depends(get_db)):
    user = db.query(crud.models.User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    user.role = "admin"
    db.commit()
    db.refresh(user)
    return {"message": f"{user.username} artık admin."} 