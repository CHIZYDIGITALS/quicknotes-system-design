# QuickNotes API Design Document

## 1. REST Endpoints Overview

| Method     | Path                 | Description                                                   | Success Status Code |
| :--------- | :------------------- | :------------------------------------------------------------ | :------------------ |
| **GET**    | `/api/v1/notes`      | Retrieve a paginated list of notes for the authenticated user | `200 OK`            |
| **POST**   | `/api/v1/notes`      | Create a new note                                             | `201 Created`       |
| **GET**    | `/api/v1/notes/{id}` | Retrieve a specific note by ID                                | `200 OK`            |
| **PUT**    | `/api/v1/notes/{id}` | Fully update an existing note                                 | `200 OK`            |
| **DELETE** | `/api/v1/notes/{id}` | Delete a specific note by ID                                  | `204 No Content`    |
| **GET**    | `/api/v1/tags`       | List all tags associated with the user's notes                | `200 OK`            |

---

## 2. Request and Response Examples

### Creating a Note (`POST /api/v1/notes`)

**Request Body:**

```json
{
  "title": "System Architecture Review",
  "body": "Discuss caching strategies and database read replicas with the backend team.",
  "tags": ["architecture", "backend"]
}
Response Body (201 Created):

{
  "id": "note_9823fha9",
  "user_id": "usr_7712abc",
  "title": "System Architecture Review",
  "body": "Discuss caching strategies and database read replicas with the backend team.",
  "created_at": "2026-10-12T05:00:00Z",
  "updated_at": "2026-10-12T05:00:00Z"
}
Listing Notes (GET /api/v1/notes)
Response Body (200 OK):

{
  "page": 1,
  "limit": 10,
  "total": 42,
  "data": [
    {
      "id": "note_9823fha9",
      "title": "System Architecture Review",
      "body": "Discuss caching strategies and database read replicas with the backend team.",
      "created_at": "2026-10-12T05:00:00Z"
    }
  ]
}
3. Error Status Codes and Example Body
The API uses standard HTTP status codes to communicate error conditions:

400 Bad Request: Validation failure (e.g., missing title or title exceeding 100 characters).
401 Unauthorized: Missing or invalid authentication token.
403 Forbidden: The authenticated user lacks permission to access or modify the specified resource.
404 Not Found: The requested note or endpoint does not exist.
500 Internal Server Error: An unexpected server or database failure occurred.
Example Error Response Body (400 Bad Request):

{
  "error": {
    "code": "BAD_REQUEST",
    "status": 400,
    "message": "Validation failed: Title is required and cannot exceed 100 characters."
  }
}
```
