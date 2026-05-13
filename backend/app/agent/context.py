from pydantic import BaseModel

class AgentContext(BaseModel):
    """
    AI Agent operasyonlarında yetkilendirme ve sahiplik kontrolleri
    için kullanılan bağlam sınıfı.
    """
    user_id: int
    role: str
    customer_id: int | None
    session_id: str
