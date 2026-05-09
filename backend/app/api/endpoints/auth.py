# kullanici girisi kayit

from fastapi import APIRouter, Depends, HTTPException, status
from app.core.responses import success_response

router = APIRouter()

@router.post("/register")
async def register():
    return success_response(message="Kayıt başarılı.")

@router.post("/login")
async def login():
    return success_response(message="Giriş başarılı. Token oluşturuldu.")

@router.get("/me")
async def get_me():
    return success_response(data={"user": "asel_admin"}, message="Kullanıcı bilgileri alındı.")