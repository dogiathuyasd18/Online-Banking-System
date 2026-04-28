# Online Banking System

A full-stack online banking prototype with a React/Vite frontend and a Node/Express backend backed by Supabase Auth and Postgres.

## Features

- Email/password authentication through Supabase Auth
- Dashboard with accounts, balances, cards, and 30-day income/expense stats
- Deposit, withdrawal, and account-to-account transfer flows
- Transaction history with account ownership checks
- Profile and card management

## Tech Stack

### Frontend

- React 19
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Lucide React

### Backend

- Node.js
- Express
- TypeScript
- Supabase Auth
- Supabase Postgres with Row Level Security

## Prerequisites

- Node.js 20 or newer is recommended because the installed Supabase SDK declares Node 20+ support.
- A Supabase project.
- The SQL from `backend/supabase_schema.sql` applied in the Supabase SQL editor.

## Backend Setup

1. Create `backend/.env` from `backend/.env.example`.
2. Fill in your Supabase URL, anon key, service role key, and CORS origin.
3. Apply `backend/supabase_schema.sql` in Supabase.
4. Start the API:

```bash
cd backend
npm install
npm run dev
```

The API defaults to `http://localhost:8082`.

## Frontend Setup

1. Create `frontend/.env` from `frontend/.env.example`.
2. Start the app:

```bash
cd frontend
npm install
npm run dev
```

The frontend defaults to `http://localhost:5173`.

## Verification

```bash
cd backend
npm run build

cd ../frontend
npm run lint
npm run build
```

## Security Notes

- Never commit `backend/.env`; it contains the Supabase service role key.
- Rotate the Supabase database password and service role key if they were ever shared.
- User-facing money movement is implemented in SQL RPC functions so balance updates and transaction inserts happen atomically.
