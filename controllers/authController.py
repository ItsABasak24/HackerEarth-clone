from services import authService
from models import authModel
from fastapi import HTTPException

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


# async def googleRequestOTPController(data: authModel.GoogleAuthRequest):
#     return await authService.googleRequestOTP(data.id_token)

async def googleAuthController(data: authModel.GoogleAuthRequest):
    return await authService.googleAuthService(data.id_token)

