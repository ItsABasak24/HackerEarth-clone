from fastapi import HTTPException, status, Depends
import jwt
from config.Env import ENVConfig
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# The code supports for frontend
""""
def verifyToken(req:Request):
    authorization = req.headers.get("Authorization","")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Please login first")
    
    token = authorization.split(" ")[1]
    if not token:
        raise HTTPException(401, "Please provide a valid token")
    
    try:
        payload = jwt.decode(token,ENVConfig.JWT_AUTH_SECRET,algorithms=[ENVConfig.ALGORITHM])
        return payload['user_id']
    except Exception as e:
        raise HTTPException(401,f"{e}")
"""""

security = HTTPBearer()
def verifyToken(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, ENVConfig.JWT_AUTH_SECRET, algorithms = [ENVConfig.ALGORITHM])
        return payload["user_id"]
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    