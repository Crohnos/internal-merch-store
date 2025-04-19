# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Backend: 
  - `cd backend && npm run dev` - Start backend development server
  - `cd backend && npm run build` - Build backend
  - `cd backend && npm run seed` - Seed database with test data

- Frontend:
  - `cd frontend && npm run dev` - Start frontend development server
  - `cd frontend && npm run build` - Build frontend

## Code Style Guidelines
- **TypeScript**: Use strong typing throughout; avoid `any` type
- **React Components**: Use functional components with hooks
- **Imports**: Group imports (React, third-party, local) with line breaks between groups
- **Formatting**: Use camelCase for variables/functions, PascalCase for components/interfaces
- **Error Handling**: Use try/catch blocks with specific error messages; log errors to console
- **Async/Await**: Prefer async/await over Promises with .then()
- **State Management**: Use Zustand for global state, React hooks for component state
- **CSS**: Use PicoCSS with semantic HTML elements
- **File Structure**: Keep related components/services in their own files and directories