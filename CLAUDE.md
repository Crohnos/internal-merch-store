# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Backend: 
  - `cd backend && npm run dev` - Start backend development server
  - `cd backend && npm run build` - Build backend
  - `cd backend && npm run seed` - Seed database with test data
  - `cd backend && npm test` - Run backend tests

- Frontend:
  - `cd frontend && npm run dev` - Start frontend development server
  - `cd frontend && npm run build` - Build frontend
  - `cd frontend && npm run lint` - Run ESLint to check code quality
  - `cd frontend && npm run typecheck` - Run TypeScript type checking

- Full stack:
  - `npm run dev` - Start both frontend and backend in development mode

## Project Architecture
- **Frontend**: Single-page React application with Zustand for state management
  - `/frontend/src/components` - Reusable UI components
  - `/frontend/src/pages` - Page-level components that use routing
  - `/frontend/src/services` - API client services
  - `/frontend/src/types` - TypeScript interfaces
  - `/frontend/src/context` - React contexts (when needed)
  - `/frontend/src/store` - Zustand state stores

- **Backend**: Express API server with SQLite database
  - `/backend/src/controllers` - Request handlers
  - `/backend/src/routes` - API route definitions
  - `/backend/src/services` - Business logic and database operations
  - `/backend/src/validation` - Zod validation schemas
  - `/backend/src/types` - TypeScript interfaces
  - `/backend/src/database` - Database connection and schema

- **Data Flow**:
  1. Frontend components call API services
  2. API services make HTTP requests to backend
  3. Backend routes direct to controllers
  4. Controllers validate input with Zod schemas
  5. Controllers call services for business logic
  6. Services interact with the SQLite database
  7. Results flow back through the same path

## Code Style Guidelines
- **TypeScript**: Use strong typing throughout; avoid `any` type
- **React Components**: Use functional components with hooks
- **Imports**: Group imports (React, third-party, local) with line breaks between groups
- **Formatting**: Use camelCase for variables/functions, PascalCase for components/interfaces
- **Error Handling**: Use try/catch blocks with specific error messages; log errors to console
- **Async/Await**: Prefer async/await over Promises with .then()
- **State Management**: Use Zustand for global state, React hooks for component state
- **CSS**: Use PicoCSS with semantic HTML elements
- **API Calls**: Use the axios-based api services in /frontend/src/services/api.ts

## Database Schema
The SQLite database has the following main tables:
- Items (products)
- ItemTypes (product categories)
- Sizes
- ItemAvailability (inventory)
- Users
- Roles
- Orders
- OrderLines (line items in orders)

Relationships:
- Items belong to ItemTypes
- ItemTypes have many Sizes
- ItemAvailability connects Items and Sizes with inventory
- Users belong to Roles
- Orders belong to Users
- OrderLines belong to Orders and reference Items and Sizes