# Notification API (Swagger)

Base path: `/api/notifications`

Auth:
- Admin required (see services doc).

All endpoints return the standard envelope:

```json
{
  "statusCode": 200,
  "key": "SUCCESS",
  "message": "...",
  "data": {},
  "errors": null
}
```

Data types referenced below are from `app/schemas/notification.py`.

---

## GET `/api/notifications/`
Tum bildirimleri listeler (sayfali).

Request type:
- GET, no body

Query params:
- `skip` (int, default 0)
- `limit` (int, default 50, max 100)

How it works:
- Veritabani uzerinden bildirimleri getirir.

Response data type:
- `NotificationListItem[]`

Example request:

```bash
curl -X GET "http://localhost:8000/api/notifications?skip=0&limit=50" \
  -H "Accept: application/json"
```

Example response:

```json
{
  "statusCode": 200,
  "key": "SUCCESS",
  "message": "Bildirimler listelendi.",
  "data": [
    {
      "id": 1204,
      "type": "LOW_STOCK_ALERT",
      "title": "Kritik stok uyarisi: Kablosuz Mouse",
      "severity": "warning",
      "is_read": false,
      "read_at": null,
      "created_at": "2026-05-10T22:00:00Z"
    }
  ],
  "errors": null
}
```

---

## GET `/api/notifications/unread`
Okunmamis bildirimleri listeler (sayfali).

Request type:
- GET, no body

Query params:
- `skip` (int, default 0)
- `limit` (int, default 50, max 100)

How it works:
- `is_read = false` olan kayitlari getirir.

Response data type:
- `NotificationListItem[]`

Example request:

```bash
curl -X GET "http://localhost:8000/api/notifications/unread?skip=0&limit=50" \
  -H "Accept: application/json"
```

Example response:

```json
{
  "statusCode": 200,
  "key": "SUCCESS",
  "message": "Okunmamis bildirimler listelendi.",
  "data": [
    {
      "id": 1204,
      "type": "LOW_STOCK_ALERT",
      "title": "Kritik stok uyarisi: Kablosuz Mouse",
      "severity": "warning",
      "is_read": false,
      "read_at": null,
      "created_at": "2026-05-10T22:00:00Z"
    }
  ],
  "errors": null
}
```

---

## PATCH `/api/notifications/{notification_id}/read`
Tek bildirimi okundu olarak isaretler.

Request type:
- PATCH, no body

Path params:
- `notification_id` (int)

How it works:
- Belirtilen bildirimi okundu yapar ve `read_at` doldurur.

Response data type:
- `NotificationMarkReadResponse`

Example request:

```bash
curl -X PATCH "http://localhost:8000/api/notifications/1204/read" \
  -H "Accept: application/json"
```

Example response:

```json
{
  "statusCode": 200,
  "key": "SUCCESS",
  "message": "Bildirim okundu olarak isaretlendi.",
  "data": {
    "id": 1204,
    "is_read": true,
    "read_at": "2026-05-10T22:15:00Z",
    "updated_at": "2026-05-10T22:15:00Z"
  },
  "errors": null
}
```

---

## PATCH `/api/notifications/read-all`
Tum okunmamis bildirimleri okundu olarak isaretler.

Request type:
- PATCH, no body

How it works:
- Okunmamis kayitlari gunceller ve sayisini dondurur.

Response data type:
- `{ "updated_count": int }`

Example request:

```bash
curl -X PATCH "http://localhost:8000/api/notifications/read-all" \
  -H "Accept: application/json"
```

Example response:

```json
{
  "statusCode": 200,
  "key": "SUCCESS",
  "message": "5 bildirim okundu.",
  "data": {
    "updated_count": 5
  },
  "errors": null
}
```

---

## GET `/api/notifications/stream` (SSE)
Canli bildirim akisi (Server-Sent Events).

Request type:
- GET, no body

How it works:
- Redis pub/sub uzerinden bildirimleri `text/event-stream` ile yayinlar.
- Her event arasinda baglanti dusmemesi icin `: ping` gonderir.

Response content type:
- `text/event-stream`

Events:
- `notification`: `data` bir JSON string bildirim payload'idir.
- `summary_update`: `data` `{ "summary": string }` seklindedir.

Example request (browser):

```js
const source = new EventSource("/api/notifications/stream", { withCredentials: true });
source.addEventListener("notification", (e) => console.log(JSON.parse(e.data)));
source.addEventListener("summary_update", (e) => console.log(JSON.parse(e.data)));
```

Example stream chunks:

```text
event: notification
data: {"id":1204,"type":"LOW_STOCK_ALERT","title":"Kritik stok uyarisi: Kablosuz Mouse","message":"MS-001 kodlu urun icin stok 3 adede dustu. Esik degeri: 10.","severity":"warning","payload":{"product_id":101,"product_name":"Kablosuz Mouse","sku":"MS-001","current_quantity":3,"threshold":10},"created_at":"2026-05-10T22:00:00Z"}

event: summary_update
data: {"summary":"Son 24 saat icinde herhangi bir kargo gecikmesi tespit edilmedi."}
```

---

## GET `/api/notifications/daily-summary`
Gunluk gecikme ozetini getirir.

Request type:
- GET, no body

How it works:
- Son 24 saat gecikme bildirimlerini analiz eder, metin ozet dondurur.

Response data type:
- `{ "summary": string }`

Example request:

```bash
curl -X GET "http://localhost:8000/api/notifications/daily-summary" \
  -H "Accept: application/json"
```

Example response:

```json
{
  "statusCode": 200,
  "key": "SUCCESS",
  "message": "Ozet rapor hazirlandi.",
  "data": {
    "summary": "Son 24 saat icinde herhangi bir kargo gecikmesi tespit edilmedi."
  },
  "errors": null
}
```
