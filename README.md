# Invoxa

> **AI-powered invoicing and billing management for modern businesses.**

Invoxa is a full-stack invoicing platform designed to take the
repetitive work out of billing. It combines invoice creation, client
management, payment tracking, expenses, reporting, and AI-assisted
workflows into one clean dashboard.

The product is built around a simple idea:

**Create beautiful invoices, track payments, let AI read receipts, draft
payment reminders, and understand your business finances --- without
leaving the app.**

## ✨ Live Demo

**Production:** https://ai-invoxa.vercel.app

The landing page presents Invoxa as an AI-first billing workspace, with
animated financial cards, revenue insights, receipt scanning, payment
reminders, and client/invoice summaries.

> **Demo login:** The frontend includes a pre-filled demo account option
> on the login screen. Use the **Demo** / pre-filled credentials
> available in the deployed application rather than relying on
> development seed credentials.

------------------------------------------------------------------------

## 🖼️ Product Overview

The landing page is intentionally designed to feel more like a modern
SaaS product than a traditional accounting application.

### Design highlights

-   Clean white workspace with a soft teal visual identity
-   Large, typography-driven hero section
-   Animated invoice and financial-data cards
-   AI-focused messaging and feature sections
-   Responsive dashboard experience
-   Light/dark appearance support inside the application
-   Reusable UI components and consistent cards, badges, buttons,
    inputs, and modals
-   Data visualizations for revenue, collections, invoice status, and
    aging

The core brand message is:

> **Invoicing That Runs Itself.**

------------------------------------------------------------------------

# 🚀 What Invoxa Does

Invoxa brings the day-to-day billing workflow into one application.

### 📄 Invoicing

Create and manage professional invoices with:

-   Automatic invoice numbering
-   Client selection
-   Line items and quantities
-   Catalog item selection
-   Tax calculation
-   Discounts
-   Notes and payment terms
-   Draft / sent / paid workflows
-   Invoice detail and editing
-   PDF invoice rendering/export

### 👥 Client CRM

Maintain a lightweight client database containing:

-   Client name
-   Company
-   Email
-   Phone
-   Address
-   Notes
-   Billing history
-   Total billed
-   Outstanding amount

### 💳 Payments

Record payments against invoices and keep invoice status synchronized
with payment activity.

Supported payment records include:

-   Amount
-   Payment method
-   Payment date
-   Notes
-   Related invoice

### 💰 Expense Tracking

Track business expenses by:

-   Vendor
-   Category
-   Date
-   Amount
-   Currency
-   Notes

Expenses can also be created from AI-parsed receipts.

### 📊 Dashboard & Reports

The dashboard gives a quick view of business health, including:

-   Revenue
-   Outstanding invoices
-   Collection rate
-   Invoice status breakdown
-   Revenue history
-   Aging information
-   Top clients
-   Recent invoices

The reports area provides deeper financial breakdowns and CSV export
functionality.

------------------------------------------------------------------------

# 🤖 AI Features

AI is one of the main differentiators of Invoxa.

The backend exposes a dedicated AI service that currently uses **Groq's
OpenAI-compatible API**.

> The service file is named `geminiService.js` for historical reasons,
> but the current implementation uses Groq models through the OpenAI
> SDK.

## 🧾 AI Receipt & Invoice Scanning

Upload an image or PDF receipt/invoice and Invoxa extracts structured
information such as:

-   Vendor
-   Date
-   Currency
-   Subtotal
-   Tax
-   Total
-   Category
-   Notes
-   Line items
-   Quantity
-   Unit rate

### Supported input

-   Image files
-   PDF files

PDF documents are converted into images before being sent to the vision
model, with processing capped at five pages per request.

The extracted response is validated with **Zod** before it is returned
to the application.

## ✉️ AI Payment Reminders

Generate payment reminder drafts directly from an invoice.

Available tones:

-   Friendly
-   Firm
-   Final

The AI receives invoice, client, company, and overdue information and
generates a ready-to-review reminder.

