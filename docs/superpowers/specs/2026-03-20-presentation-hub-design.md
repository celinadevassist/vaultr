# Presentation Hub — Product Specification

## Overview

A self-hosted web platform for creating, managing, and viewing interactive presentations organized by business categories. Features a professional futuristic landing page, role-based access control with group-based visibility, user-specific saved data profiles per presentation, and an integrated PRD management system.

**Deployment:** `presentation-hub.46.62.210.62.sslip.io` via Caddy reverse proxy with automatic HTTPS.

**GitHub Repository:** `presentation-hub`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| Frontend | React + Vite |
| Database | NeDB (8 file-based collections) |
| Auth | bcrypt password hashing + JWT (access + refresh tokens) |
| Charts | Chart.js (shared base), extensible per category |
| Styling | CSS Modules + CSS custom properties per category |
| Design | Clean futuristic — dark navy/slate base, glowing borders, smooth transitions, modern sans-serif |
| Reverse Proxy | Caddy |
| Domain | `presentation-hub.46.62.210.62.sslip.io` |

---

## Project Structure

```
presentations/
├── src/
│   ├── server/
│   │   ├── index.js              # Express app entry
│   │   ├── routes/
│   │   │   ├── auth.js           # Login, register, refresh token
│   │   │   ├── presentations.js  # CRUD + file upload
│   │   │   ├── categories.js     # CRUD categories
│   │   │   ├── groups.js         # CRUD access groups
│   │   │   ├── users.js          # User management
│   │   │   ├── settings.js       # Site settings
│   │   │   ├── prds.js           # PRD management
│   │   │   └── userData.js       # User presentation data/profiles
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT verification
│   │   │   ├── rbac.js           # Role-based access control
│   │   │   └── visibility.js     # Presentation access check
│   │   ├── db/
│   │   │   ├── index.js          # NeDB initialization
│   │   │   └── seed.js           # Default admin, categories, settings
│   │   └── utils/
│   │       ├── logger.js         # Structured JSON logging
│   │       └── scanner.js        # Auto-detect presentations in folder
│   ├── client/
│   │   ├── src/
│   │   │   ├── App.jsx
│   │   │   ├── main.jsx
│   │   │   ├── pages/
│   │   │   │   ├── Landing.jsx         # Public landing page
│   │   │   │   ├── Login.jsx           # Auth page
│   │   │   │   ├── Dashboard.jsx       # Authenticated user dashboard
│   │   │   │   ├── PresentationView.jsx # Presentation viewer with profiles
│   │   │   │   ├── AccountSettings.jsx  # User profile/password
│   │   │   │   └── admin/
│   │   │   │       ├── Presentations.jsx
│   │   │   │       ├── Categories.jsx
│   │   │   │       ├── Users.jsx
│   │   │   │       ├── Groups.jsx
│   │   │   │       ├── PRDs.jsx
│   │   │   │       ├── PRDEditor.jsx
│   │   │   │       ├── SiteSettings.jsx
│   │   │   │       └── Analytics.jsx
│   │   │   ├── components/
│   │   │   │   ├── Layout.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── PresentationCard.jsx
│   │   │   │   ├── CategoryBadge.jsx
│   │   │   │   ├── ProfileSelector.jsx
│   │   │   │   ├── MarkdownEditor.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.js
│   │   │   │   ├── usePresentations.js
│   │   │   │   └── useUserData.js
│   │   │   ├── context/
│   │   │   │   └── AuthContext.jsx
│   │   │   └── styles/
│   │   │       ├── global.css          # Futuristic base theme
│   │   │       ├── variables.css       # CSS custom properties
│   │   │       └── animations.css      # Glow, fade, slide effects
│   │   ├── index.html
│   │   └── vite.config.js
│   └── shared/
│       └── constants.js          # Shared enums (roles, visibility, status)
├── presentations/                # Each presentation in its own folder
│   └── cartflow-analytics/
│       ├── index.html
│       ├── meta.json
│       └── assets/
├── data/                         # NeDB database files
│   ├── users.db
│   ├── presentations.db
│   ├── categories.db
│   ├── groups.db
│   ├── settings.db
│   ├── userPresentationData.db
│   ├── prds.db
│   └── sessions.db
├── logs/
│   ├── application.log
│   ├── error.log
│   └── debug.log
├── config/
│   └── default.js               # Port, JWT secret env refs, log config
├── tests/
├── scripts/
│   └── seed.js                   # Initial data seeder
└── package.json
```

