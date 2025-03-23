

# LinkedIn Assistant - Backend

This repository contains the **MVP backend** for a LinkedIn assistant tool, built with **NestJS**, **PostgreSQL**, and **Redis**. The primary features include:

1. **Post Module** – CRUD for storing LinkedIn posts (or AI-generated posts).  
2. **Schedule Module** – Schedules posts for future publishing.  
3. **Tasks Module** – Uses **BullMQ** to queue and run jobs (e.g., “publish post” at a future date/time).  
4. **Docker** setup with **PostgreSQL** and **Redis**.  
5. **Swagger** documentation.

> **Note**: This MVP intentionally omits user authentication for simplicity.

---

## Project Structure

```
├── src
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── main.ts
│   ├── post
│   │   ├── dto
│   │   │   └── create-post.dto.ts
│   │   ├── post.controller.ts
│   │   ├── post.entity.ts
│   │   ├── post.module.ts
│   │   └── post.service.ts
│   ├── schedule
│   │   ├── dto
│   │   │   └── create-schedule.dto.ts
│   │   ├── schedule.controller.ts
│   │   ├── schedule.entity.ts
│   │   ├── schedule.module.ts
│   │   └── schedule.service.ts
│   └── task
│       ├── tasks.module.ts
│       ├── tasks.service.ts
│       └── tasks.processor.ts
├── .env
├── docker-compose.yml
├── Dockerfile
├── package.json
└── README.md
```

### Key Modules

1. **PostModule**  
   - Manages CRUD for the `Post` entity.  
   - Endpoints at `/posts`:
     - `GET /posts` (list)  
     - `GET /posts/:id` (retrieve)  
     - `POST /posts` (create)  
     - `PATCH /posts/:id` (update)  
     - `DELETE /posts/:id` (delete)

2. **ScheduleModule**  
   - Stores “scheduled posts” in the `ScheduledPost` entity, referencing a `Post`.  
   - Endpoints at `/schedule`:
     - `GET /schedule` (list scheduled items)  
     - `GET /schedule/:id` (retrieve scheduled item)  
     - `POST /schedule` (create scheduled item)  
     - `PATCH /schedule/:id` (update)  
     - `DELETE /schedule/:id` (remove)  
   - Initially built with a **cron** approach, but we now integrate BullMQ to handle future tasks.

3. **TasksModule**  
   - Provides a **BullMQ** queue for scheduling tasks.  
   - Defines a **processor** that runs the job logic at the scheduled time.  
   - Exported `TasksService` can be injected into other modules to queue tasks with a **delay** instead of using cron checks.

---

## Getting Started

### 1. Prerequisites

- **Docker** and **Docker Compose** installed on your machine.
- A **`.env`** file with the following environment variables (adjust if needed):
  ```bash
  DB_HOST=db
  DB_PORT=5432
  DB_USER=postgres
  DB_PASS=postgres
  DB_NAME=linkedin_assistant

  REDIS_HOST=redis
  REDIS_PORT=6379
  ```

### 2. Cloning & Setup

```bash
git clone https://github.com/yourusername/linkedin-assistant.git
cd linkedin-assistant
```

Make sure you have the following structure:

- `Dockerfile`  
- `docker-compose.yml`  
- `package.json`, `package-lock.json`  
- `src/` folder with all NestJS code  
- `.env` file with your environment variables

### 3. Docker Compose

We use **docker-compose.yml** to spin up:

1. **backend** (NestJS application)  
2. **db** (PostgreSQL 14-alpine)  
3. **redis** (Redis 7-alpine)

#### Example `docker-compose.yml`

```yaml
version: '3.8'
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: linkedin_assistant_backend
    ports:
      - "3010:3010"
    env_file:
      - ./.env
    environment:
      NODE_ENV: development
      DB_HOST: ${DB_HOST}
      DB_PORT: ${DB_PORT}
      DB_USER: ${DB_USER}
      DB_PASS: ${DB_PASS}
      DB_NAME: ${DB_NAME}

      REDIS_HOST: ${REDIS_HOST}
      REDIS_PORT: ${REDIS_PORT}
    depends_on:
      - db
      - redis

  db:
    image: postgres:14-alpine
    container_name: linkedin_assistant_db
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASS}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: linkedin_assistant_redis
    ports:
      - "6379:6379"
    # volumes:
    #   - redis_data:/data

volumes:
  db_data:
  # redis_data:
```

### 4. Dockerfile

A multi-stage build that compiles NestJS and runs it:

```dockerfile
# Stage 1: Build NestJS
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --production
EXPOSE 3010
CMD ["node", "dist/main.js"]
```

### 5. Running the App

From the project root:

```bash
docker compose build
docker compose up
```

- The NestJS app (backend) is exposed on **port 3010**.  
- PostgreSQL is on 5432 (mapped locally).  
- Redis is on 6379.

Once containers are up, check logs:

```bash
docker compose logs backend
```

You should see NestJS start and connect to both Postgres and Redis.

---

## Usage

### Swagger API Docs

By default, **Swagger** is enabled if you have it set up in `main.ts`.  
- Open `http://localhost:3010/api` (replace `localhost` with your Docker host if remote).  
- Interact with endpoints under `posts` and `schedule`.  
- If you added a “tasks” or “ai” route, it should appear as well.

### Creating a Post

```bash
POST http://localhost:3010/posts
Body: {
  "content": "Hello from the MVP!"
}
```

### Scheduling a Post

```bash
POST http://localhost:3010/schedule
Body: {
  "postId": 1,
  "scheduledAt": "2025-03-25T10:00:00Z"
}
```
(Or, if using BullMQ for scheduling with a delay, your `ScheduleController` might compute the delay in milliseconds and add a job to a queue.)

---

## Additional Notes

1. **BullMQ & TaskModule**  
   - We replaced the old cron-based approach with **BullMQ**.  
   - `TasksService` can add delayed jobs (e.g., publishing a post in the future).  
   - `tasks.processor.ts` automatically handles the job at the right time.

2. **Environment Variables**  
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`: PostgreSQL settings  
   - `REDIS_HOST`, `REDIS_PORT`: Redis settings  
   - `NODE_ENV`: For environment mode (e.g., development/production)

3. **Development vs Production**  
   - In production, you might want to disable `synchronize: true` in `TypeOrmModule.forRoot` to avoid accidental schema drops/changes.  
   - Make sure you have a stable Redis and Postgres instance with persistent volumes if you’re storing real data.

4. **Future Enhancements**  
   - **Auth** module for multi-user scenario.  
   - **AI** module to integrate with OpenAI or another LLM.  
   - **Notifications** (email, Slack, etc.) for daily/weekly summaries or post reminders.

---

## Troubleshooting

1. **Connection Refused**  
   - If Nest can’t reach Postgres or Redis, confirm your `.env` matches Docker service names (`db`, `redis`).  
   - Check that Docker containers are running.

2. **UnknownDependenciesException** (Common in Nest)  
   - Means a controller is trying to inject a service that isn’t exported/imported properly in the modules.  
   - Make sure you **export** your service in one module and **import** that module in the module that needs it.

3. **`crypto.randomUUID`** not found error with `@nestjs/schedule`  
   - If you see this while using Node 18, you might need a shim or a more recent version of Nest Schedule or define `global.crypto`.

---

## Contributing

1. **Fork** this repo.  
2. **Create** a feature branch.  
3. **Commit** your changes.     
4. **Push** and open a **Pull Request**.

---
