# User Settings API

Kullanıcı profil ve varsayılan teslimat adresi endpointleri `/api/user` altında çalışır. Tüm endpointler HttpOnly cookie tabanlı auth ister; `access_token` cookie yoksa veya kullanıcı pasifse standart hata response'u döner.

## Endpointler

### GET `/api/user/profile`

Login olmuş kullanıcının kendi profilini getirir.

Success response:

```json
{
  "statusCode": 200,
  "key": "SUCCESS",
  "message": "Profil bilgisi getirildi.",
  "data": {
    "id": 42,
    "email": "ahmet.demir@example.com",
    "full_name": "Ahmet Demir",
    "role": "customer",
    "is_active": true,
    "last_login_at": "2026-05-12T09:15:00Z",
    "created_at": "2026-05-01T10:00:00Z",
    "updated_at": "2026-05-12T09:15:00Z"
  },
  "errors": null
}
```

### PATCH `/api/user/profile`

Kullanıcının kendi profil bilgisini günceller.

Request body:

```json
{
  "full_name": "Ahmet Demir"
}
```

Success response formatı `GET /api/user/profile` ile aynıdır.

### GET `/api/user/address`

Kullanıcının varsayılan teslimat adresini getirir.

Success response:

```json
{
  "statusCode": 200,
  "key": "SUCCESS",
  "message": "Varsayılan teslimat adresi getirildi.",
  "data": {
    "id": 12,
    "full_name": "Ahmet Demir",
    "phone": "05321234567",
    "address": "Atatürk Mah. Cumhuriyet Cad. No: 12 D: 4",
    "city": "İstanbul",
    "district": "Kadıköy",
    "postal_code": "34710",
    "country": "Türkiye",
    "note": "Mesai saatlerinde teslim edilebilir.",
    "created_at": "2026-05-12T09:20:00Z",
    "updated_at": "2026-05-12T09:20:00Z"
  },
  "errors": null
}
```

### PUT `/api/user/address`

Kullanıcının tek varsayılan teslimat adresini oluşturur veya günceller.

Request body:

```json
{
  "full_name": "Ahmet Demir",
  "phone": "05321234567",
  "address": "Atatürk Mah. Cumhuriyet Cad. No: 12 D: 4",
  "city": "İstanbul",
  "district": "Kadıköy",
  "postal_code": "34710",
  "country": "Türkiye",
  "note": "Mesai saatlerinde teslim edilebilir."
}
```

Success response formatı `GET /api/user/address` ile aynıdır.

## Auth

- Guest kullanıcılar erişemez.
- Endpointler `CurrentUser` dependency'si ile cookie tabanlı auth kullanır.
- Token response body içinde dönmez.
- Kullanıcı yalnızca kendi profilini ve adresini yönetir.
- Admin için başka kullanıcı adresi yönetimi yoktur.

## Adres Formatı

Adres request formatı order create requestindeki `shipping` formatıyla aynıdır:

```json
{
  "full_name": "Ahmet Demir",
  "phone": "05321234567",
  "address": "Atatürk Mah. Cumhuriyet Cad. No: 12 D: 4",
  "city": "İstanbul",
  "district": "Kadıköy",
  "postal_code": "34710",
  "country": "Türkiye",
  "note": "Mesai saatlerinde teslim edilebilir."
}
```

`postal_code` ve `note` nullable olabilir. `country` gönderilmezse default `"Türkiye"` kullanılır.

## Error Response Örnekleri

Unauthorized:

```json
{
  "statusCode": 401,
  "key": "UNAUTHORIZED",
  "message": "Yetki belgesi bulunamadı (Cookie eksik).",
  "data": null,
  "errors": null
}
```

Adres bulunamadı:

```json
{
  "statusCode": 404,
  "key": "NOT_FOUND",
  "message": "Varsayılan teslimat adresi bulunamadı.",
  "data": null,
  "errors": null
}
```

Validation:

```json
{
  "statusCode": 422,
  "key": "VALIDATION_ERROR",
  "message": "İstek verisi geçersiz. Lütfen alanları kontrol edin.",
  "data": null,
  "errors": [
    {
      "field": "body → phone",
      "message": "Value error, Telefon numarası 10-15 rakam içermelidir."
    }
  ]
}
```

## Order Shipping Uyumu

`UserAddressUpsert` ve order create içindeki `CustomerShippingCreate` aynı `ShippingAddressBase` şemasını kullanır. Bu yüzden alan adları, telefon normalizasyonu, XSS sanitization ve uzunluk validasyonları tek yerden yönetilir.

## AI Order Flow Notu

AI ile sipariş oluşturma akışı ileride login olmuş kullanıcının `GET /api/user/address` karşılığı olan varsayılan adresini okuyup order create payload içindeki `shipping` alanına doğrudan map edebilir. Address response içindeki shipping alanları order request ile aynı olduğu için ek dönüşüm gerektirmez.
