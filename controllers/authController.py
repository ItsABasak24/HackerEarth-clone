from services import authService
from models import authModel
from fastapi import HTTPException
from config.db import submission_collection
from datetime import datetime

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


async def updateAvatarController(avatar,userId):
    try: 
        res_obj = await authService.updateAvatarService(avatar, userId)
        return res_obj
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"{e}")
    

async def updateBasicDetailsController(data, userId):
    try:
        res_obj = await authService.updateBasicDetailsService(data, userId)
        return res_obj
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"{e}")



async def requestRegisterOTPController(data: authModel.RegisterUser):
    return await authService.requestRegisterOTP(data)


async def verifyOTPOnlyController(data: authModel.OTPOnlyVerifyRequest):
    return await authService.verifyOTPAndRegisterOnlyOTP(data)

# async def autoLoginController(token: str):
#     return await authService.autoLoginService(token)

async def googleAuthController(data: authModel.GoogleAuthRequest):
    return await authService.googleAuthService(data.id_token)

async def getProblemController(problem_id: str):
    return await authService.getProblembyId(problem_id)

async def runCodeController(data: authModel.RunCodeRequest):
    return await authService.runCodeService(data)


async def submitSolutionController(data: authModel.SubmitRequest, userId: str):
    testcases = await authService.getTestCasesForProblem(data.problem_id)

    if not testcases:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    result = await authService.judgeSubmission(
        data.problem_id,
        data.language.value,
        data.code,
        userId
    )

    await submission_collection.insert_one({
        "user_id": userId,
        "problem_id": data.problem_id,
        "language": data.language.value,
        "verdict": result["verdict"],
        "submitted_at": datetime.utcnow()
    })

    return result

async def canAddProblemController(userId: str):
    allowed = await authService.canUserAddProblem(userId)
    return {"allowed": allowed}

async def submitProblemForReviewController(
    data: authModel.AddProblemRequest,
    userId: str
):
    return await authService.submitProblemForReview(data, userId)
