# Internal Merchandise Store

A full-stack web application for an internal company merchandise store built with React and Node.js.

## Overview

This application allows company employees to browse and purchase company-branded merchandise. Purchases are tracked for payroll deduction rather than requiring credit card payments.

## Features

- **Product Catalog**: Browse company-branded merchandise
- **Shopping Cart**: Add items to a cart for checkout
- **Checkout**: Submit orders with employee information
- **Admin Dashboard**: Manage products, orders, users, and more

## Technology Stack

### Frontend
- React
- React Router v6 (code-based routing)
- Vite
- PicoCSS (for styling)
- Zustand (state management)
- Axios (API client)
- TypeScript

### Backend
- Node.js
- Express
- SQLite (using sqlite3)
- TypeScript
- Zod (validation)

## Project Structure

The project is organized into two main directories:

- `frontend/`: React frontend application
- `backend/`: Node.js/Express backend API

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
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

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions, especially for Render.com's free tier.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- PicoCSS for providing a minimal CSS framework
- The developers of all the libraries and tools used in this project