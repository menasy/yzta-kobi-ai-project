import logging
import sys
from loguru import logger

def setup_logging():
    """
    Uygulama genelinde loglama sistemini yapılandırır.
    Hem terminalde renkli çıktı verir hem de hataları takip etmeyi kolaylaştırır.
    """
    
    # 1. Mevcut standart Python logging ayarlarını temizle (çakışma olmasın)
    logging.getLogger().handlers = []
    
    # 2. Loguru yapılandırması
    logger.remove() # Varsayılan ayarları sil
    
    
    logger.add(
        sys.stdout,
        enumerate=True,
        colorize=True,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="INFO"
    )

    # 3. Sadece önemli uyarilar
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

    return logger

# Kolay erişim için hazır bir nesne bırakalım
log = logger