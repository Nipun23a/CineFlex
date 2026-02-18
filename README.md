# CineFlex

A full-stack movie booking web application built with React, Node.js, Express, and MongoDB. CineFlex allows users to browse movies, select showtimes, book seats, and pay online — with real-time seat availability powered by WebSockets.

---

## Features

### User
- Browse and search movies
- View movie details and available showtimes
- Interactive seat selection with real-time availability
- Secure online payments via Stripe
- Downloadable PDF tickets with QR codes
- User profile and booking history

### Admin
- Dashboard with overview stats
- Manage movies, theaters, showtimes, and bookings
- Manage users and settings

---

## Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React 19 | UI framework |
| Vite | Build tool & dev server |
| React Router DOM 7 | Client-side routing |
| Tailwind CSS 4 | Styling |
| Stripe (React + JS) | Payment integration |
| Socket.io Client | Real-time seat updates |
| Axios | HTTP requests |
| jsPDF | PDF ticket generation |
| QRCode | QR code generation for tickets |
| Lucide React | Icon library |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express 5 | REST API server |
| MongoDB + Mongoose | Database |
| Socket.io | Real-time WebSocket server |
| JWT + bcryptjs | Authentication & password hashing |
| Stripe | Payment processing |
| Morgan | HTTP request logging |
| dotenv | Environment configuration |

---

## Project Structure

```
CineFlex/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   │   ├── admin/       # Admin panel pages
│   │   │   └── auth/        # Login & Register pages
│   │   ├── context/         # React context providers
│   │   ├── layouts/         # Layout components
│   │   └── utils/           # Utility functions
│   ├── public/
│   └── package.json
│
└── server/                  # Node.js backend
    ├── config/              # Database configuration
    ├── controllers/         # Route controllers
    ├── middleware/          # Express middleware
    ├── models/              # Mongoose models
    │   ├── User.js
    │   ├── Movie.js
    │   ├── Theater.js
    │   ├── Showtime.js
    │   └── Booking.js
    ├── routes/              # API routes
    ├── seeders/             # Database seeders
    ├── ws.js                # Socket.IO setup
    └── server.js            # Entry point
```

---

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- Stripe account (for payments)

### 1. Clone the repository

```bash
git clone https://github.com/Nipun23a/CineFlex.git
cd CineFlex
```

### 2. Set up the server

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
CLIENT_ORIGIN=http://localhost:5173
SEED_ON_START=true   # Set to true to seed sample data on first run
```

Start the server:

```bash
npm run dev
```

### 3. Set up the client

```bash
cd client
npm install
```

Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
```

Start the client:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT |
| GET | `/api/movies` | Get all movies |
| GET | `/api/movies/:id` | Get movie details |
| GET | `/api/showtimes` | Get showtimes |
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings` | Get user bookings |
| GET | `/api/theaters` | Get theaters |
| GET | `/api/admin/*` | Admin routes (protected) |

---

## Scripts

### Client (`client/`)
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

### Server (`server/`)
```bash
npm run dev       # Start with nodemon (hot reload)
npm start         # Build and start for production
```

---

## License

This project is licensed under the ISC License.
