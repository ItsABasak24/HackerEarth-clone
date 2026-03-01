from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
from config.Env import ENVConfig

# HTTP Bearer security scheme
security = HTTPBearer()

async def verifyAdmin(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme"
        )

    token = credentials.credentials

    try:
        # Decode JWT
        payload = jwt.decode(
            token,
            ENVConfig.JWT_AUTH_SECRET,
            algorithms=[ENVConfig.ALGORITHM]  # MUST match encode algorithm
        )

        print("DECODED PAYLOAD:", payload)
        print("ROLE VALUE:", payload.get("role"))

        # Ensure role is admin
        if payload.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )

        # Ensure admin_id exists
        admin_id = payload.get("admin_id")
        if not admin_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid admin token payload"
            )

        return admin_id

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin token expired"
        )

    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin token"
        )
    
print("VERIFY SECRET:", ENVConfig.JWT_AUTH_SECRET)

