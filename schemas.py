# Pydantic şemaları burada tanımlanacak 
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    role: str
    created_at: datetime

    class Config:
        orm_mode = True

class TestBase(BaseModel):
    title: str
    description: Optional[str] = None
    questions: Any  # JSON (list/dict)

class TestCreate(TestBase):
    pass

class TestOut(TestBase):
    id: int
    owner_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class TestResultBase(BaseModel):
    answers: Any  # JSON (list/dict)
    score: Optional[int] = None

class TestResultCreate(TestResultBase):
    pass

class TestResultOut(TestResultBase):
    id: int
    user_id: int
    test_id: int
    submitted_at: datetime

    class Config:
        orm_mode = True 