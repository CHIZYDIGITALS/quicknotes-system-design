# QuickNotes Architecture Document

## 1. Requirements

### Functional Requirements

- User authentication and secure session management.
- Full CRUD operations for notes (Create, Read, Update, Delete).
- Tagging and categorization support for notes.
- Instant client-side feedback during network requests with disabled buttons and clear status states.

### Non-Functional Requirements

- **High Availability**: 99.9% uptime target to support 1 million active users.
- **Low Latency**: Read and write responses under 200ms globally.
- **Scalability**: Horizontal scalability across application and database tiers.
- **Security**: Encrypted data in transit (HTTPS/TLS) and at rest.

---

## 2. Load Estimates (1 Million Users)

- **Active Users**: 1 million daily active users (DAU).
- **Reads per Second (RPS)**: Assuming an average user fetches notes 20 times a day:
  $$\text{Total Reads} = 1,000,000 \times 20 = 20,000,000 \text{ reads/day}$$
  $$\text{RPS} = \frac{20,000,000}{86,400 \text{ seconds}} \approx 231 \text{ reads/sec (Peak: } \sim 700 \text{ RPS)}$$
- **Writes per Second (WPS)**: Assuming an average user creates/updates 2 notes a day:
  $$\text{Total Writes} = 1,000,000 \times 2 = 2,000,000 \text{ writes/day}$$
  $$\text{WPS} = \frac{2,000,000}{86,400 \text{ seconds}} \approx 23 \text{ writes/sec (Peak: } \sim 70 \text{ WPS)}$$
- **Storage per Year**: Assuming each note averages 2 KB of text and metadata:
  $$\text{Daily Storage} = 2,000,000 \times 2 \text{ KB} = 4,000,000 \text{ KB} \approx 4 \text{ GB/day}$$
  $$\text{Annual Storage} = 4 \text{ GB} \times 365 = 1,460 \text{ GB} \approx 1.46 \text{ TB/year}$$

---

## 3. Architecture Diagram

```text
[ Client (Browser / PWA) ]
          │
          ▼
    [ Cloudflare DNS ]
          │
          ▼
   [ Cloudflare CDN ] (Static Assets & Edge Caching)
          │
          ▼
   [ Application Load Balancer (ALB) ]
          ┌────────────────┴────────────────┐
          ▼                                 ▼
   [ App Server 1 ]                  [ App Server 2 ]
          │                                 │
          ├─────────────────────────────────┤
          ▼                                 ▼
   [ Redis Cache ]               [ Message Queue (RabbitMQ / SQS) ]
          │                                 │
          ▼                                 ▼
   [ Primary PostgreSQL ] ──(Replication)──► [ Read Replica ]
4. Component Explanations (One Sentence Per Component)
Client: The browser-based interface where users interact with the QuickNotes application UI.
DNS: Translates user-friendly domain names into secure server IP addresses.
CDN: Caches static assets at edge locations globally to minimize load latency and bandwidth costs.
Load Balancer: Distributes incoming HTTP traffic evenly across multiple application servers to prevent bottlenecks.
App Servers: Stateless backend nodes running API logic to process user requests, authentication, and validation.
Cache (Redis): In-memory store that caches frequently accessed user session data and recent note queries to drastically cut database read times.
Primary Database: The master PostgreSQL instance responsible for handling all write transactions (INSERT, UPDATE, DELETE).
Read Replica: Synchronized copy of the primary database dedicated to handling read-heavy queries.
Queue with Worker: Asynchronous message broker that offloads background jobs like email notifications and analytics logging from the main web request thread.
5. Step-by-Step Request Flows
Flow 1: GET /notes
The client sends an HTTP GET request to https://api.quicknotes.com/api/v1/notes.
The Load Balancer routes the request to an available App Server.
The App Server checks the Redis Cache for the user's cached note list. If a cache hit occurs, it returns immediately.
On a cache miss, the App Server queries the Database Read Replica.
The Read Replica returns the data, which is then cached in Redis and sent back to the client as JSON (200 OK).
Flow 2: POST /notes
The client sends an HTTP POST request containing the note payload to the Load Balancer.
The App Server receives the request and validates the input (e.g., title presence and length).
The App Server executes an INSERT statement on the Primary PostgreSQL Database.
The database confirms the write and returns the generated ID and timestamps.
The App Server invalidates the user's Redis cache entry and returns 201 Created with the new note body to the client.
6. Trade-offs and High Availability
Trade-offs Chosen
Eventual Consistency vs. Strong Consistency for Reads: By utilizing database read replicas and caching, read performance scales massively, but users may experience a split-second delay seeing newly updated items across different edge regions.
Relational Storage Complexity: Opting for PostgreSQL over a simple document store introduces foreign key constraints and schema migrations, which require careful deployment planning but guarantee data integrity.
Avoiding Single Points of Failure (SPOFs)
Application Tier: Multiple redundant application servers behind an autoscaling Load Balancer ensure that if one server crashes, traffic is instantly rerouted.
Database Tier: The Primary database is paired with an automated failover Read Replica setup, ensuring high availability even during database hardware maintenance or outages.
```
