from config.db import user_collection, profile_collection, testcase_collection, problem_collection, submission_collection
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
from typing import Annotated
from fastapi import UploadFile, File
import cloudinary.uploader
from datetime import date, datetime
import json, uuid
import redis.asyncio as redis
from datetime import datetime, date
from bson import json_util
from config.db import pending_boilerplate_collection, pending_testcase_collection, pending_problem_collection, activity_collection, admin_collection, boilerplate_collection
from fastapi.encoders import jsonable_encoder

redis_client = redis.Redis(
    host=ENVConfig.REDIS_HOST,
    port=int(ENVConfig.REDIS_PORT),
    decode_responses=True
)


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


def serialize_datetimes(data: dict):
    for key, value in data.items():
        if isinstance(value, datetime):
            data[key] = value.isoformat()
        elif isinstance(value, dict):
            serialize_datetimes(value)
    return data


# def getTemplate(problem_id: str, language: str) -> str:
#     if language not in LANGUAGE_TEMPLATE_MAP:
#         raise ValueError(f"Unsuported language: {language}")
    
#     file_path = TEMPLATE_DIR / problem_id / LANGUAGE_TEMPLATE_MAP[language]
#     if not file_path.exists():
#         raise FileNotFoundError(
#             f"Template not found for problem {problem_id} and language {language}"
#         )
#     return file_path.read_text()

async def getTemplate(problem_id: str, language: str):
    template = await boilerplate_collection.find_one({
        "problem_id": problem_id,
        "language": language
    })

    if not template:
        raise HTTPException(
            status_code=404,
            detail=f"No boilerplate found for {problem_id} ({language})"
        )

    return template["code"]


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
    redis_key = f"profile:{userId}"

    # Check in Redis First
    cached_profile = await redis_client.get(redis_key)
    if cached_profile:
        return json.loads(cached_profile)
    
    # If didn't find in redis fetches from MongoDB
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

    response = {
        "email": check_exist["email"],
        **profile  # It merges two dictionaries
    }
    response = serialize_datetimes(response)

    # Store in Redis after fethcing from MongoDB for 10 minutes
    await redis_client.setex(
        redis_key,
        600,
        json.dumps(response)
    )

    return check_exist | (profile or {})


async def updateAvatarService(avatar: Annotated[UploadFile, File()], userId: str):
    exist = await profile_collection.find_one({"user_id": userId})
    if exist.get("avatar") and exist["avatar"].get("public_id"):
        cloudinary.uploader.destroy(exist['avatar']['public_id'])
    contents = await avatar.read()
    upload_result = cloudinary.uploader.upload(contents, folder= "user_profile_ecom/avatars", resource_type = "image")

    await profile_collection.find_one_and_update({"user_id": userId},{
        "$set":{
            "avatar":{
                "image_uri": upload_result['secure_url'],
                "public_id": upload_result['public_id']
            },
            "update_at":datetime.now()
        }
    })
    await redis_client.delete(f"profile:{userId}")
    return {
        "msg":"Avatar updated successfull.",
        "url":upload_result["secure_url"]
    }



async def updateBasicDetailsService(data: authModel.UpdateBasicDetails, userId: str):
    redis_key = f"profile:{userId}"
    update_data = data.dict(exclude_unset=True)

    # 🔥 FIX: convert date → datetime
    if "birthday" in update_data and isinstance(update_data["birthday"], date):
        update_data["birthday"] = datetime.combine(
            update_data["birthday"],
            datetime.min.time()
        )

    update_data["updated_at"] = datetime.now().isoformat()

    result = await profile_collection.find_one_and_update(
        {"user_id": userId},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="User profile not found")
    await redis_client.setex(
        redis_key,
        3600,
        json_util.dumps(result)
    )

    return {"msg": "Profile details updated successfully"}



def generateOTP():
    return random.randint(100000, 999999)


def sendOTPEmail(email: str, otp: int):
    msg = EmailMessage()
    msg["Subject"] = "Your Registration OTP"
    msg["From"] = f"Arnab Basak <{ENVConfig.SMTP_EMAIL}>"
    msg["To"] = email
    with open("services\MailFormat\mailFormat.html", "r", encoding="utf-8") as file:
        html = file.read()
    # Replace OTP placeholder
    html = html.replace("{otp}", str(otp))
    msg.add_alternative(html, subtype="html")


    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(ENVConfig.SMTP_EMAIL, ENVConfig.SMTP_PASSWORD)
        server.send_message(msg)
    


