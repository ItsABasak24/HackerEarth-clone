from config.Env import ENVConfig
from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient(ENVConfig.MONGO_URI)
db = client[ENVConfig.MONGO_DB]

user_collection = db['users']
profile_collection = db['profile']
otp_collection = db['otp_verifications']

problem_collection = db["problems"]
testcase_collection = db["testcases"]
submission_collection = db["submissions"]
