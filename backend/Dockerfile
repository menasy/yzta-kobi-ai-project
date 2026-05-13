# ---- KOBİ AI Agent Backend ----
# Python 3.12 slim image — hafif ve production uyumlu
FROM python:3.12-slim

# Sistem bağımlılıkları (asyncpg build için gerekli olabilir)
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Poetry kurulumu
RUN pip install --no-cache-dir poetry

# Virtualenv oluşturmayı devre dışı bırak (container zaten izole ortam)
RUN poetry config virtualenvs.create false

# Bağımlılık dosyalarını önce kopyala — Docker cache'den yararlanır
COPY pyproject.toml poetry.lock* ./

# Bağımlılıkları yükle (dev dependency'ler hariç)
RUN poetry install --no-interaction --no-ansi --only main --no-root

# Uygulama kodunu kopyala
COPY . .

# Startup script container icinde executable olmali
RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

# Migration + idempotent seed + API start
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
