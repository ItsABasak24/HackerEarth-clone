from fastapi import APIRouter, Depends, UploadFile, File
from controllers import authController
from models import authModel
from config.db import problem_collection, submission_collection, boilerplate_collection
from middlewares.verifyToken import verifyToken

router = APIRouter(prefix="/api/v1/auth", tags=['auth'])
executionRouter = APIRouter(prefix="/api/v1/execute", tags=["execution"])
problemsRouter = APIRouter(prefix="/api/v1/problems", tags=["problems"])
@router.post("/register/request-otp")
async def requestOTP(data: authModel.RegisterUser):
    return await authController.requestRegisterOTPController(data)


@router.post("/register/verify-otp")
async def verifyOTP(data: authModel.OTPOnlyVerifyRequest):
    return await authController.verifyOTPOnlyController(data)

@router.post("/google/auth")
async def googleAuth(data: authModel.GoogleAuthRequest):
    return await authController.googleAuthController(data)

# @router.get("/auto-login")
# async def autoLogin(token: str):
#     return await authController.autoLoginController(token)

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

@problemsRouter.get("/")
async def getAllProblems(userId = Depends(verifyToken)):
    problems = await problem_collection.find().to_list(None)
    accepted = await submission_collection.find({
        "user_id": userId,
        "status": "Accepted"
    }).to_list(None)

    solved_set = {s["problem_id"] for s in accepted}
    for p in problems:
        p["_id"] = str(p["_id"])
        p["isSolved"] = p["problem_id"] in solved_set
    return problems

@problemsRouter.get("/{problem_id}/languages")
async def getProblemLanguages(problem_id: str):
    languages = await boilerplate_collection.distinct(
        "language",
        {
            "problem_id": problem_id
        }
    )
    return {
            "languages": languages
        }
@problemsRouter.get("/{problem_id}")
async def getProblem(problem_id: str):
    return await authController.getProblemController(problem_id)

@executionRouter.post("/run", response_model=authModel.RunCodeResponse)
async def runCode(data: authModel.RunCodeRequest, userId: str = Depends(verifyToken)):
    return await authController.runCodeController(data)

@executionRouter.post("/submit")
async def submitCode(data: authModel.SubmitRequest, userId: str = Depends(verifyToken)):
    result =await authController.submitSolutionController(data, userId)
    return result


@router.get("/can-add-problem")
async def canAddProblem( userId = Depends(verifyToken)):
    return await authController.canAddProblemController(userId)

@router.post("/submit-problem")
async def submitNewProblem(data: authModel.AddProblemRequest, userId = Depends(verifyToken)):
    return await authController.submitProblemForReviewController(data, userId)


@router.post("/logout")
async def logout():
    return {
        "msg": "Logged out successfully"
    }

