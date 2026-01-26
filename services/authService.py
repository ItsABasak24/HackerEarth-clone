from config.db import user_collection, profile_collection, otp_collection
from models import authModel
from fastapi.exceptions import HTTPException
import bcrypt , bson
from config.Env import ENVConfig
import jwt
from datetime import datetime, timedelta
from google.oauth2 import id_token
from google.auth.transport import requests
import random, smtplib
from email.message import EmailMessage
import httpx

HEADERS = {
    "Content-Type": "application/json",
    "x-rapidapi-host": ENVConfig.RAPID_API_HOST,
    "x-rapidapi-key": ENVConfig.RAPID_API_KEY
}

FILE_NAME_MAP = {
    "python": "index.py",
    "c": "main.c",
    "cpp": "main.cpp",
    "java": "Main.java",
    "nodejs": "index.js"
}

async def registerService(data:authModel.RegisterUser):
    check_exist = await user_collection.find_one({"email":data.email.lower()})
    if check_exist:
        raise HTTPException(status_code=400, detail="User already exist")
    
    salt = bcrypt.gensalt()
    hash_string = bcrypt.hashpw(data.password.encode(),salt).decode()

    user_data = data.dict()
    user_data['password'] = hash_string
    del user_data['name']
    doc = await user_collection.insert_one(user_data)

    user_p = authModel.UserProfile(user_id=str(doc.inserted_id), name=data.name)
    await profile_collection.insert_one(user_p.dict())

    return{
        "msg": "Register successfull"
    }

async def loginService(data:authModel.LoginUser):
    check_exist = await user_collection.find_one({"email":data.email.lower()})
    if not check_exist:
        raise HTTPException(status_code=400, detail="User does not exist!!!")
    
    is_match = bcrypt.checkpw(data.password.encode(),check_exist['password'].encode())
    if not is_match:
        raise HTTPException(status_code=400, detail="Invalid Credentials!!!")
    
    token = jwt.encode({
        "user_id":str(check_exist['_id']),
        "iat":datetime.utcnow(),
        "exp":datetime.utcnow()+timedelta(minutes=10)
    }, ENVConfig.JWT_AUTH_SECRET, algorithm="HS256")
    del check_exist['password']

    return {
        "msg":"Login Success",
        "token":token
    }


async def profileService(userId: str):
    check_exist = await user_collection.find_one(
        {"_id": bson.ObjectId(userId)},
        {
            "name": 1,
            "email": 1
        }
    )
    if not check_exist:
        raise HTTPException(status_code=404, detail="User details not found")

    check_exist["_id"] = str(check_exist["_id"])

    profile = await profile_collection.find_one({"user_id": check_exist["_id"]})
    if profile:
        profile.pop("_id", None)
        profile.pop("user_id", None)

        if profile.get("avatar"):
            profile["avatar"] = profile["avatar"]["image_uri"]

    return check_exist | (profile or {})

def generateOTP():
    return random.randint(100000, 999999)


def sendOTPEmail(email: str, otp: int):
    msg = EmailMessage()
    msg["Subject"] = "Your Registration OTP"
    msg["From"] = ENVConfig.SMTP_EMAIL
    msg["To"] = email
    msg.set_content(f"Your OTP for registration is {otp}. It is valid for 5 minutes.")

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(ENVConfig.SMTP_EMAIL, ENVConfig.SMTP_PASSWORD)
        server.send_message(msg)
    


async def requestRegisterOTP(data: authModel.RegisterUser):
    exists = await user_collection.find_one({"email": data.email.lower()})
    if exists:
        raise HTTPException(status_code=400, detail="User already exists")

    otp = generateOTP()

    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(data.password.encode(), salt).decode()

    await otp_collection.delete_many({"email": data.email.lower()})

    await otp_collection.insert_one({
        "email": data.email.lower(),
        "otp": otp,
        "name": data.name,
        "password": hashed_password,
        "expires_at": datetime.utcnow() + timedelta(minutes=ENVConfig.OTP_EXP_MINUTES)
    })

    sendOTPEmail(data.email, otp)

    return {"msg": "OTP sent to email"}



async def verifyOTPAndRegisterOnlyOTP(data: authModel.OTPOnlyVerifyRequest):
    record = await otp_collection.find_one({"otp": data.otp})

    if not record:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if record["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired")

    user = await user_collection.insert_one({
        "email": record["email"],
        "password": record["password"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })

    await profile_collection.insert_one({
        "user_id": str(user.inserted_id),
        "name": record["name"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })

    await otp_collection.delete_one({"_id": record["_id"]})

    return {"msg": "Registration successful"}


async def googleAuthService(id_token_str: str):
    try:
        idinfo = id_token.verify_oauth2_token(
            id_token_str,                 
            requests.Request(),
            ENVConfig.GOOGLE_CLIENT_ID,
        )
        email = idinfo.get("email")
        name = idinfo.get("name")
        if not email:
            raise HTTPException(status_code=400, detail="Google account has no email")
        email = email.lower()
        user = await user_collection.find_one({"email": email})
        if not user:
            user_doc = await user_collection.insert_one({
                "email": email,
                "password": None,
                "provider": "google",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            })
            await profile_collection.insert_one({
                "user_id": str(user_doc.inserted_id),
                "name": name,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            })
            user_id = str(user_doc.inserted_id)
        else:
            user_id = str(user["_id"])

        token = jwt.encode(
            {
                "user_id": user_id,
                "iat": datetime.utcnow(),
                "exp": datetime.utcnow() + timedelta(days=7),
            },
            ENVConfig.JWT_AUTH_SECRET,
            algorithm="HS256",
        )
        return {
            "msg": "Google login successful",
            "token": token
        }
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


async def runCodeService(data: authModel.RunCodeRequest):
    payload = {
        "language": data.language.value,
        "stdin": data.stdin,
        "files": [
            {
                "name": FILE_NAME_MAP[data.language.value],
                "content": data.code
            }
        ]
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            ENVConfig.RAPID_API_URL,
            json=payload,
            headers=HEADERS
        )
    response.raise_for_status()
    return response.json()