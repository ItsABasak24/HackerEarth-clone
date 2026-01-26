from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from datetime import datetime
from enum import Enum

class ProfileImage(BaseModel):
    image_uri:str
    public_id:str

class User(BaseModel):
    name:str = Field(...)
    email:EmailStr = Field(...)
    # password:str = Field(...)
    password: Optional[str] = None
    auth_provider: str = "local"
    created_at:datetime = Field(default_factory=datetime.now)
    updated_at:datetime = Field(default_factory=datetime.now)
    
class UserProfile(BaseModel):
    user_id:str = Field(...)
    name:str = Field(...)
    # avatar:Optional[ProfileImage] = None
    created_at:datetime = Field(default_factory=datetime.now)
    updated_at:datetime = Field(default_factory=datetime.now)
    
@field_validator('name')
def validate_name(cls, value):
    if len(value)<3:
        raise ValueError("Name must be greater than 3 characters!!!!!")
    return value

class UpdateBasicDetails(BaseModel):
    name:str = Field(...)

# class RegisterUser(User):
#     pass

class RegisterUser(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginUser(BaseModel):
    email: EmailStr = Field(...)
    password:str = Field(...)


class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: int
    name: str
    password: str

class OTPOnlyVerifyRequest(BaseModel):
    otp: int


class GoogleAuthRequest(BaseModel):
    id_token: str


class SupportedLanguage(str, Enum):
    c = "c"
    cpp = "cpp"
    java = "java"
    python = "python"
    javascript = "nodejs"

class RunCodeRequest(BaseModel):
    language: SupportedLanguage
    code: str = Field(..., min_length=1)
    stdin: Optional[str] = ""

class RunCodeResponse(BaseModel):
    status: Optional[str] = None
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    compilationTime: Optional[int] = None
    executionTime: Optional[int] = None
    memoryUsed: Optional[int] = None


