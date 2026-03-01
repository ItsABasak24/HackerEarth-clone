from dotenv import load_dotenv
import cloudinary
import os


load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME_CLOUDINARY"),
    api_key=os.getenv("API_KEY_CLOUDINARY"),
    api_secret=os.getenv("API_SECRET_CLOUDINARY"),
    secure=True
)

print("Cloudinary configured with:", os.getenv("CLOUD_NAME_CLOUDINARY"))
class ENVConfig:
    MONGO_URI = os.getenv("MONGO_URI","")
    MONGO_DB = os.getenv("MONGO_DB","")
    JWT_AUTH_SECRET = os.getenv("JWT_AUTH_SECRET", )
    ALGORITHM = "HS256"

    
    API_KEY_CLOUDINARY = os.getenv("API_KEY_CLOUDINARY")
    API_SECRET_CLOUDINARY = os.getenv("API_SECRET_CLOUDINARY")
    CLOUD_NAME_CLOUDINARY = os.getenv("CLOUD_NAME_CLOUDINARY")


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

    REDIS_HOST = os.getenv("REDIS_HOST", "")
    REDIS_PORT = os.getenv("REDIS_PORT", "")


    ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")