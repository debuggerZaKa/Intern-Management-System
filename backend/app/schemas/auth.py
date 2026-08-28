from typing import Optional, List
from pydantic import BaseModel, EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    department: Optional[str] = None
    phone: Optional[str] = None
    university: Optional[str] = None
    degree: Optional[str] = None
    semester: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