---

## Database Schema (8 NeDB Collections)

### users.db
```json
{
  "_id": "auto-generated",
  "username": "string (unique)",
  "email": "string (unique)",
  "displayName": "string",
  "passwordHash": "bcrypt hash",
  "role": "admin | viewer",
  "groups": ["group-id-1", "group-id-2"],
  "avatar": "string (optional)",
  "isActive": true,
  "createdAt": "ISO date",
  "lastLogin": "ISO date"
}
```

### presentations.db
```json
{
  "_id": "auto-generated",
  "slug": "cartflow-analytics (unique)",
  "title": "CartFlow Analytics",
  "description": "Interactive profit simulator for e-commerce",
  "category": "category-id",
  "visibility": "public | authenticated | group | private",
  "allowedGroups": ["group-id"],
  "type": "static | dynamic",
  "pageCount": 1,
  "featured": false,
  "featuredOrder": 0,
  "folderPath": "presentations/cartflow-analytics",
  "entryFile": "index.html",
  "thumbnail": "thumb.png",
  "tags": ["analytics", "profit"],
  "prdId": "prd-id (optional, links to originating PRD)",
  "createdBy": "user-id",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

### categories.db
```json
{
  "_id": "auto-generated",
  "name": "Marketing",
  "slug": "marketing (unique)",
  "description": "Marketing strategies and campaigns",
  "primaryColor": "#6366f1",
  "accentColor": "#818cf8",
  "icon": "megaphone",
  "chartStyle": "gradient | clean | bold | comparison | timeline",
  "fontFamily": "Inter",
  "sortOrder": 1,
  "createdAt": "ISO date"
}
```

### groups.db
```json
{
  "_id": "auto-generated",
  "name": "Sales Team",
  "slug": "sales-team (unique)",
  "description": "Access to sales-related presentations",
  "createdAt": "ISO date"
}
```

### settings.db
```json
{
  "_id": "auto-generated",
  "key": "site",
  "siteName": "Presentation Hub",
  "heroTitle": "Master Business Topics Through Interactive Presentations",
  "heroSubtitle": "Curated, interactive presentations for marketing, sales, business, and more",
  "ctaPrimary": "Browse Presentations",
  "ctaSecondary": "Sign In",
  "logoUrl": "",
  "footerText": "Presentation Hub 2026",
  "updatedAt": "ISO date"
}
```

### userPresentationData.db
```json
{
  "_id": "auto-generated",
  "userId": "user-id",
  "presentationId": "presentation-id",
  "profileName": "My Store Q1",
  "data": { "revenue": 50000, "refundRate": 3.2, "country": "US" },
  "isDefault": true,
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

### prds.db
```json
{
  "_id": "auto-generated",
  "title": "Presentation Hub - Core Platform",
  "slug": "core-platform (unique)",
  "version": "1.0",
  "status": "draft | in-review | approved | archived",
  "category": "platform | feature | integration",
  "sections": [
    { "heading": "Overview", "content": "markdown..." },
    { "heading": "Problem Statement", "content": "markdown..." },
    { "heading": "Goals", "content": "markdown..." },
    { "heading": "User Stories", "content": "markdown..." },
    { "heading": "Technical Requirements", "content": "markdown..." },
    { "heading": "Success Metrics", "content": "markdown..." },
    { "heading": "Timeline", "content": "markdown..." }
  ],
  "linkedPresentations": ["presentation-id"],
  "author": "user-id",
  "reviewers": ["user-id"],
  "changelog": [
    { "date": "ISO date", "userId": "user-id", "summary": "Initial draft" }
  ],
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

### sessions.db
```json
{
  "_id": "auto-generated",
  "userId": "user-id",
  "refreshToken": "hashed token",
  "expiresAt": "ISO date",
  "createdAt": "ISO date",
  "revokedAt": "ISO date (null if active)"
}
```

---

## Authentication & Access Control

### Auth Flow
1. User submits credentials to `POST /api/auth/login`
2. Server validates password hash with bcrypt
3. Returns JWT access token (15min) + refresh token (7 days)
4. Refresh token hash stored in `sessions.db` for revocation tracking
5. Client stores tokens, sends access token in `Authorization: Bearer` header
6. Expired access tokens refreshed via `POST /api/auth/refresh` (client sends refresh token in body)
7. `POST /api/auth/logout` accepts `{ refreshToken }` in body, marks session as revoked

### User Registration
- **No self-registration.** Only admins create users via `POST /api/users`.
- On first run, a default admin account is seeded (credentials logged to console).
- Admin creates viewer accounts and assigns them to groups.

### Security
- **Rate limiting:** 5 attempts per minute on `/api/auth/login` and `/api/auth/refresh` (using `express-rate-limit`)
- **File upload limits:** Max 50MB per file on `POST /api/presentations/:id/upload` (using `multer`)
- **Input validation:** Max 200 chars for titles, 2000 chars for descriptions, 50KB per markdown section (using `express-validator`)
- **CORS:** Enabled for development (Vite dev server port), disabled in production (same-origin)

### Standard Error Response
All API errors return:
```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE",
  "details": {}
}
```
Common codes: `AUTH_REQUIRED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `RATE_LIMITED`

