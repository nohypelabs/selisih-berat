# Selisih Berat - J&T Express

> Aplikasi pencatatan selisih berat untuk operasional logistik dengan UI modern, earnings tracking, dan analytics real-time

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ecf8e)](https://supabase.com/)

## Features

### Core Features
- **Weight Entry Management** — Record and track weight discrepancies with barcode scanning
- **Real-time Dashboard** — Live statistics, earnings chart (crypto portfolio style), and analytics
- **Earnings System** — Per-entry rate + daily bonus, with period filter (1D/7D/30D/All)
- **Leaderboard System** — Gamified performance tracking for team members
- **Photo Management** — Upload and manage proof photos with Cloudinary integration
- **Data Management** — Comprehensive CRUD operations with bulk actions and export (Excel/CSV)
- **User Authentication** — Secure JWT-based authentication with role-based access

### UI/UX Features
- **Glassmorphism Design** — Transparent glass effects on sidebar and bottom navigation
- **Mobile-First** — Optimized for mobile with bottom sheet modals and compact layouts
- **Lucide Icons** — Consistent icon system across all pages
- **Area Chart** — Earnings visualization with gradient fill (Binance portfolio style)
- **Bottom Navigation** — Floating glass nav with scan barcode center button
- **Top Bar** — App icon, page title, and settings access
- **Compact Filters** — Inline filter bars on all data pages

### Technical Features
- **Progressive Web App (PWA)** — Install and use offline
- **Responsive Design** — Mobile-first approach for all device sizes
- **Error Boundaries** — Graceful error handling with user-friendly messages
- **Toast Notifications** — Real-time feedback with queue management
- **Type Safety** — Full TypeScript implementation
- **GPS Integration** — Auto-location with retry on permission denial
- **Image Optimization** — Auto-compression and watermark on photo upload

### User Roles
- **User** — Entry creation, view dashboard, view leaderboard, view earnings
- **Admin** — All user features plus data management, photo management, settings

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.9
- **Styling:** Tailwind CSS 3.4
- **Database:** Supabase (PostgreSQL)
- **Authentication:** JWT with bcryptjs
- **Image Upload:** Cloudinary
- **Barcode Scanner:** Quagga2
- **Charts:** Recharts
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **File Processing:** XLSX, JSZip, PapaParse
- **PWA:** next-pwa

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account and project
- Cloudinary account (for photo uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd serat-qc
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your actual values (see Environment Variables section below)

4. **Set up Supabase database**

   Create the required tables in your Supabase project (see `database/` folder for schema)

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

See `.env.example` for a complete list. Key variables:

### Required
- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Your Supabase service role key
- `JWT_SECRET` — Secret for JWT signing (min 32 chars)
- `JWT_REFRESH_SECRET` — Secret for refresh token signing

### Optional
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` — For photo uploads
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` — Cloudinary preset
- `NEXT_PUBLIC_CLOUDINARY_FOLDER` — Cloudinary folder name

## Project Structure

```
serat-qc/
├── app/
│   ├── (auth)/              # Authentication routes
│   │   ├── login/
│   │   └── signup/
│   ├── (protected)/         # Protected routes
│   │   ├── dashboard/       # Main dashboard with earnings chart
│   │   ├── entry/           # Weight entry form
│   │   ├── leaderboard/     # Performance rankings
│   │   ├── my-entries/      # User's entry history
│   │   ├── profile/         # User profile & logout
│   │   ├── data-management/ # Admin: all entries management
│   │   ├── foto-management/ # Admin: photo management
│   │   ├── settings/        # Admin: earnings configuration
│   │   └── changelog/       # Update history
│   ├── api/                 # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── entries/         # Entry CRUD + stats
│   │   ├── earnings/        # Earnings calculation with period filter
│   │   ├── leaderboard/     # Leaderboard rankings
│   │   ├── photos/          # Photo management
│   │   ├── settings/        # Earnings settings
│   │   └── users/           # User profile
│   └── layout.tsx           # Root layout
├── components/
│   ├── charts/              # Chart components
│   ├── earnings/            # Earnings card & calculator
│   ├── entry/               # Entry form components
│   ├── modals/              # Detail & photo viewer modals
│   ├── navigation/          # Top bar, sidebar, bottom nav
│   ├── photos/              # Photo grid & filters
│   ├── tables/              # Data tables
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── middleware/           # Auth middleware
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   └── supabase/            # Supabase client
├── public/
│   ├── icon-latest.png      # App icon
│   ├── manifest.json        # PWA manifest
│   └── sw.js                # Service worker
└── database/                # Database schema & migrations
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` — Create new user
- `POST /api/auth/login` — User login
- `POST /api/auth/refresh` — Refresh access token
- `POST /api/auth/change-password` — Change user password

### Entries
- `GET /api/entries` — List entries (with pagination & filters)
- `POST /api/entries` — Create new entry
- `GET /api/entries/[id]` — Get single entry
- `DELETE /api/entries/[id]` — Delete entry
- `GET /api/entries/stats` — Get entry statistics
- `POST /api/entries/bulk-update` — Bulk status update
- `POST /api/entries/bulk-delete` — Bulk delete

### Earnings
- `GET /api/earnings/[username]` — Get user earnings (supports `?period=1d|7d|30d|all`)

### Settings
- `GET /api/settings` — Get earnings settings
- `PUT /api/settings` — Update earnings settings

### Photos
- `GET /api/photos` — List photos with filters
- `DELETE /api/photos` — Bulk delete photos

### Leaderboard
- `GET /api/leaderboard` — Get leaderboard rankings

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Manual Deployment

```bash
pnpm build
pnpm start
```

## Development

```bash
pnpm dev          # Development mode
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run linter
```

## PWA Features

- Offline support
- Install to home screen
- App shortcuts
- Service worker caching

## Security

- JWT-based authentication with refresh tokens
- Password hashing with bcryptjs
- Rate limiting on login and API endpoints
- CORS protection
- Environment variable validation
- SQL injection protection via Supabase
- XSS protection via React

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## License

ISC License

## Developer

Developed by [NoHypeLabs](https://nohypelabs.vercel.app)

---

**Version:** 1.1.0
**Last Updated:** June 2026
**Maintained by:** NoHypeLabs
