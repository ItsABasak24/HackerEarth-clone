from fastapi import APIRouter, Request, Depends, UploadFile, File
from controllers import authController
from models import authModel
from middlewares.verifyToken import verifyToken
from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm
from starlette.responses import RedirectResponse
router = APIRouter(prefix="/api/v1/auth", tags=['auth'])
executionRouter = APIRouter(prefix="/api/v1/execute", tags=["execution"])

@router.post("/register/request-otp")
async def requestOTP(data: authModel.RegisterUser):
    return await authController.requestRegisterOTPController(data)


@router.post("/register/verify-otp")
async def verifyOTP(data: authModel.OTPOnlyVerifyRequest):
    return await authController.verifyOTPOnlyController(data)

@router.post("/google/auth")
async def googleAuth(data: authModel.GoogleAuthRequest):
    return await authController.googleAuthController(data)

@router.get("/auto-login")
async def autoLogin(token: str):
    return await authController.autoLoginController(token)

# login user
@router.post("/login")
async def loginView(data:authModel.LoginUser):
    return await authController.loginController(data)


# profile data fetching
@router.get("/profile")
async def profileView(userId= Depends(verifyToken)):
    return await authController.profileController(userId)

@router.put("/update-avatar")
async def updateAvatar(avatar: UploadFile =  File(...), userId = Depends(verifyToken)):
    return await authController.updateAvatarController(avatar, userId)

@router.put("/update-basic-details")
async def UpdateBasicDetails(data:authModel.UpdateBasicDetails, userId = Depends(verifyToken)):
    return await authController.updateBasicDetailsController(data, userId)


@executionRouter.post("/run", response_model=authModel.RunCodeResponse)
async def runCode(data: authModel.RunCodeRequest, userId: str = Depends(verifyToken)):
    return await authController.runCodeController(data)

@executionRouter.post("/submit")
async def submitCode(data: authModel.SubmitRequest, userId: str = Depends(verifyToken)):
    return await authController.submitController(data)


@router.post("/logout")
async def logout():
    return {
        "msg": "Logged out successfully"
    }