## 📈 AI Business Summary

Invoxa can generate a concise financial summary using current billing
data, including:

-   Current-month revenue
-   Previous-month revenue
-   Outstanding amount
-   Number of overdue invoices
-   Total overdue amount
-   Top overdue clients/invoices
-   One actionable business suggestion

## ✍️ AI Writing Assistant

The invoice editor can use AI to help write:

-   Item descriptions
-   Invoice terms

This reduces the time spent writing repetitive invoice copy.

------------------------------------------------------------------------

# 🧱 Tech Stack

## Frontend

  Technology                    Purpose
  ----------------------------- -----------------------------------------
  React 19                      UI framework
  Vite                          Frontend tooling and development server
  React Router                  Application routing
  TanStack React Query          Server-state fetching and caching
  Axios                         HTTP client
  Tailwind CSS                  Styling
  Framer Motion                 Animations
  Lucide React                  Icons
  Recharts                      Charts and data visualization
  @react-pdf/renderer           PDF invoice rendering
  Zod-compatible API patterns   Validation-oriented data flow

## Backend

  Technology           Purpose
  -------------------- --------------------------------
  Node.js              Runtime
  Express 5            REST API
  PostgreSQL           Relational database
  Neon Serverless      PostgreSQL connectivity
  JWT                  Authentication/session signing
  HTTP-only cookies    Auth session storage
  bcrypt               Password hashing
  Zod                  Request/data validation
  Multer               Receipt file uploads
  pdf-to-img           PDF-to-image conversion
  Groq                 AI text and vision inference
  OpenAI SDK           Groq-compatible API client
  express-rate-limit   API rate limiting
  Morgan               Development HTTP logging

## Deployment

-   Frontend: **Vercel**
-   Backend: Node.js/Express deployment compatible with environment
    variables and PostgreSQL connectivity
-   Database: PostgreSQL / Neon-compatible setup

------------------------------------------------------------------------

# 🏗️ Architecture

Invoxa follows a straightforward full-stack architecture:

``` text
┌───────────────────────────────┐
│           React UI            │
│       Vite + Tailwind         │
└───────────────┬───────────────┘
                │
                │ Axios / REST
                ▼
┌───────────────────────────────┐
│       Express REST API        │
│                               │
│ Auth │ Invoices │ Clients     │
│ AI   │ Payments │ Expenses    │
│ Reports │ Items │ Settings    │
└───────┬───────────────┬───────┘
        │               │
        ▼               ▼
┌──────────────┐   ┌────────────────┐
│ PostgreSQL   │   │ Groq AI Models │
│ / Neon       │   │ Text + Vision  │
└──────────────┘   └────────────────┘
```

### Authentication flow

1.  User registers or logs in.
2.  Backend verifies credentials.
3.  A JWT is issued.
4.  The JWT is stored in an HTTP cookie.
5.  Protected API routes use `requireAuth`.
6.  Frontend authentication state is managed through `AuthContext`.
7.  Logging out clears the session and React Query cache.

------------------------------------------------------------------------

# 📁 Project Structure

``` text
Invoxa-main/
│
├── backend/
│   ├── scripts/
│   │   ├── migrate.js
│   │   └── seed.js
│   │
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   ├── env.js
│   │   │   └── schema.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   ├── rateLimit.js
│   │   │   ├── upload.js
│   │   │   └── validate.js
│   │   │
│   │   ├── models/
│   │   │   ├── Settings.js
│   │   │   └── User.js
│   │   │
│   │   ├── routes/
│   │   │   ├── ai.js
│   │   │   ├── auth.js
│   │   │   ├── clients.js
│   │   │   ├── dashboard.js
│   │   │   ├── expenses.js
│   │   │   ├── health.js
│   │   │   ├── invoice.js
│   │   │   ├── items.js
│   │   │   ├── payments.js
│   │   │   ├── reports.js
│   │   │   └── settings.js
│   │   │
│   │   ├── services/
│   │   │   └── geminiService.js
│   │   │
│   │   ├── utils/
│   │   │   ├── ApiError.js
│   │   │   ├── asyncHandler.js
│   │   │   ├── invoice.js
│   │   │   └── jwt.js
│   │   │
│   │   └── server.js
│   │
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   ├── assets/
    │   ├── components/
    │   ├── context/
    │   ├── hooks/
    │   ├── lib/
    │   ├── pages/
    │   ├── App.jsx
    │   ├── index.css
    │   ├── main.jsx
    │   └── routes.jsx
    │
    ├── package.json
    ├── vite.config.js
    └── vercel.json
```

