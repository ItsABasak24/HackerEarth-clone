from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from datetime import datetime


class ProfileImage(BaseModel):
    image_uri:str
    public_id:str

class User(BaseModel):
    name:str = Field(...)
    email:EmailStr = Field(...)
    password:str = Field(...)
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

class RegisterUser(User):
    pass

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

