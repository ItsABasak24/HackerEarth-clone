from config.Env import ENVConfig
from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient(ENVConfig.MONGO_URI)
db = client[ENVConfig.MONGO_DB]

user_collection = db['users']
profile_collection = db['profile']