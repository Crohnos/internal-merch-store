# Internal Merchandise Store

A full-stack web application for an internal company merchandise store built with React and Node.js.

## Overview

This application allows company employees to browse and purchase company-branded merchandise. Purchases are tracked for payroll deduction rather than requiring credit card payments.

## Features

- **Product Catalog**: Browse company-branded merchandise
- **Shopping Cart**: Add items to a cart for checkout
- **Checkout**: Submit orders with employee information
- **Admin Dashboard**: Manage products, orders, users, and more
- **Responsive Design**: Works on mobile, tablet, and desktop devices
- **Inventory Management**: Track stock levels for different product sizes

## Technology Stack

### Frontend
- React 18
- React Router v6 (code-based routing)
- Vite 4 (build tool)
- PicoCSS (for minimal, semantic styling)
- Zustand (state management)
- Axios (API client)
- TypeScript 5

### Backend
- Node.js 18+
- Express 4
- SQLite 3 (using sqlite3)
- TypeScript 5
- Zod (validation)

## Project Structure

The project is organized into two main directories:

- `frontend/`: React frontend application
- `backend/`: Node.js/Express backend API

Key directories include:
- `backend/src/controllers`: API endpoint handlers
- `backend/src/services`: Database operations
- `frontend/src/components`: Reusable UI components
- `frontend/src/pages`: Top-level page components
- `frontend/src/store`: Global state management

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone git@github.com:Crohnos/internal-merch-store.git
cd internal-merch-store
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

### Development

1. Start the backend server
```bash
cd backend
npm run dev
```

2. Start the frontend development server
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to http://localhost:5173

### Database Setup

The application uses SQLite, which stores the database in a file. The database is automatically initialized when the server starts.

To seed the database with initial data:
```bash
cd backend
npm run seed
```

### Running Tests

Backend tests:
```bash
cd backend
npm test
```

Frontend type checking:
```bash
cd frontend
npm run typecheck
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions, especially for Render.com's free tier.

## API Documentation

The backend offers RESTful API endpoints for:

- `/api/items` - Product management
- `/api/item-types` - Product categories
- `/api/sizes` - Size management
- `/api/users` - User management
- `/api/orders` - Order processing
- `/api/item-availability` - Inventory management

All endpoints support standard CRUD operations.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- PicoCSS for providing a minimal CSS framework
- The developers of all the libraries and tools used in this project
