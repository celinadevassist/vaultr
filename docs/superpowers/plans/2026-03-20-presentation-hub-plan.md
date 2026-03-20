# Presentation Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a full-stack Presentation Hub with NeDB, role-based auth, dynamic category system, user profiles, PRD management, and futuristic UI at `presentation-hub.46.62.210.62.sslip.io`.

**Architecture:** Express backend serving REST API + React (Vite) SPA frontend. NeDB file-based NoSQL for 8 collections. JWT auth with bcrypt. Caddy reverse proxy with PM2 process manager.

**Tech Stack:** Node.js, Express, React, Vite, NeDB (nedb-promises), bcrypt, jsonwebtoken, multer, express-rate-limit, express-validator, winston, pdfkit, marked, Chart.js, react-router-dom

**Spec:** `docs/superpowers/specs/2026-03-20-presentation-hub-design.md`

---

## File Structure

### Backend (`src/server/`)
| File | Responsibility |
|------|---------------|
| `src/server/index.js` | Express app setup, middleware, static serving |
| `src/server/db/index.js` | NeDB collection initialization (8 collections) |
| `src/server/db/seed.js` | Default admin, categories, settings, scan presentations |
| `src/server/middleware/auth.js` | JWT verification middleware |
| `src/server/middleware/rbac.js` | Role-based access control |
| `src/server/middleware/visibility.js` | Presentation access check |
| `src/server/routes/auth.js` | Login, refresh, logout |
| `src/server/routes/presentations.js` | CRUD presentations + file upload |
| `src/server/routes/categories.js` | CRUD categories |
| `src/server/routes/groups.js` | CRUD access groups |
| `src/server/routes/users.js` | User management |
| `src/server/routes/settings.js` | Site settings |
| `src/server/routes/prds.js` | PRD management + PDF export |
| `src/server/routes/userData.js` | User presentation data/profiles |
| `src/server/routes/analytics.js` | Admin analytics (derived) |
| `src/server/routes/scanner.js` | Presentation folder scanner |
| `src/server/utils/logger.js` | Winston JSON structured logging |
| `src/server/utils/scanner.js` | Auto-detect presentations in folder |
| `src/server/utils/errors.js` | Standard error response helper |

### Frontend (`src/client/`)
| File | Responsibility |
|------|---------------|
| `src/client/index.html` | HTML entry point |
| `src/client/vite.config.js` | Vite config with API proxy |
| `src/client/src/main.jsx` | React entry |
| `src/client/src/App.jsx` | Router + auth context |
| `src/client/src/context/AuthContext.jsx` | Auth state management |
| `src/client/src/hooks/useAuth.js` | Auth API hooks |
| `src/client/src/hooks/useApi.js` | Fetch wrapper with JWT |
| `src/client/src/components/Layout.jsx` | Page layout with nav |
| `src/client/src/components/Navbar.jsx` | Navigation bar |
| `src/client/src/components/ProtectedRoute.jsx` | Auth guard component |
| `src/client/src/components/PresentationCard.jsx` | Presentation card component |
| `src/client/src/components/CategoryBadge.jsx` | Category badge with dynamic color |
| `src/client/src/components/ProfileSelector.jsx` | User data profile selector |
| `src/client/src/components/MarkdownEditor.jsx` | Markdown edit + preview |
| `src/client/src/pages/Landing.jsx` | Public landing page |
| `src/client/src/pages/Login.jsx` | Login form |
| `src/client/src/pages/Dashboard.jsx` | User dashboard |
| `src/client/src/pages/PresentationView.jsx` | Presentation viewer + profiles |
| `src/client/src/pages/AccountSettings.jsx` | User account settings |
| `src/client/src/pages/admin/Presentations.jsx` | Admin presentation CRUD |
| `src/client/src/pages/admin/Categories.jsx` | Admin category CRUD |
| `src/client/src/pages/admin/Users.jsx` | Admin user management |
| `src/client/src/pages/admin/Groups.jsx` | Admin group management |
| `src/client/src/pages/admin/PRDs.jsx` | Admin PRD list |
| `src/client/src/pages/admin/PRDEditor.jsx` | PRD create/edit |
| `src/client/src/pages/admin/SiteSettings.jsx` | Admin site settings |
| `src/client/src/pages/admin/Analytics.jsx` | Admin analytics dashboard |
| `src/client/src/styles/global.css` | Futuristic base theme |
| `src/client/src/styles/variables.css` | CSS custom properties |
| `src/client/src/styles/animations.css` | Glow, fade, slide effects |

### Config & Deploy
| File | Responsibility |
|------|---------------|
| `config/default.js` | App configuration (port, JWT, paths) |
| `presentations/cartflow-analytics/meta.json` | CartFlow metadata |
| `presentations/cartflow-analytics/index.html` | Migrated CartFlow presentation |
| `ecosystem.config.js` | PM2 configuration |
| `.env` | Environment secrets (JWT_SECRET) |
| `.gitignore` | Ignore node_modules, data/, logs/, .env |

