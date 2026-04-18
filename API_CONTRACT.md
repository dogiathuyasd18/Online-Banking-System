# Banking API Contract

Base URL: `http://localhost:8082`

## Standard Response Format

### Success
```json
{
  "timestamp": "2026-04-18T12:00:00",
  "status": 200,
  "message": "Success message",
  "data": {}
}
```

### Error
```json
{
  "timestamp": "2026-04-18T12:00:00",
  "status": 400,
  "errorCode": "ERROR_CODE",
  "message": "Error message",
  "details": [
    "field: validation message"
  ]
}
```

## Endpoints

### Authentication
- `POST /api/users/register`
- `POST /api/users/login`

### Accounts (JWT required)
- `POST /api/accounts/deposit`
- `POST /api/accounts/withdrawal`
- `POST /api/accounts/transfer`
- `GET /api/accounts/{id}/history`

## Notes For Frontend
- Always read successful payload from `data`.
- Always read failures from `errorCode`, `message`, and optional `details`.
- Use `status` in body only for UI messaging; HTTP status code remains authoritative.
