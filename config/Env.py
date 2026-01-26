from dotenv import load_dotenv
import os

load_dotenv()

class ENVConfig:
    MONGO_URI = os.getenv("MONGO_URI","")
    MONGO_DB = os.getenv("MONGO_DB","")
    JWT_AUTH_SECRET = os.getenv("JWT_AUTH_SECRET", )
    ALGORITHM = "HS256"
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID","")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET","")

    
    GITHUB_CLIENT_ID= os.getenv("GITHUB_CLIENT_ID", "")
    GITHUB_CLIENT_SECRET= os.getenv("GITHUB_CLIENT_SECRET", "")

    SMTP_EMAIL= os.getenv("SMTP_EMAIL")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
    OTP_EXP_MINUTES= int(os.getenv("OTP_EXP_MINUTES", 5))

    RAPID_API_KEY = os.getenv("RAPID_API_KEY", "")
    RAPID_API_HOST = "onecompiler-apis.p.rapidapi.com"
    RAPID_API_URL = "https://onecompiler-apis.p.rapidapi.com/api/v1/run"

   