------------------------------------------------------------------------

# 🗄️ Database Design

The PostgreSQL schema is centered around a user-owned billing workspace.

### Main tables

-   `users`
-   `company_settings`
-   `clients`
-   `invoices`
-   `invoice_items`
-   `catalog_items`
-   `expenses`
-   `payments`

Relationships are designed so each user's business data is isolated by
`user_id`.

For example:

``` text
users
  │
  ├── company_settings
  ├── clients
  │     └── invoices
  │           └── invoice_items
  ├── catalog_items
  ├── expenses
  └── payments
          └── invoices
```

Foreign keys and cascading deletes are used where appropriate, while
invoice numbers are unique per user.

------------------------------------------------------------------------

# 🔌 API Overview

All application API routes are served under `/api`.

## Health

``` http
GET /api/health
```

## Authentication

``` http
POST  /api/auth/register
POST  /api/auth/login
POST  /api/auth/logout
GET   /api/auth/me
PATCH /api/auth/profile
PATCH /api/auth/password
```

## Clients

``` http
GET    /api/clients
GET    /api/clients/:id
POST   /api/clients
PATCH  /api/clients/:id
DELETE /api/clients/:id
```

## Invoices

``` http
GET    /api/invoices
GET    /api/invoices/:id
POST   /api/invoices
PATCH  /api/invoices/:id
PATCH  /api/invoices/:id/status
DELETE /api/invoices/:id
```

## Payments

``` http
GET    /api/payments
POST   /api/payments
DELETE /api/payments/:id
```

## Expenses

``` http
GET    /api/expenses
POST   /api/expenses
PATCH  /api/expenses/:id
DELETE /api/expenses/:id
```

## Catalog Items

``` http
GET    /api/items
POST   /api/items
PATCH  /api/items/:id
DELETE /api/items/:id
```

## Reports & Dashboard

``` http
GET /api/dashboard
GET /api/reports
```

## Settings

``` http
GET   /api/settings
PATCH /api/settings
```

## AI

``` http
POST /api/ai/receipt-parse
POST /api/ai/business-summary
POST /api/ai/payment-reminder
POST /api/ai/write-note
```

AI endpoints are protected by authentication and an AI-specific rate
limiter.

------------------------------------------------------------------------

# 🔐 Security & Reliability

The project includes several defensive layers rather than treating the
frontend as a trusted environment.

### Authentication

-   JWT-based sessions
-   HTTP cookies
-   Protected backend routes
-   Password hashing with bcrypt
-   Session validation against the database

### Validation

Request payloads are validated with Zod schemas before sensitive
operations.

### Rate limiting

Separate rate limits are used for:

-   Authentication attempts
-   AI operations

The AI limiter is intentionally stricter because AI calls can be
computationally and financially expensive.

### CORS

The backend accepts configured client origins and credentials.

### Database safety

-   Parameterized PostgreSQL queries
-   Foreign-key relationships
-   User-scoped records
-   Transactions for multi-step invoice/payment operations

------------------------------------------------------------------------

# ⚙️ Local Development

## 1. Clone the project

``` bash
git clone <your-repository-url>
cd Invoxa-main
```

## 2. Install backend dependencies

``` bash
cd backend
npm install
```

## 3. Install frontend dependencies

``` bash
cd ../frontend
npm install
```

------------------------------------------------------------------------

# 🔑 Environment Variables

