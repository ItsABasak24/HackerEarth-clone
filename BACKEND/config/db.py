from config.Env import ENVConfig
from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient(ENVConfig.MONGO_URI)
db = client[ENVConfig.MONGO_DB]


admin_collection = db["admins"]

user_collection = db['users']
profile_collection = db['profile']
otp_collection = db['otp_verifications']

problem_collection = db["problems"]
testcase_collection = db["testcases"]
submission_collection = db["submissions"]

pending_problem_collection = db["pending_problems"]
pending_testcase_collection = db["pending_testcases"]
pending_boilerplate_collection = db["pending_boilerplates"]
activity_collection = db["activity_logs"]

boilerplate_collection = db["boilerplate_collection"]