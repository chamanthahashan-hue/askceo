# AskCEO Internal Communication Platform (MVP)

A simple web-based platform where employees submit categorized requests directly to the CEO, and the CEO manages responses, statuses, categories, and analytics.

## Repo Structure

- `client/` - React + Vite frontend.
- `server/` - Node.js + Express + MongoDB backend.

## Features Implemented

- Employee registration/login (name, email, password, branch, post).
- CEO seeded admin account from env variables.
- Category management (create/edit/delete) for CEO.
- Request submission with category, title, description, priority, and up to 3 attachments (PDF/images, 5MB each).
- Threaded communication between employee and CEO.
- CEO actions: reply, approve, reject (reason required).
- Request statuses: Pending, In Progress, Approved, Rejected.
- CEO dashboard summary cards + category bar chart + requests table.
- Employee dashboard with personal request list.
- Live updates with Socket.io (new requests and replies).
- JWT auth, bcrypt password hashing, basic submission rate limiting.
- Jest + Supertest API tests.

## Default CEO Credentials

Configured by environment variables, defaults are:

- Email: `ceo@company.com`
- Password: `admin123`

## Setup

### 1) Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2) Configure environment variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Update values as needed, especially `JWT_SECRET` and `MONGO_URI`.

### 3) Run backend

```bash
cd server
npm run dev
```

Backend runs at `http://localhost:5000`.

### 4) Run frontend

```bash
cd client
npm run dev
```

Frontend runs at `http://localhost:3000`.

## API Test

```bash
cd server
npm test
```

## Suggested manual MVP flow

1. Register an employee account.
2. Login as employee and submit a request.
3. Login as CEO (`ceo@company.com`) and view dashboard.
4. Open request, reply, then approve/reject with reason.
5. Switch back to employee and verify thread/status updates.

## Notes

- This MVP is desktop-first (`min-width: 1024px`) per requirement.
- No email verification.
- Only basic role split (`employee` vs `admin`).
