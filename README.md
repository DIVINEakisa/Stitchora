# Stitchora

Premium custom fashion and tailoring platform connecting customers with professional designers.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios, Socket.io Client |
| Backend | Node.js, Express, MongoDB (Mongoose), JWT, Socket.io, Cloudinary |

## Features

- **Landing page** — Hero, how it works, featured designers & fabrics, testimonials
- **Customer dashboard** — Multi-step order creation (design upload, measurements, fabric, timeline)
- **Order tracking** — Status timeline, 50/50 deposit payment workflow
- **Designer dashboard** — Accept/reject requests, status management, pricing
- **Real-time chat** — Per-order messaging with image sharing (Socket.io)
- **Role-based auth** — Customer and designer JWT authentication

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env` with your MongoDB URI and optional Cloudinary credentials. Without Cloudinary, uploads use placeholder images.

### 3. Seed demo data

```bash
npm run seed
```

### 4. Run development servers

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:5000

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@stitchora.demo | customer123 |
| Designer | elena@stitchora.demo | designer123 |

## Project Structure

```
Stitchora/
├── client/          # React + Vite frontend
│   └── src/
│       ├── api/           # Axios instance
│       ├── components/    # UI, layout, orders
│       ├── context/       # Auth & Socket providers
│       └── pages/         # Route pages
├── server/          # Express API
│   └── src/
│       ├── models/        # Mongoose schemas
│       ├── routes/        # REST endpoints
│       └── socket/        # Socket.io handlers
└── package.json     # Root scripts
```

## Order Lifecycle

1. Customer submits order (status: `requested`)
2. Designer accepts with price (status: `reviewed`) or rejects
3. Customer pays 50% deposit (status: `deposit_paid`)
4. Designer updates to `in_production` → `ready`
5. Customer pays remaining 50% (payment: `fully_paid`)
6. Customer confirms delivery (status: `delivered`)

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/orders/my` | User's orders |
| POST | `/api/orders` | Create order (customer) |
| PATCH | `/api/orders/:id/accept` | Accept order (designer) |
| POST | `/api/orders/:id/pay-deposit` | Pay deposit (customer) |
| POST | `/api/upload` | Upload image to Cloudinary |

## Design System

- **Primary:** #0F3A20 (Deep Emerald)
- **Accent:** #D4AF37 (Soft Gold)
- **Fonts:** Playfair Display (headings), Inter (body)

## Production Notes

- Set strong `JWT_SECRET` in production
- Configure Cloudinary for real image uploads
- Use MongoDB Atlas for hosted database
- Build client: `npm run build --prefix client`
- Serve `client/dist` behind nginx or similar; proxy `/api` to Express
