# core/database.py
# Geriye dönük uyumluluk katmanı.
# Asıl altyapı db/base.py ve db/session.py içindedir.
# Bu dosya re-export sağlar; circular import oluşturmaz.

from app.db.base import Base
from app.db.session import close_db_connections, get_db_session

__all__ = ["Base", "get_db_session", "close_db_connections"]
