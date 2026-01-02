from fastapi import APIRouter, Request, Depends, UploadFile, File
from controllers import authController
from models import authModel
from middlewares.verifyToken import verifyToken
from typing import Annotated

router = APIRouter(prefix="/api/v1/auth", tags=['auth'])

#register user
@router.post("/register")
async def registerView(data:authModel.RegisterUser):
    return await authController.registerController(data)


# login user
@router.post("/login")
async def loginView(data:authModel.LoginUser):
    return await authController.loginController(data)


# profile data fetching
@router.get("/profile")
async def profileView(userId= Depends(verifyToken)):
    return await authController.profileController(userId)

