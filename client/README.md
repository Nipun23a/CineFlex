# CineFlex — Client

React frontend for the CineFlex movie booking application, built with Vite.

## Tech Stack

- **React 19** with React Router DOM 7
- **Tailwind CSS 4** for styling
- **Stripe** for payment UI
- **Socket.io Client** for real-time seat availability
- **Axios** for API communication
- **jsPDF** + **QRCode** for ticket generation

## Getting Started

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env` file in this directory:

```env
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
```

### Scripts

```bash
npm run dev       # Start development server (http://localhost:5173)
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## Project Structure

```
src/
├── components/      # Reusable UI components (Navbar, Footer, MovieCard, etc.)
├── pages/           # Page-level components
│   ├── admin/       # Admin dashboard pages
│   └── auth/        # Login & Register pages
├── context/         # React context providers
├── layouts/         # Layout wrappers
└── utils/           # Helper utilities
```

For full project documentation, see the [root README](../README.md).