### Role-Based Access

| Action | Anonymous | Viewer | Admin |
|--------|-----------|--------|-------|
| View public presentations | Yes | Yes | Yes |
| View authenticated presentations | No | Yes | Yes |
| View group-restricted presentations | No | If in group | Yes |
| View private presentations | No | No | Yes |
| Save presentation profiles | No | Yes | Yes |
| Manage own account | No | Yes | Yes |
| CRUD presentations | No | No | Yes |
| CRUD categories | No | No | Yes |
| CRUD users/groups | No | No | Yes |
| CRUD PRDs | No | No | Yes |
| Edit site settings | No | No | Yes |

### Visibility Resolution
When serving a presentation:
1. Check `visibility` field
2. `public` → serve to anyone
3. `authenticated` → require valid JWT
4. `group` → require valid JWT + user must belong to one of `allowedGroups`
5. `private` → require valid JWT + `role === 'admin'`

---

## Pages & Routes

### Public Routes
| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Hero, categories, featured, public presentations grid |
| `/login` | Login | Authentication form |
| `/p/:slug` | Presentation Viewer | View presentation (access checked) |
| `/p/:slug?embed=true` | Embedded | Presentation without hub chrome |

### Authenticated Routes
| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | Dashboard | All accessible presentations, category filter, search |
| `/account` | Account Settings | Profile, password change |

### Admin Routes
| Route | Page | Description |
|-------|------|-------------|
| `/admin/presentations` | Manage Presentations | CRUD, visibility, file upload |
| `/admin/categories` | Manage Categories | CRUD with color picker, icon selector |
| `/admin/users` | Manage Users | CRUD, assign groups/roles |
| `/admin/groups` | Manage Groups | CRUD access groups |
| `/admin/prds` | PRD List | All PRDs with status filter |
| `/admin/prds/new` | PRD Editor | Create new PRD with markdown editor |
| `/admin/prds/:id` | PRD View/Edit | View or edit existing PRD |
| `/admin/settings` | Site Settings | Hero text, CTA, logo, footer |
| `/admin/analytics` | Analytics | Derived metrics (see below) |

