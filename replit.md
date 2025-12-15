# Easy Gov Forms

## Overview

Easy Gov Forms is a full-stack web application that helps Indian citizens apply for government jobs through an AI-assisted form filling platform. The system provides document storage, automated form population, application tracking, and deadline reminders. It features both a user-facing dashboard for job seekers and an administrative panel for managing users, jobs, CSC centers, leads, and support tickets.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **Routing**: React Router DOM for client-side navigation
- **State Management**: TanStack React Query for server state, React Context for auth state
- **Styling**: Tailwind CSS with CSS variables for theming, using a green/white color scheme
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Path Aliases**: `@/` maps to `./src/` for clean imports

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript executed via tsx
- **API Structure**: RESTful API with route-based organization under `/api/*`
- **Authentication**: JWT-based auth with httpOnly cookies, bcryptjs for password hashing
- **File Uploads**: Base64 encoded files stored in `/uploads` directory

### Data Storage
- **Database**: MongoDB with Mongoose ODM
- **Connection**: Singleton pattern with connection caching
- **Models**: User, Job, Application, CSCCenter, Lead, Package, UserPackage, SupportTicket, Referral, UserDocument, CSCWallet, WalletTransaction, ChatMessage

### Key Design Patterns
- **Dual Layout System**: Separate layouts for user dashboard (`DashboardLayout`) and admin panel (`AdminLayout`)
- **Protected Routes**: Middleware-based authentication (`verifyToken`) and authorization (`isAdmin`)
- **API Proxy**: Vite dev server proxies `/api` requests to Express backend on port 3001
- **Concurrent Development**: Frontend (port 5000) and backend (port 3001) run simultaneously via concurrently

### Route Structure
- Public routes: `/`, `/govt-jobs`, `/pricing`, `/login`, `/register`, etc.
- User dashboard: `/dashboard/*` - applications, documents, jobs, packages, support, chat
- Admin panel: `/admin/*` - users, CSC centers, leads, jobs, payments, documents, withdrawals, support tickets
- CSC portal: `/csc/*` - leads, wallet, transactions, tasks, chat, user management

### Admin Approval Workflows
- **Document Verification**: Admins can view, approve, or reject user-uploaded documents with rejection reasons
- **Payment Management**: View all payment transactions with revenue analytics and filtering
- **Wallet Withdrawals**: Approve or reject CSC center withdrawal requests with automatic wallet balance refunds on rejection

### CSC Center Features  
- **Wallet System**: CSC centers have wallets with balance, earnings tracking, and withdrawal requests
- **Task Assignment**: Admins can assign form-filling tasks to CSC centers with commission
- **Chat System**: Cross-dashboard messaging between admins, CSC centers, users, and leads

## External Dependencies

### Database
- **MongoDB**: Primary database, connection string via `MONGODB_URI` environment variable

### Payment Processing
- **Razorpay**: Payment gateway integration for package purchases, requires `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`

### Authentication
- **JWT**: Token-based authentication requiring `JWT_SECRET` environment variable

### Development Tools
- **Lovable**: Project scaffolding and component tagging integration
- **ESLint**: Code linting with TypeScript and React plugins
- **PostCSS/Autoprefixer**: CSS processing for Tailwind

### Required Environment Variables
```
MONGODB_URI - MongoDB connection string
JWT_SECRET - Secret key for JWT signing
RAZORPAY_KEY_ID - Razorpay API key
RAZORPAY_KEY_SECRET - Razorpay secret key
```