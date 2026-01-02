from config.db import user_collection, profile_collection
from models import authModel
from fastapi.exceptions import HTTPException
import bcrypt , bson
from config.Env import ENVConfig
import jwt
from datetime import datetime, timedelta


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
        "exp":datetime.utcnow()+timedelta(minutes=5)
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

# async def profileService(userId:str):
#     check_exist = await user_collection.find_one({"_id":bson.ObjectId(userId)},{
#             "name": 1,
#             "email": 1
#     })
#     if not check_exist:
#         raise HTTPException(status_code=404, detail="User details not found")
    
#     check_exist['_id'] = str(check_exist['_id'])
#     profile = await profile_collection.find_one({"user_id":check_exist['_id']})
#     del profile['_id']
#     del profile['user_id']
#     if(profile['avatar']):
#         profile['avatar'] = profile['avatar']['image_uri']
    
#     return check_exist | profile