---

## User Presentation Data (Profiles)

### Bridge API
Each dynamic presentation integrates with the hub via a small injected script:

```javascript
// The hub injects this into dynamic presentations
window.PresentationHub = {
  register({ getState, setState }) {
    // Presentation tells the hub how to save/load its state
  },
  onProfileLoad(callback) {
    // Called when user switches profiles
  }
};
```

### Profile UI (injected overlay)
- **Profile dropdown** — switch between saved profiles
- **Save button** — save current state with a name
- **Auto-save toggle** — silently saves on input change
- **Compare mode** — user selects two profiles; the presentation renders in a 50/50 split view with each side loaded from a different profile. The Bridge API receives `setState` calls for each pane independently. Presentations that don't support compare mode (no `supportsSplitView: true` in meta.json) show a simple diff table of the two profiles' data values instead.
- **Delete profile** — remove a saved profile

### API Endpoints
- `GET /api/user-data/:presentationId` — list user's profiles for a presentation
- `POST /api/user-data/:presentationId` — save new profile
- `PUT /api/user-data/:id` — update profile
- `DELETE /api/user-data/:id` — delete profile

---

## PRD Management

### Features
- Markdown editor with live preview (using `marked` library)
- Section-based template with pre-built structure
- Status workflow: Draft → In Review → Approved → Archived
- Version tracking via changelog array
- Link PRDs to presentations they describe
- Export to PDF from viewer
- Full-text search across PRDs

### PRD Templates
PRDs use a single built-in default template with the standard sections (Overview, Problem Statement, Goals, User Stories, Technical Requirements, Success Metrics, Timeline). The section structure is defined in `src/shared/constants.js` as `DEFAULT_PRD_SECTIONS`. When creating a new PRD, all sections are pre-populated with placeholder text. No separate template collection is needed for v1.

### PRD PDF Export
`POST /api/prds/:id/export` generates a PDF using `pdfkit` (already a project dependency). Returns a file download (`Content-Disposition: attachment`). The PDF renders each section as a heading + markdown-to-text body with the hub's branding header.

### Admin PRD Navigation
```
Admin > PRDs
├── All PRDs (filterable by status/category)
└── Create New (from default template)
```

---

## Landing Page Design

### Clean Futuristic Aesthetic (user-requested dark theme override — takes precedence over default light theme preference)
- **Background:** Dark navy (`#0f172a`) with subtle gradient mesh
- **Cards:** Semi-transparent dark (`#1e293b`) with `1px` glowing border (`rgba(99, 102, 241, 0.3)`)
- **Typography:** Inter/system sans-serif, white text (`#f8fafc`), muted labels (`#94a3b8`)
- **Accents:** Category-specific colors for badges and highlights
- **Animations:** Subtle fade-in on scroll, glow pulse on hover, smooth transitions (200-300ms)
- **Borders:** `border: 1px solid rgba(148, 163, 184, 0.1)` with hover glow effect

### Sections
1. **Hero** — Full-width, gradient background, bold headline, two CTA buttons
2. **Category Showcase** — Grid of category cards with icon, name, description, count
3. **Featured Presentations** — Admin-curated grid with thumbnails
4. **How It Works** — 3-step visual guide
5. **Public Presentations** — Searchable, filterable grid with category badges
6. **Footer** — Configurable text, links

---

## REST API Endpoints

### Auth
- `POST /api/auth/login` — authenticate, return tokens
- `POST /api/auth/refresh` — refresh access token
- `POST /api/auth/logout` — invalidate refresh token

### Presentations
- `GET /api/presentations` — list (with pagination, category filter, search, visibility filter)
- `GET /api/presentations/:id` — get one
- `POST /api/presentations` — create (admin)
- `PUT /api/presentations/:id` — update (admin)
- `DELETE /api/presentations/:id` — delete (admin)
- `POST /api/presentations/:id/upload` — upload files (admin)
- `GET /api/presentations/public` — public presentations (no auth)
- `GET /api/presentations/featured` — featured presentations (no auth)