Create:

``` text
backend/.env
```

Example:

``` env
NODE_ENV=development
PORT=8000

DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE

JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=30d
COOKIE_NAME=auth_token

CLIENT_ORIGIN=http://localhost:5173

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b
GROQ_VISION_MODEL=qwen/qwen3.6-27b
```

### Required variables

``` text
DATABASE_URL
JWT_SECRET
```

### AI variables

``` text
GROQ_API_KEY
GROQ_MODEL
GROQ_VISION_MODEL
```

If `GROQ_API_KEY` is missing, the normal billing application can still
be configured, but AI-powered operations will not be available.

------------------------------------------------------------------------

# 🗃️ Database Setup

The application can initialize its PostgreSQL schema automatically when
the backend starts.

You can also apply the schema explicitly:

``` bash
cd backend
node scripts/migrate.js
```

The schema creates the required tables and indexes using PostgreSQL.

------------------------------------------------------------------------

# 🌱 Seed Demo Data

A seed script is included for development/demo environments.

``` bash
cd backend
node scripts/seed.js
```

The seed process creates realistic sample data including:

-   Clients
-   Invoices
-   Invoice line items
-   Catalog items
-   Expenses
-   Payments
-   Company settings

> Do not run the seed script against a production database unless you
> intentionally want to reset/repopulate the demo dataset. The script
> deletes existing demo-user billing records before recreating them.

------------------------------------------------------------------------

# ▶️ Run the Application

## Start backend

``` bash
cd backend
npm run dev
```

Backend:

``` text
http://localhost:8000
```

## Start frontend

In another terminal:

``` bash
cd frontend
npm run dev
```

Frontend:

``` text
http://localhost:5173
```

The Vite development server proxies `/api` requests to:

``` text
http://localhost:8000
```

------------------------------------------------------------------------

# 🧪 Useful Commands

### Frontend

``` bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Backend

``` bash
npm run dev
npm start
```

### Database

``` bash
node scripts/migrate.js
node scripts/seed.js
```

------------------------------------------------------------------------

# ☁️ Deployment

## Frontend --- Vercel

The frontend already includes a `vercel.json` rewrite configuration
suitable for SPA routing.

Build command:

``` bash
npm run build
```

Output directory:

``` text
dist
```

Make sure the deployed frontend can reach the deployed backend and that
the backend's `CLIENT_ORIGIN` contains the production frontend URL.

Example:

``` env
CLIENT_ORIGIN=https://ai-invoxa.vercel.app
```

## Backend

Deploy the `backend` directory to a Node.js-compatible platform.

Configure:

``` env
NODE_ENV=production
PORT=<platform-provided-port>
DATABASE_URL=<production-postgres-url>
JWT_SECRET=<production-secret>
CLIENT_ORIGIN=https://ai-invoxa.vercel.app
GROQ_API_KEY=<groq-key>
```

For production, use a strong randomly generated JWT secret and never
commit `.env` files or API keys.

------------------------------------------------------------------------

# 🧭 Application Routes

The frontend currently provides these major application views:

  Route                  Purpose
  ---------------------- -----------------------------------------------------
  `/`                    Marketing landing page
  `/login`               User login
  `/register`            Account registration
  `/dashboard`           Financial overview
  `/invoices`            Invoice management
  `/invoices/new`        Create invoice
  `/invoices/:id`        Invoice details
  `/invoices/:id/edit`   Edit invoice
  `/clients`             Client CRM
  `/clients/:id`         Client details
  `/expenses`            Expense management
  `/payments`            Payment tracking
  `/items`               Catalog/service items
  `/reports`             Financial reports
  `/settings`            Company, profile, appearance, and password settings

Protected application routes redirect unauthenticated users to `/login`.

------------------------------------------------------------------------

# 🎨 UI Philosophy

Invoxa's interface follows a SaaS-first design approach:

### Visual language

-   Teal as the primary brand accent
-   Large, confident typography
-   Rounded cards and controls
-   Soft shadows
-   Generous spacing
-   Subtle motion
-   High information density without visual clutter

### Interaction principles

-   Important actions remain visible
-   Destructive actions require confirmation
-   Loading states use skeletons where appropriate
-   Empty states guide users toward the next action
-   Toast-style feedback is used for important operations
-   Responsive layouts keep the application usable across screen sizes

------------------------------------------------------------------------

# 🧩 Frontend Architecture

The frontend is organized around reusable components and data hooks.

``` text
pages/
   ↓
