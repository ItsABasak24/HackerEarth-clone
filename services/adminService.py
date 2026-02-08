from config.db import admin_collection
from fastapi.exceptions import HTTPException
from config.Env import ENVConfig
import jwt
from datetime import datetime, timedelta
from config.db import pending_problem_collection, pending_testcase_collection, pending_boilerplate_collection, problem_collection, testcase_collection, activity_collection, boilerplate_collection

async def adminLoginService(username: str, password: str):

    if (
        username != ENVConfig.ADMIN_USERNAME
        or password != ENVConfig.ADMIN_PASSWORD
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid admin credentials"
        )

    token = jwt.encode(
        {
            "admin_id": "SUPER_ADMIN",
            "role": "admin",
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(hours=8)
        },
        ENVConfig.JWT_AUTH_SECRET,
        algorithm="HS256"
    )

    return {
        "msg": "Admin login successful",
        "token": token
    }

async def getPendingProblems():
    problems = await pending_problem_collection.find().to_list(None)

    for p in problems:
        p["_id"] = str (p["_id"])

    return {
        "count": len(problems),
        "problems": problems
    }

async def approveProblem(problem_id: str):

    # Move boilerplates
    boilerplates = await pending_boilerplate_collection.find(
        {"problem_id": problem_id}
    ).to_list(None)

    if boilerplates:
        for bp in boilerplates:
            bp.pop("_id", None)
        await boilerplate_collection.insert_many(boilerplates)


    # 1️⃣ Fetch pending problem
    problem = await pending_problem_collection.find_one(
        {"problem_id": problem_id}
    )

    if not problem:
        raise HTTPException(status_code=404, detail="Pending problem not found")

    # Remove Mongo _id before inserting
    problem.pop("_id", None)

    # 2️⃣ Insert into main problems collection
    problem["approved_at"] = datetime.utcnow()
    await problem_collection.insert_one(problem)

    # 3️⃣ Move testcases
    testcases = await pending_testcase_collection.find(
        {"problem_id": problem_id}
    ).to_list(None)

    if testcases:
        for tc in testcases:
            tc.pop("_id", None)
        await testcase_collection.insert_many(testcases)

    # 4️⃣ Cleanup pending collections
    await pending_problem_collection.delete_many(
        {"problem_id": problem_id}
    )
    await pending_testcase_collection.delete_many(
        {"problem_id": problem_id}
    )
    await pending_boilerplate_collection.delete_many(
        {"problem_id": problem_id}
    )

    # 5️⃣ Log admin action
    await activity_collection.insert_one({
        "action": "problem_approved",
        "problem_id": problem_id,
        "timestamp": datetime.utcnow()
    })

    return {
        "msg": "Problem approved successfully",
        "problem_id": problem_id
    }


async def rejectProblem(problem_id: str):
    exists = await pending_problem_collection.find_one(
        {"problem_id": problem_id}
    )

    if not exists:
        raise HTTPException(status_code=404, detail="Pending problem not found")

    # Delete everything related to this problem
    await pending_problem_collection.delete_many(
        {"problem_id": problem_id}
    )
    await pending_testcase_collection.delete_many(
        {"problem_id": problem_id}
    )
    await pending_boilerplate_collection.delete_many(
        {"problem_id": problem_id}
    )

    # Log admin action
    await activity_collection.insert_one({
        "action": "problem_rejected",
        "problem_id": problem_id,
        "timestamp": datetime.utcnow()
    })

    return {
        "msg": "Problem rejected successfully",
        "problem_id": problem_id
    }