---

## Task 1: Project Scaffolding & Dependencies

**Files:**
- Create: `package.json`, `.gitignore`, `.env`, `config/default.js`

- [ ] Step 1: Update package.json with all dependencies
- [ ] Step 2: Install dependencies
- [ ] Step 3: Create .gitignore (node_modules, data/, logs/, .env)
- [ ] Step 4: Create .env with JWT_SECRET
- [ ] Step 5: Create config/default.js
- [ ] Step 6: Create directory structure

## Task 2: Database Layer

**Files:**
- Create: `src/server/db/index.js`, `src/server/db/seed.js`

- [ ] Step 1: Create NeDB initialization for 8 collections
- [ ] Step 2: Create seed script (admin user, 5 categories, site settings)
- [ ] Step 3: Test seed runs correctly

## Task 3: Utilities & Middleware

**Files:**
- Create: `src/server/utils/logger.js`, `src/server/utils/errors.js`, `src/server/utils/scanner.js`
- Create: `src/server/middleware/auth.js`, `src/server/middleware/rbac.js`, `src/server/middleware/visibility.js`

- [ ] Step 1: Create Winston logger with JSON + file rotation
- [ ] Step 2: Create error response helper
- [ ] Step 3: Create JWT auth middleware
- [ ] Step 4: Create RBAC middleware
- [ ] Step 5: Create presentation visibility middleware
- [ ] Step 6: Create folder scanner utility

## Task 4: Backend API Routes

**Files:**
- Create: All `src/server/routes/*.js`, `src/server/index.js`

- [ ] Step 1: Create auth routes (login, refresh, logout)
- [ ] Step 2: Create presentations routes (CRUD + upload + public/featured)
- [ ] Step 3: Create categories routes (CRUD)
- [ ] Step 4: Create users routes (CRUD + me)
- [ ] Step 5: Create groups routes (CRUD)
- [ ] Step 6: Create settings routes (get/update)
- [ ] Step 7: Create PRD routes (CRUD + PDF export)
- [ ] Step 8: Create user data routes (profiles CRUD)
- [ ] Step 9: Create analytics route
- [ ] Step 10: Create scanner route
- [ ] Step 11: Create Express app entry with all middleware and routes

## Task 5: Frontend Foundation

**Files:**
- Create: `src/client/index.html`, `src/client/vite.config.js`, `src/client/src/main.jsx`, `src/client/src/App.jsx`
- Create: All styles, context, hooks, base components

- [ ] Step 1: Create Vite config with API proxy
- [ ] Step 2: Create index.html entry
- [ ] Step 3: Create CSS (global, variables, animations)
- [ ] Step 4: Create AuthContext with JWT management
- [ ] Step 5: Create useApi hook (fetch wrapper)
- [ ] Step 6: Create Layout, Navbar, ProtectedRoute components
- [ ] Step 7: Create PresentationCard, CategoryBadge components
- [ ] Step 8: Create App.jsx with react-router

## Task 6: Frontend Pages — Public

**Files:**
- Create: `Landing.jsx`, `Login.jsx`, `PresentationView.jsx`

- [ ] Step 1: Build Landing page (hero, categories, featured, public grid)
- [ ] Step 2: Build Login page
- [ ] Step 3: Build PresentationView with iframe + profile selector

## Task 7: Frontend Pages — Authenticated

**Files:**
- Create: `Dashboard.jsx`, `AccountSettings.jsx`

- [ ] Step 1: Build Dashboard with category filter and search
- [ ] Step 2: Build Account Settings page

## Task 8: Frontend Pages — Admin

**Files:**
- Create: All `src/client/src/pages/admin/*.jsx`

- [ ] Step 1: Build Presentations admin (CRUD table + upload)
- [ ] Step 2: Build Categories admin (CRUD + color picker)
- [ ] Step 3: Build Users admin (CRUD + group assignment)
- [ ] Step 4: Build Groups admin (CRUD)
- [ ] Step 5: Build PRD list + PRD editor with markdown
- [ ] Step 6: Build Site Settings page
- [ ] Step 7: Build Analytics dashboard

## Task 9: Migrate Existing Presentation

**Files:**
- Create: `presentations/cartflow-analytics/meta.json`
- Move: `CartFlow-Analytics-Interactive.html` → `presentations/cartflow-analytics/index.html`

- [ ] Step 1: Create meta.json for CartFlow
- [ ] Step 2: Move HTML file to presentation folder
- [ ] Step 3: Verify scanner picks it up

## Task 10: Build, Deploy & Verify

- [ ] Step 1: Build React frontend (`npm run build`)
- [ ] Step 2: Configure PM2 ecosystem file
- [ ] Step 3: Start app with PM2
- [ ] Step 4: Configure Caddy for `presentation-hub.46.62.210.62.sslip.io`
- [ ] Step 5: Verify site loads, admin login works, CartFlow presentation accessible
- [ ] Step 6: Create GitHub repo and push
