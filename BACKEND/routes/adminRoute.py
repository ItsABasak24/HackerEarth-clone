from fastapi import APIRouter, Depends
from middlewares.verifyAdmin import verifyAdmin
from services import adminService
from models import authModel

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/login")
async def adminLogin(data: authModel.AdminLoginRequest):
    return await adminService.adminLoginService(
        data.username,
        data.password
    )

@router.get("/dashboard")
async def adminDashboard(adminId = Depends(verifyAdmin)):
    return {"msg": "Welcome Admin"}

@router.get("/pending-problems")
async def pendingProblems(adminId = Depends(verifyAdmin)):
    return await adminService.getPendingProblems()

@router.post("/approve/{problem_id}")
async def approveProblem(problem_id: str, adminId = Depends(verifyAdmin)):
    return await adminService.approveProblem(problem_id)

@router.post("/reject/{problem_id}")
async def rejectProblem(problem_id: str, adminId = Depends(verifyAdmin)):
    return await adminService.rejectProblem(problem_id)

@router.get("/insights")
async def adminInsights(adminId = Depends(verifyAdmin)):
    return await adminService.getAdminInsights()