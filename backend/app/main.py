from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import admin, auth, branches, subjects

app = FastAPI(title="DJ Hub API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://dj-hub-green.vercel.app", 
        "http://localhost:5173", 
        "http://127.0.0.1:5173", 
        "http://localhost:8000", 
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(branches.router)
app.include_router(subjects.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
