from config.db import admin_collection, user_collection, problem_collection, pending_problem_collection, submission_collection
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
        algorithm=ENVConfig.ALGORITHM
    )

    return {
        "msg": "Admin login successful",
        "token": token
    }

print("LOGIN SECRET:", ENVConfig.JWT_AUTH_SECRET)


async def getPendingProblems():
    problems = await pending_problem_collection.find().to_list(None)

    for p in problems:
        p["_id"] = str (p["_id"])

    return {
        "count": len(problems),
        "problems": problems
    }

async def approveProblem(problem_id: str):

    # 1️⃣ Validate problem exists
    problem = await pending_problem_collection.find_one(
        {"problem_id": problem_id}
    )

    if not problem:
        raise HTTPException(status_code=404, detail="Pending problem not found")

    # 2️⃣ Fetch related data first (IMPORTANT)
    boilerplates = await pending_boilerplate_collection.find(
        {"problem_id": problem_id}
    ).to_list(None)

    testcases = await pending_testcase_collection.find(
        {"problem_id": problem_id}
    ).to_list(None)

    # Optional safety check
    if not testcases:
        raise HTTPException(
            status_code=400,
            detail="No testcases found for this problem"
            )

    # 3️⃣ Clean Mongo _id fields
    problem.pop("_id", None)

    for bp in boilerplates:
        bp.pop("_id", None)

    for tc in testcases:
        tc.pop("_id", None)

    # 4️⃣ Insert into main collections
    problem["approved_at"] = datetime.utcnow()
    await problem_collection.insert_one(problem)

    if boilerplates:
        await boilerplate_collection.insert_many(boilerplates)

    await testcase_collection.insert_many(testcases)

    # 5️⃣ Delete from pending collections (ONLY AFTER SUCCESSFUL INSERT)
    await pending_problem_collection.delete_one(
        {"problem_id": problem_id}
    )

    await pending_boilerplate_collection.delete_many(
        {"problem_id": problem_id}
    )

    await pending_testcase_collection.delete_many(
        {"problem_id": problem_id}
    )

    # 6️⃣ Log action
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

async def getAdminInsights():

    total_users = await user_collection.count_documents({})
    total_problems = await problem_collection.count_documents({})
    pending_problems = await pending_problem_collection.count_documents({})
    total_submissions = await submission_collection.count_documents({})
    accepted_submissions = await submission_collection.count_documents(
        {"status": "Accepted"}
    )

    # Example submission per day (last 7 days)
    pipeline = [
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$timestamp"
                    }
                },
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]

    submissions_per_day = await submission_collection.aggregate(
        pipeline
    ).to_list(None)

    return {
        "total_users": total_users,
        "total_problems": total_problems,
        "pending_problems": pending_problems,
        "total_submissions": total_submissions,
        "accepted_submissions": accepted_submissions,
        "submissions_per_day": submissions_per_day
    }