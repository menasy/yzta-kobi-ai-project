import redis.asyncio as redis
from app.core.config import get_settings

class RedisService:
    def __init__(self):
        self._client = None

    async def _get_client(self):
        if self._client is None:
            settings = get_settings()
            self._client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        return self._client

    async def set_value(self, key: str, value: str, expire: int = 3600):
        client = await self._get_client()
        await client.set(key, value, ex=expire)

    async def get_value(self, key: str):
        client = await self._get_client()
        return await client.get(key)

    async def delete_value(self, key: str):
        client = await self._get_client()
        await client.delete(key)

    async def incr_with_expire(self, key: str, expire: int) -> int:
        """
        Anahtar değerini artırır; sayaç ilk kez oluştuysa TTL set eder.
        Rate limiting gibi pencere bazlı sayaçlarda kullanılır.
        """
        client = await self._get_client()
        value = await client.incr(key)
        if value == 1:
            await client.expire(key, expire)
        return int(value)

redis_service = RedisService()
