# EVORA

> **Multi-tenant SaaS Platform for Competitive Event Management**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-000000)](https://ui.shadcn.com/)

EVORA is a comprehensive platform for managing competitive events — from drill team competitions to pageants. It handles event lifecycle, team registration, hierarchical scoring, and audience voting in one unified system.

---

## ✨ Features

### Event Management
- **Event Creation & Configuration** — Multi-day events with custom themes and landing pages
- **Category Management** — Competition categories with quota and fee configuration
- **Staff Assignment** — Event-scoped roles (Organizer, Judge, Tabulator, Official Team)
- **Payment Integration** — Manual payment verification with proof upload

### Registration System
- **Online Registration** — Self-service team registration with real-time quota tracking
- **Payment Verification** — Upload and verify payment proofs
- **Team Management** — Add members, track status, assign lot numbers
- **Status Tracking** — PENDING_PAYMENT → PENDING_VERIFICATION → REGISTERED workflow

### Scoring & Judging
- **Hierarchical Assessment** — Section → Group → Item scoring schema
- **Discrete Value Validation** — Predefined score values per assessment item
- **Score Sheet Locking** — Prevent modifications after submission
- **Real-time Rankings** — Automatic ranking calculation per category

### Voting System
- **Point-based Voting** — Purchase vote packages with points
- **Multiple Categories** — Favorite candidate, best performance, etc.
- **Live Results** — Real-time vote counting and display
- **Candidate Management** — Upload photos, set display order

### Role-Based Access
| Role | Capabilities |
|------|-------------|
| **SUPER_ADMIN** | Full platform control, all events access |
| **ORGANIZER** | Manage specific event settings, verify payments |
| **JUDGE** | Submit scores for assigned teams |
| **TABULATOR** | Input scores on behalf of judges, lock sheets |
| **OFFICIAL_TEAM** | Manage own team, upload payment proof |
| **USER** | Register teams, cast votes, view own data |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Backend API running (see [Backend Setup](#backend-setup))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd evora-web

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Server-side API URL (for BFF proxy)
API_URL=http://localhost:8000

# Optional: For production builds
NEXT_PUBLIC_APP_URL=https://evora.id

# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

### Backend Setup

The frontend expects a FastAPI backend running at `NEXT_PUBLIC_API_URL`:

```bash
# Backend should provide these endpoints:
# - POST /api/v1/auth/login        - OAuth2 login
# - POST /api/v1/auth/register     - User registration
# - GET  /api/v1/auth/me            - Current user profile
# - GET  /api/v1/public/events      - Public event list
# - GET  /api/v1/public/event/{slug} - Event details
# - ... (see docs/API_SPECIFICATION.md for full API)
```

---

## 📁 Project Structure

```
evora-web/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (login, register)
│   ├── api/                      # API routes (BFF proxy, auth)
│   ├── dashboard/                # Dashboard pages
│   │   ├── events/[event_id]/    # Event management
│   │   ├── teams/[team_id]/      # Team details
│   │   └── upload-payment/       # Payment upload
│   ├── events/[slug]/            # Public event pages
│   ├── super-admin/              # SuperAdmin panel
│   └── voting/                   # Voting interface
│
├── components/                   # React components
│   ├── dashboard/                # Dashboard UI
│   │   ├── sidebar/              # Navigation sidebar
│   │   └── ui-components/        # Shared dashboard UI
│   ├── events/                   # Event display components
│   ├── landing/                  # Marketing page sections
│   ├── layout/                   # Layout components
│   ├── registration/             # Registration wizard
│   ├── super-admin/              # Admin components
│   ├── ui/                       # shadcn/ui components
│   │   └── mobile-optimized/     # Mobile-specific UI
│   └── voting/                   # Voting components
│
├── lib/                          # Utilities & configurations
│   ├── api/                      # API client utilities
│   ├── validation/               # Zod schemas & types
│   │   ├── schemas/              # Validation schemas
│   │   └── types/                # Inferred types
│   ├── admin-api.ts              # Admin API client
│   ├── auth.ts                   # Auth utilities
│   ├── event-access.ts           # Event access helpers
│   └── utils.ts                  # General utilities
│
├── services/                     # Business logic services
│   ├── auth-service.ts           # Authentication
│   ├── event-service.ts          # Public events (server)
│   ├── event-management-service.ts # Event management
│   ├── registration-service.ts   # Registration flow
│   ├── scoring-service.ts        # Scoring operations
│   ├── voting-service.ts         # Voting system
│   └── super-admin-service.ts    # SuperAdmin operations
│
├── types/                        # TypeScript types
│   ├── event.ts                  # Public event types
│   ├── admin.ts                  # Admin/SuperAdmin types
│   └── index.ts                  # Type exports
│
├── config/                       # Configuration files
│   └── sidebar-menu-config.ts    # Sidebar navigation
│
├── context/                      # React contexts
│   └── dashboard-context.tsx     # Dashboard state
│
├── docs/                         # Documentation
│   ├── API_SPECIFICATION.md      # Full API reference
│   ├── ARCHITECTURE.md           # System architecture
│   ├── API_INTEGRATION.md        # Frontend API guide
│   ├── TYPES_GUIDE.md            # Type system guide
│   ├── CONTRIBUTING.md           # Development guide
│   ├── SECURITY.md               # Security architecture & practices
│   ├── SECURITY_AUDIT.md         # Security audit framework
│   └── IMPLEMENTATION_GUIDE.md   # Implementation notes
│
├── public/                       # Static assets
├── middleware.ts                 # Next.js middleware (auth)
└── next.config.ts                # Next.js configuration
```

---

## 🏗️ Architecture

### Authentication Flow (BFF Pattern)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│  Next.js    │────▶│  FastAPI    │
│             │◄────│   (BFF)     │◄────│  Backend    │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │  HttpOnly   │
                    │   Cookie    │
                    └─────────────┘
```

1. User submits credentials to `/api/auth/login`
2. BFF validates with backend, receives JWT
3. BFF sets HttpOnly cookie (no JS access)
4. Subsequent requests include cookie automatically
5. BFF extracts token and proxies to backend

### Data Flow

```
Server Component ──▶ Service Layer ──▶ API Client ──▶ Backend
       │
       ▼
Client Component ────▶ API Route ────▶ API Client ──▶ Backend
```

- **Server Components**: Use services directly (with caching)
- **Client Components**: Call API routes that proxy to backend

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Code Conventions

- **TypeScript**: Strict mode enabled, no `any` types
- **File Size**: Maximum 300 lines per file
- **Naming**: PascalCase for components, camelCase for functions
- **Imports**: Use `@/` path aliases
- **Validation**: Zod schemas for all API data

### Key Principles

1. **Backward Compatibility** — Changes must not break existing code
2. **Minimal Solutions** — Start simple, add complexity only when needed
3. **Type Safety** — Runtime validation with Zod, compile-time with TypeScript
4. **Security** — No tokens in localStorage, HttpOnly cookies only

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [API_SPECIFICATION.md](docs/API_SPECIFICATION.md) | Complete backend API reference |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture & data flow |
| [API_INTEGRATION.md](docs/API_INTEGRATION.md) | Frontend API integration patterns |
| [TYPES_GUIDE.md](docs/TYPES_GUIDE.md) | Type system & validation guide |
| [CONTRIBUTING.md](docs/CONTRIBUTING.md) | Development guidelines |
| [SECURITY.md](docs/SECURITY.md) | Security architecture & practices |
| [SECURITY_AUDIT.md](docs/SECURITY_AUDIT.md) | Security audit framework |

---

## 🔒 Security

- **HttpOnly Cookies** — JWT stored in HttpOnly cookies, inaccessible to JS
- **CSRF Protection** — SameSite=Strict cookie attributes
- **Input Validation** — Zod schemas validate all inputs
- **Role-Based Access** — Event-scoped permissions (ORGANIZER, JUDGE, TABULATOR, OFFICIAL_TEAM)
- **No Secrets in Client** — API keys and secrets only in server/BFF
- **Security Headers** — CSP, X-Frame-Options, X-Content-Type-Options configured

See [SECURITY.md](docs/SECURITY.md) for detailed security architecture and [SECURITY_AUDIT.md](docs/SECURITY_AUDIT.md) for audit framework.

---

## 🤝 Contributing

1. Follow the [Contributing Guide](docs/CONTRIBUTING.md)
2. Maintain backward compatibility
3. Keep files under 300 lines
4. Add types for all new code
5. Test your changes thoroughly

---

## 📄 License

[License information to be added]

---

## 🆘 Support

For questions or issues:
- Check the [documentation](docs/)
- Review [API_SPECIFICATION.md](docs/API_SPECIFICATION.md) for API details
- See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design

---

<p align="center">
  Built with ❤️ for competitive event management
</p>
