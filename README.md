# UniHub Workshop

UniHub Workshop is a React/Vite PWA frontend with a Spring Boot backend for workshop registration, paid tickets, QR check-in, admin management, CSV student sync, Cloudinary uploads, and AI workshop summaries.

## Requirements

- JDK 25, because `workshop/pom.xml` currently sets `java.version` to `25`
- Node.js 18+
- PostgreSQL
- Redis only when rate limiting is enabled

## Backend

From the backend folder:

```bash
cd workshop
./mvnw spring-boot:run
```

The backend defaults to `http://localhost:8081`.
Database, OAuth, and mail settings are in `workshop/src/main/resources/application.properties`; update them for your local PostgreSQL or hosted database before running.

Important environment variables:

```bash
SERVER_PORT=8081
RATE_LIMIT_ENABLED=false
SEPAY_ACCOUNT=0396660219
SEPAY_BANK=MBBank
```

`workshop/students.csv` is the sample CSV used by the nightly student sync job. Keep the file in the `workshop/` folder when running the backend from that folder.

## Frontend

From the frontend folder:

```bash
cd web
cp .env.example .env
npm install
npm run dev
```

The frontend dev server uses the Vite proxy:

```bash
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=http://localhost:8081
```

For image/PDF upload and AI summary, fill the Cloudinary and Gemini values in `web/.env`.

## Verification

Commands used to verify the current code:

```bash
cd web && npm run lint
cd web && npm run build
cd workshop && ./mvnw -q -DskipTests package
```
