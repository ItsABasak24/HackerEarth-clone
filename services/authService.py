from config.db import user_collection, profile_collection, otp_collection, testcase_collection
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
from pathlib import Path


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
    "javascript": "index.js",
    "go": "main.go",
    "rust": "main.rs"
}

BASE_DIR = Path(__file__).resolve().parent.parent
TEMPLATE_DIR = BASE_DIR / "templates"

LANGUAGE_TEMPLATE_MAP = {
    "c":"c.txt",
    "cpp":"cpp.txt",
    "java":"java.txt",
    "python":"python.txt",
    "javascript":"javascript.txt",
    "go":"go.txt",
    "rust":"rust.txt",
}

def getTemplate(problem_id: str, language: str) -> str:
    if language not in LANGUAGE_TEMPLATE_MAP:
        raise ValueError(f"Unsuported language: {language}")
    
    file_path = TEMPLATE_DIR / problem_id / LANGUAGE_TEMPLATE_MAP[language]
    if not file_path.exists():
        raise FileNotFoundError(
            f"Template not found for problem {problem_id} and language {language}"
        )
    return file_path.read_text()

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
        "exp":datetime.utcnow()+timedelta(days=10)
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
    # msg.set_content(f"Your OTP for registration is {otp}. It is valid for 5 minutes.")
    msg.set_content(f"""
Hello,

Welcome to CodeEasy.

Thank you for registering with CodeEasy. To complete your registration and verify your email address, please use the One-Time Password (OTP) below:

Your OTP:
{otp}

This OTP is valid for 5 minutes. Please do not share this code with anyone.

If you did not request this verification, you can safely ignore this email.

Warm regards,
Team CodeEasy
""")


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


async def getTestCasesForProblem(problem_id: str):
    return await testcase_collection.find(
        {"problem_id": problem_id}
    ).to_list(None)


def normalize_output(s: str) -> str:
    return "\n".join(
        line.rstrip() for line in s.rstrip().splitlines()
    )


# async def judgeSubmission(language, code, testcases):
#     for tc in testcases:
#         payload = authModel.RunCodeRequest(
#             language=language,
#             code=code,
#             stdin=tc["input"]
#         )

#         result = await runCodeService(payload)

#         if result.get("stderr"):
#             return {
#                 "verdict": "Runtime Error",
#                 "stderr": result["stderr"]
#             }

#         user_output = normalize_output(result.get("stdout") or "")
#         expected_output = normalize_output(str(tc["expected_output"]))

#         if user_output != expected_output:
#             return {
#                 "verdict": "Wrong Answer"
#             }

#     return {
#         "verdict": "Accepted"
#     }

# async def judgeSubmission(language, code, testcases):
#     for tc in testcases:
#         payload = authModel.RunCodeRequest(
#             language=language,
#             code=code,
#             stdin=tc["input"]
#         )

#         result = await runCodeService(payload)

#         stdout = (result.get("stdout") or "").strip()
#         stderr = (result.get("stderr") or "").strip()

#         # 🟥 1️⃣ Compile-time Error
#         if stderr and not stdout and any(
#             kw in stderr.lower()
#             for kw in [
#                 "error:", "expected", "undefined", "syntax",
#                 "compilation", "abort", "cannot find",
#                 "missing", "failed to compile"
#             ]
#         ):
#             return {
#                 "verdict": "Compile Time Error",
#                 "stderr": stderr
#             }

#         # 🟧 2️⃣ Runtime Error
#         if stderr:
#             return {
#                 "verdict": "Runtime Error",
#                 "stderr": stderr
#             }

#         # 🟨 3️⃣ Wrong Answer
#         user_output = normalize_output(stdout)
#         expected_output = normalize_output(str(tc["expected_output"]))

#         if user_output != expected_output:
#             return {
#                 "verdict": "Wrong Answer",
#                 "expected": expected_output,
#                 "found": user_output
#             }

#     return {
#         "verdict": "Accepted"
#     }

async def judgeSubmission(language, code, testcases):
    for tc in testcases:
        payload = authModel.RunCodeRequest(
            language=language,
            code=code,
            stdin=tc["input"]
        )
        result = await runCodeService(payload)
        stdout = (result.get("stdout") or "").strip()
        stderr = (result.get("stderr") or "").strip()

        if stderr:
            if language == "python":
                if "syntaxerror" in stderr.lower() or "indentationerror" in stderr.lower():
                    return {
                        "verdict": "Compile Time Error",
                        "stderr": stderr
                    }
            else:
                if any(
                    kw in stderr.lower()
                    for kw in [
                        "error:", "expected", "undefined", "cannot find",
                        "compilation", "failed to compile", "abort"
                    ]
                ):
                    return {
                        "verdict": "Compile Time Error",
                        "stderr": stderr
                    }
        if stderr:
            return {
                "verdict": "Runtime Error",
                "stderr": stderr
            }
        user_output = normalize_output(stdout)
        expected_output = normalize_output(str(tc["expected_output"]))

        if user_output != expected_output:
            return {
                "verdict": "Wrong Answer",
                "expected": expected_output,
                "found": user_output
            }
    return {
        "verdict": "Accepted"
    }


