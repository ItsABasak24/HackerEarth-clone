from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime, date
from enum import Enum

class ProfileImage(BaseModel):
    image_uri:str
    public_id:str

class User(BaseModel):
    name:str = Field(...)
    email:EmailStr = Field(...)
    # password:str = Field(...)
    password: str = Field(..., min_length=6)
    auth_provider: str = "local"
    created_at:datetime = Field(default_factory=datetime.now)
    updated_at:datetime = Field(default_factory=datetime.now)
    
class UserProfile(BaseModel):
    user_id:str = Field(...)
    name:str = Field(...)
    avatar:Optional[ProfileImage] = None
    created_at:datetime = Field(default_factory=datetime.now)
    updated_at:datetime = Field(default_factory=datetime.now)
    
@field_validator('name')
def validate_name(cls, value):
    if len(value)<3:
        raise ValueError("Name must be greater than 3 characters!!!!!")
    return value


class SocialLinks(BaseModel):
    website: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None


class Education(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class Work(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class UpdateBasicDetails(BaseModel):
    # name:str = Field(...)
    gender: Optional[str] = None
    location: Optional[str] = None
    birthday: Optional[date] = None
    bio: Optional[str] = None
    socials: Optional[SocialLinks] = None
    education: Optional[Education] = None
    work: Optional[Work] = None

    skills: Optional[List[str]] = None

# class RegisterUser(User):
#     pass

class RegisterUser(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginUser(BaseModel):
    email: EmailStr = Field(...)
    password:str = Field(...)

class OTPOnlyVerifyRequest(BaseModel):
    email: EmailStr
    otp: int


class GoogleAuthRequest(BaseModel):
    id_token: str


class SupportedLanguage(str, Enum):
    c = "c"
    cpp = "cpp"
    java = "java"
    python = "python"
    javascript = "javascript"
    go = "go"
    rust = "rust"

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


class Problem(BaseModel):
    id: str
    title: str
    description: str
    difficulty: str


class TestCase(BaseModel):
    problem_id: str
    input: str
    expected_output: str
    is_sample: bool = False


class SubmitRequest(BaseModel):
    problem_id: str
    language: SupportedLanguage
    code: str