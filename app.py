from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.authRoute import router as AuthRouter, executionRouter
from services.authService import getTemplate
from config import Env

app = FastAPI()

app.add_middleware(CORSMiddleware, allow_headers=["*"],
    allow_methods = ["*"],
    allow_origins= ["http://localhost:5173",
                    "http://127.0.0.1:5173",
                    "http://localhost:5500",
                    "http://127.0.0.1:5500"],               
    
    allow_credentials = True     
    )

app.include_router(AuthRouter)
app.include_router(executionRouter)
@app.get("/", tags=['health'])
def healthRoute():
    return{
        "msg":"Server is working properly."
    }

@app.get("/template")
def fetchTemplate(problem_id: str, language: str):
    try:
        code = getTemplate(problem_id, language)
        return{
            "problem_id": problem_id,
            "language": language,
            "code": code
        } 
    except Exception as e:
        print("Template error:", e)
        raise e
        



    