from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.authRoute import router as AuthRouter



app = FastAPI()


app.add_middleware(CORSMiddleware, allow_headers=["*"],
    allow_methods = ['GET','POST','PUT','PATCH','DELETE'],
    allow_origins= ["http://localhost:5173",
                    "http://127.0.0.1:5173"],               
    
    allow_credentials = True     
    )

app.include_router(AuthRouter)
@app.get("/", tags=['health'])
def healthRoute():
    return{
        "msg":"Server is working properly."
    }


