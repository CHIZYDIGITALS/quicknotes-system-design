# QuickNotes Data Model Document

## 1. Entities and Schema Overview

The database comprises four core entities supporting user management, note storage, categorization tags, and their many-to-many relationship mapping:

1. **`users`**: Stores user account credentials and profile metadata.
   - `id` (UUID, Primary Key)
   - `email` (VARCHAR, Unique, Not Null)
   - `password_hash` (VARCHAR, Not Null)
   - `created_at` (TIMESTAMP)

2. **`notes`**: Stores individual note documents created by users.
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key referencing `users(id)`, Not Null)
   - `title` (VARCHAR(100), Not Null)
   - `body` (TEXT)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

3. **`tags`**: Stores categorical labels for organizing notes.
   - `id` (SERIAL / INT, Primary Key)
   - `name` (VARCHAR(50), Unique, Not Null)

4. **`note_tags`**: Junction table mapping many-to-many relationships between notes and tags.
   - `note_id` (UUID, Foreign Key referencing `notes(id)`, On Delete Cascade)
   - `tag_id` (INT, Foreign Key referencing `tags(id)`, On Delete Cascade)
   - _Primary Key_: `(note_id, tag_id)`

---

## 2. Explanation of Relationships

- **One-to-Many (`users` to `notes`)**: A single user can create and own multiple notes, but each individual note belongs to exactly one user. Enforced by the `user_id` foreign key column in the `notes` table.
- **Many-to-Many (`notes` to `tags`)**: A single note can be associated with multiple tags (e.g., `#work`, `#urgent`), and a single tag can be applied to multiple notes. This is resolved using the junction table `note_tags`.

---

## 3. SQL `CREATE TABLE` Statements

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE note_tags (
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);
4. Example SQL Queries
Query 1: Retrieve all notes for a specific user ordered by creation date
SELECT id, title, body, created_at
FROM notes
WHERE user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
ORDER BY created_at DESC;
Query 2: Find all notes associated with a specific tag name (Using a JOIN)
SELECT n.id, n.title, n.body
FROM notes n
JOIN note_tags nt ON n.id = nt.note_id
JOIN tags t ON nt.tag_id = t.id
WHERE t.name = 'architecture';
Query 3: Count the total number of notes created per user
SELECT u.email, COUNT(n.id) AS total_notes
FROM users u
LEFT JOIN notes n ON u.id = n.user_id
GROUP BY u.id, u.email;
5. Database Indexing Strategy
Index: CREATE INDEX idx_notes_user_id ON notes(user_id);
Justification: Because the application serves 1 million users fetching their specific lists of notes (GET /api/v1/notes), queries filtering by user_id will run constantly. Without an index, the database would perform a costly full table scan across millions of rows. This index guarantees rapid lookup times.
6. Justification of Relational (SQL) Choice
For QuickNotes, a relational database (SQL) such as PostgreSQL is chosen over NoSQL because notes require strict schema enforcement (e.g., maximum character limits on titles, foreign key referential integrity between users and notes) and involve structured multi-table relationships (users, notes, tags, and join tables) that benefit heavily from relational joins and atomic transactions.
```
