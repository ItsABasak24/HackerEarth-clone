from services import authService
from models import authModel
from fastapi import HTTPException
# from services.authService import (verifyGoogleToken, generateOTP, saveOTP, sendOTPEmail, verifyOTP)
from datetime import datetime, timedelta
from config.db import user_collection
import jwt
from config.Env import ENVConfig

async def registerController(data:authModel.RegisterUser):
    try:
        res_obj = await authService.registerService(data)
        return res_obj
    except Exception as e:
        raise HTTPException(status_code=404, detail= f"{e}")
    

async def loginController(data:authModel.LoginUser):
    try:
        res_obj = await authService.loginService(data)
        return res_obj
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"{e}")
    

async def profileController(userId:str):
    try:
        res_obj = await authService.profileService(userId)
        return res_obj
    except Exception as e:
        raise HTTPException(status_code=404, detail= f"{e}")
    
async def requestRegisterOTPController(data: authModel.RegisterUser):
    return await authService.requestRegisterOTP(data)

# async def verifyOTPRegisterController(data: authModel.OTPVerifyRequest):
#     return await authService.verifyOTPAndRegister(data)


async def verifyOTPOnlyController(data: authModel.OTPOnlyVerifyRequest):
    return await authService.verifyOTPAndRegisterOnlyOTP(data)