hooks/
   ↓
api/
   ↓
Express REST API
```

### Contexts

The application uses React context for shared state such as:

-   Authentication
-   Theme/appearance
-   UI interactions

### React Query

TanStack React Query handles server state and helps keep invoice,
client, payment, expense, and dashboard data synchronized after
mutations.

### Reusable components

The UI contains reusable building blocks such as:

-   Buttons
-   Cards
-   Inputs
-   Tabs
-   Badges
-   Modals
-   Empty states
-   Skeleton loaders
-   Layout/navigation components

This keeps the individual pages focused on business logic rather than
repeated UI code.

------------------------------------------------------------------------

# 🧠 Backend Architecture

The Express backend is divided into focused layers:

``` text
Routes
  ↓
Middleware
  ↓
Validation / Authentication
  ↓
Database / Services
  ↓
Response
```

### Routes

Handle HTTP requests and business operations.

### Middleware

Provides:

-   Authentication
-   Validation
-   File uploads
-   Rate limiting
-   Error handling

### Services

AI-specific logic is separated from HTTP route handlers.

### Utilities

Shared helpers handle:

-   JWT operations
-   Invoice calculations
-   API errors
-   Async route handling

This separation makes the backend easier to maintain and extend.

------------------------------------------------------------------------

# 📌 Current AI Model Configuration

The current implementation uses Groq through the OpenAI-compatible SDK.

### Text model

``` text
openai/gpt-oss-20b
```

Used for:

-   Business summaries
-   Payment reminders
-   AI writing assistance

### Vision model

``` text
qwen/qwen3.6-27b
```

Used for:

-   Receipt parsing
-   Invoice/receipt image extraction
-   PDF receipt processing

Both model names can be overridden through environment variables.

------------------------------------------------------------------------

# 🔮 Future Improvements

Potential next steps for Invoxa include:

-   Email delivery for invoices and reminders
-   Automated recurring invoices
-   Payment gateway integration
-   Multi-user teams and role-based permissions
-   Client portal
-   Automated overdue follow-ups
-   More advanced financial forecasting
-   OCR confidence scores
-   AI anomaly detection
-   Recurring expense detection
-   Audit logs
-   Webhook integrations
-   Accounting platform integrations
-   Multi-language invoices
-   Advanced tax rules by country/region
-   Automated monthly financial reports

The current architecture provides a solid foundation for these additions
because billing, payments, clients, expenses, reports, and AI
capabilities are already separated into dedicated API modules.

------------------------------------------------------------------------

# 🤝 Contributing

Contributions are welcome.

A typical workflow:

``` bash
git checkout -b feature/my-feature
```

Make your changes, run:

``` bash
npm run lint
npm run build
```

Then open a pull request with:

-   What changed
-   Why it changed
-   Screenshots for UI changes
-   API/database changes if applicable
-   Testing notes

------------------------------------------------------------------------

# 📄 License

Add the project's intended license here before publishing the repository
publicly.

------------------------------------------------------------------------

# 👨‍💻 Project Summary

**Invoxa** is more than an invoice generator.

It is a full-stack business billing workspace that connects:

**Invoices → Clients → Payments → Expenses → Reports → AI**

The goal is to remove the repetitive administrative work around billing
so business owners can spend more time doing the work that actually
generates revenue.

------------------------------------------------------------------------

## ⭐ If you like the project

Give the repository a star, share feedback, or contribute an
improvement.

**Invoxa --- Invoicing That Runs Itself.**
