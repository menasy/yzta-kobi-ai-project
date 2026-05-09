# router lari birbirine baglayip uygulamayi baslatir

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core.config import settings

app = FastAPI(
    title="YZTA KOBİ AI Projesi",
    description="Senaryo 1, 2 ve 3'ü destekleyen Backend sistemi",
    version="1.0.0"
)

# frontend ve ai agent baglanabilsin diye CORS ayarlari 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "ASEL KOBİ AI Backend Sistemi Çalışıyor!"}