### Categories
- `GET /api/categories` — list all
- `POST /api/categories` — create (admin)
- `PUT /api/categories/:id` — update (admin)
- `DELETE /api/categories/:id` — delete (admin)

### Users
- `GET /api/users` — list (admin)
- `POST /api/users` — create (admin)
- `PUT /api/users/:id` — update (admin)
- `DELETE /api/users/:id` — delete (admin)
- `GET /api/users/me` — current user profile
- `PUT /api/users/me` — update own profile

### Groups
- `GET /api/groups` — list (admin)
- `POST /api/groups` — create (admin)
- `PUT /api/groups/:id` — update (admin)
- `DELETE /api/groups/:id` — delete (admin)

### User Presentation Data
- `GET /api/user-data/:presentationId` — list profiles
- `POST /api/user-data/:presentationId` — save profile
- `PUT /api/user-data/:id` — update profile
- `DELETE /api/user-data/:id` — delete profile

### PRDs
- `GET /api/prds` — list (admin, with status/category filter)
- `GET /api/prds/:id` — get one (admin)
- `POST /api/prds` — create (admin)
- `PUT /api/prds/:id` — update (admin)
- `DELETE /api/prds/:id` — delete (admin)
- `POST /api/prds/:id/export` — export to PDF (admin)

### Settings
- `GET /api/settings` — get site settings (public fields for landing page)
- `PUT /api/settings` — update (admin)

### Scanner
- `POST /api/scanner/scan` — scan presentations folder for new presentations (admin)

---

## Presentation Folder Auto-Scanner

On server start and via admin trigger:
1. Scan `presentations/` directory for folders
2. Check each folder for `meta.json`
3. If found and not in DB → auto-register
4. If in DB but folder missing → flag as missing
5. **Category resolution:** `meta.json` uses category slug (e.g., `"business"`). Scanner looks up the category by slug in `categories.db` and stores the `_id` in `presentations.db`. If slug does not match any existing category, the presentation is registered with `category: null` and flagged in logs for admin to assign manually.
6. `meta.json` format:
```json
{
  "title": "CartFlow Analytics",
  "description": "Interactive profit simulator",
  "category": "business",
  "type": "dynamic",
  "pageCount": 1,
  "entryFile": "index.html",
  "tags": ["analytics", "profit"]
}
```

---

## Analytics (Admin Dashboard)

Analytics are derived from existing collections — no separate analytics DB needed:
- **Popular presentations:** Count of `userPresentationData` records grouped by `presentationId`
- **Active users:** Count of users with `lastLogin` in the last 7/30 days from `users.db`
- **Category distribution:** Count of presentations per category from `presentations.db`
- **Profile engagement:** Average profiles saved per user per presentation
- **Recent activity:** Latest logins, latest profile saves, latest presentation additions

All queries are computed on-demand via API endpoint `GET /api/admin/analytics` (admin only).

---

## Logging

- JSON formatted, file-based
- Log levels: debug, info, warning, error
- Files: `logs/application.log`, `logs/error.log`, `logs/debug.log`
- Rotating with 10MB size limit, 5 file retention
- Using `winston` with JSON transport

---

## Deployment

- **Port:** 3000 (Express serves both API and built React frontend)
- **Caddy config:** Reverse proxy `presentation-hub.46.62.210.62.sslip.io` → `localhost:3000`
- **Process manager:** PM2 for auto-restart
- **Build:** `npm run build` compiles React, Express serves from `dist/`
- **Domain:** `presentation-hub.46.62.210.62.sslip.io`

---

## Seed Data

On first run:
1. Create default admin user (`admin` / auto-generated password logged to console)
2. Create 5 default categories (Marketing, Business, Sales, Pricing, Time Management)
3. Create default site settings
4. Scan and register existing CartFlow Analytics presentation
5. Create initial PRDs for the project itself