async def requestRegisterOTP(data: authModel.RegisterUser):
    email = data.email.lower()
    exists = await user_collection.find_one({"email": data.email.lower()})
    if exists:
        raise HTTPException(status_code=400, detail="User already exists")

    otp = generateOTP()

    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(data.password.encode(), salt).decode()

    redis_key = f"otp:{email}"

    redis_value = {
        "otp": otp,
        "name": data.name,
        "password": hashed_password
    }

    await redis_client.setex(
        redis_key,
        ENVConfig.OTP_EXP_MINUTES * 60,
        json.dumps(redis_value)
    )

    sendOTPEmail(data.email, otp)

    return {"msg": "OTP sent to email"}



async def verifyOTPAndRegisterOnlyOTP(data: authModel.OTPOnlyVerifyRequest):
    email = data.email.lower()
    redis_key = f"otp:{email}"

    record = await redis_client.get(redis_key)
    if not record:
        raise HTTPException(status_code=400, detail=" OTP expired or invalid OTP")

    record = json.loads(record)

    if str(record["otp"]) != str(data.otp):
        raise HTTPException(status_code=400, detail="Invalid OTP")

    user = await user_collection.insert_one({
        "email": email,
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

    await redis_client.delete(redis_key)

    # login_token = str(uuid.uuid4())
    # await redis_client.setex(
    #     f"login_token:{login_token}",
    #     300,
    #     str(user.inserted_id)
    # )
    
    sendRegistrationSuccessEmail(email=email, name=record["name"])

    return {"msg": "Registration successful"}



def sendRegistrationSuccessEmail(email: str, name: str):
    msg = EmailMessage()
    msg["Subject"] = "Registration Successful"
    msg["From"] = f"Arnab Basak <{ENVConfig.SMTP_EMAIL}>"
    msg["To"] = email

    html = Path("services/MailFormat/registrationSuccess.html").read_text(encoding="utf-8")
    # login_url = f"http://localhost:3000/auto-login?token={login_token}"
    html = html.replace("{name}", name)
    html = html.replace("{email}", email)
    # html = html.replace("{login_url}", login_url)

    msg.add_alternative(html, subtype = "html")

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(ENVConfig.SMTP_EMAIL, ENVConfig.SMTP_PASSWORD)
        server.send_message(msg)


# async def autoLoginService(token: str):
#     redis_key = f"login_token:{token}"

#     user_id = await redis_client.get(redis_key)

#     if not user_id:
#         raise HTTPException(status_code=400, detail="Invalid or expired login link")

#     await redis_client.delete(redis_key)

#     jwt_token = jwt.encode(
#         {
#             "user_id": user_id,
#             "iat": datetime.utcnow(),
#             "exp": datetime.utcnow() + timedelta(days=10)
#         },
#         ENVConfig.JWT_AUTH_SECRET,
#         algorithm="HS256"
#     )

#     return {
#         "token": jwt_token
#     }


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
            sendRegistrationSuccessEmail(email=email, name=name)

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
    
    

async def getProblembyId(problem_id: str):
    redis_key = f"problem:{problem_id}"
    cached = await redis_client.get(redis_key)
    if cached:
        return json.loads(cached)
    
    problem = await problem_collection.find_one(
        {"problem_id": problem_id}
    )
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    problem["_id"] = str(problem["_id"])
    # Fetch ONLY sample testcases
    sample_testcases = await testcase_collection.find({
        "problem_id": problem_id,
        "is_sample": True
    }).limit(3).to_list(length=3)

    for tc in sample_testcases:
        tc["_id"] = str(tc["_id"])

    problem["sample_testcases"] = sample_testcases
    # Convert Mongo object safely to JSON-compatible format
    problem_encoded = jsonable_encoder(problem)

    await redis_client.setex(
        redis_key,
        3600,
        json.dumps(problem_encoded)
    )

    return problem_encoded


async def executeCode(language: str, code: str, stdin: str):

    payload = {
        "language": language,
        "stdin": stdin,
        "files": [
            {
                "name": FILE_NAME_MAP[language],
                "content": code
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

async def runCodeService(data: authModel.RunCodeRequest):

    sample_testcases = await testcase_collection.find({
        "problem_id": data.problem_id,
        "is_sample": True
    }).limit(3).to_list(length=3)

    results = []

    for index, tc in enumerate(sample_testcases):

        execution_result = await executeCode(
            data.language.value,
            data.code,
            tc["input"]
        )

        stdout = (execution_result.get("stdout") or "").strip()
        stderr = (execution_result.get("stderr") or "").strip()
        expected = tc["expected_output"].strip()

        passed = normalize_output(stdout) == normalize_output(expected)

        results.append({
            "input": tc["input"],
            "expected": expected,
            "actual": stdout,
            "passed": passed
        })

        if stderr:
            return {
                "status": "Runtime Error",
                "results": results
            }

        if not passed:
            return {
                "status": "Wrong Answer",
                "results": results
            }

    return {
        "status": "Passed",
        "results": results
    }






async def getTestCasesForProblem(problem_id: str):
    redis_key = f"testcases:{problem_id}"
    cached_testcases = await redis_client.get(redis_key)
    if cached_testcases:
        return json.loads(cached_testcases)
    testcases =  await testcase_collection.find(
        {"problem_id": problem_id}
    ).to_list(None)
    if not testcases:
        return []
    
    for tc in testcases:
        tc["_id"] = str(tc["_id"])

    await redis_client.setex(
        redis_key,
        3600,
        json.dumps(testcases)
    )
    return testcases


def normalize_output(s: str) -> str:
    return "\n".join(
        line.rstrip() for line in s.rstrip().splitlines()
    )

async def judgeSubmission(problem_id, language, code, user_id):

    hidden_testcases = await testcase_collection.find({
        "problem_id": problem_id,
        "is_sample": False
    }).to_list(None)

    results = []

    for index, tc in enumerate(hidden_testcases):

        execution_result = await executeCode(
            language,
            code,
            tc["input"]
        )

        stdout = (execution_result.get("stdout") or "").strip()
        stderr = (execution_result.get("stderr") or "").strip()
        expected = tc["expected_output"].strip()

        if stderr:
            return {
                "verdict": "Runtime Error",
                "stderr": stderr
            }

        passed = normalize_output(stdout) == normalize_output(expected)

        results.append({
            "testcase_number": index + 1,
            "passed": passed
        })

        if not passed:
            return {
                "verdict": "Wrong Answer",
                "results": results
            }

    # Save accepted submission
    await submission_collection.insert_one({
        "user_id": user_id,
        "problem_id": problem_id,
        "language": language,
        "status": "Accepted"
    })

    return {
        "verdict": "Accepted",
        "results": results
    }



async def canUserAddProblem(user_id: str) -> bool:
    total_problems = await problem_collection.count_documents({})

    solved = await submission_collection.distinct(
        "problem_id",
        {
            "user_id": user_id,
            "verdict": "Accepted"
        }
    )
    return len(solved) == total_problems and total_problems > 0


async def submitProblemForReview(data: authModel.AddProblemRequest, userId: str):
    # Eligibility check
    if not await canUserAddProblem(userId):
        raise HTTPException(
            status_code=403,
            detail="Not eligible to add problem"
        )
    
    # Prevent multipple pending submissions
    if await pending_problem_collection.find_one({
        "submitted_by": userId,
        "status": "pending"
    }):
        raise HTTPException(400, "You already have a problem under review")


    # Duplicate problem check (MAIN FIX)
    if await problem_collection.find_one({"problem_id": data.problem_id}) \
    or await pending_problem_collection.find_one({"problem_id": data.problem_id}):
        raise HTTPException(
            status_code=400,
            detail="Problem already exists or under review"
        )
    
    # Validation
    if not data.testcases or not data.boilerplates:
        raise HTTPException(400, "Testcases and boilerplates required")

    # Insert pending problem (ALWAYS)
    await pending_problem_collection.insert_one({
        **data.dict(exclude={"testcases", "boilerplates"}),
        "submitted_by": userId,
        "status": "pending",
        "reviewed_by": None,
        "reviewed_at": None,
        "rejection_reason": None,
        "submitted_at": datetime.utcnow()
    })

    # Insert testcases
    for tc in data.testcases:
        await pending_testcase_collection.insert_one(tc.dict())

    # Insert boilerplates
    for bp in data.boilerplates:
        await pending_boilerplate_collection.insert_one({
            "problem_id": data.problem_id,
            "language": bp.language.value,
            "code": bp.code
        })

    # Log activity
    await activity_collection.insert_one({
        "user_id": userId,
        "action": "add_problem_request",
        "problem_id": data.problem_id,
        "timestamp": datetime.utcnow()
    })

    return {
        "msg": "Problem submitted for admin review"
    }


