# MedCentre Backend API

Production-ready Node.js, Express, and TypeScript backend for the **MedCentre AI-Powered Healthcare & Medicine Platform**.

---

## 🏛️ Architecture

```
backend/
├── src/
│   ├── config/          # Environment variables (Zod validated), Prisma DB client, Logger
│   ├── constants/       # Role definitions, Order/Appointment statuses, HTTP codes
│   ├── controllers/     # Route controllers & business orchestration (Health, etc.)
│   ├── middleware/      # Centralized error handler, request logger, not found handler
│   ├── routes/          # API route definitions & router mounting
│   ├── services/        # Service domain abstractions (OCR, Auth, Pharmacy matching, etc.)
│   ├── types/           # Express user augmentation & API response interfaces
│   ├── utils/           # AppError, ApiResponse helper, structured logger
│   ├── validators/      # Zod validation schemas for requests
│   ├── app.ts           # Express application setup (Helmet, CORS, body parsers, routes)
│   └── server.ts        # Server entry point & graceful shutdown lifecycle
├── prisma/
│   ├── schema.prisma    # Full 18-model healthcare schema (PostgreSQL / SQLite)
│   └── seed.ts          # Development database seed script
├── uploads/             # Directory for prescription and document file storage
├── .env.example         # Environment variables template
├── package.json         # Dedicated backend dependencies & scripts
├── tsconfig.json        # Strict TypeScript compiler configuration
└── README.md
```

---

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript (Strict Mode)
- **Database ORM**: Prisma ORM (PostgreSQL / SQLite)
- **Validation**: Zod
- **Security**: Helmet, CORS, JWT, BcryptJS
- **Logging**: Structured Request Telemetry

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and configure your settings:
```bash
cp .env.example .env
```

### 3. Database Setup & Seed
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```

The server will listen at **`http://localhost:5001`**.

---

## 🩺 Health Check Endpoint

- **URL**: `GET /api/health`
- **Response**:
```json
{
  "success": true,
  "data": {
    "service": "medcentre-backend",
    "status": "healthy",
    "message": "MedCentre backend is running",
    "database": "connected",
    "environment": "development",
    "timestamp": "2026-08-18T...",
    "uptimeSeconds": 42.5
  }
}
```
