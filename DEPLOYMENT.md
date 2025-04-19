# Deployment Notes for Internal Merchandise Store

## Project Overview

This project is an internal merchandise store for company employees built with:

- **Frontend**: React, React Router, Vite, PicoCSS, Zustand, axios, TypeScript
- **Backend**: Node.js, Express, SQLite, TypeScript, Zod

## Deployment on Render.com (Free Tier)

### Important Note About Render's Free Tier

Render's free tier uses an **ephemeral filesystem**, which means the filesystem is not persistent across deployments or service restarts. Any changes to the filesystem (including the SQLite database) will be lost when the service restarts or a new deployment occurs.

To address this, we've implemented a database seeding script that initializes the database and populates it with sample data. This script should be run as part of the build or start process.

### Backend Deployment (Web Service)

1. Create a new **Web Service** in Render
2. Connect your repository
3. Configure the following settings:
   - **Name**: internal-merch-store-backend (or whatever you prefer)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build && npm run seed`
   - **Start Command**: `npm start`

4. Add the following environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `3001` (or whatever port you prefer)

5. Deploy the service

### Frontend Deployment (Static Site)

1. Create a new **Static Site** in Render
2. Connect your repository
3. Configure the following settings:
   - **Name**: internal-merch-store-frontend (or whatever you prefer)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. Add the following environment variables:
   - `VITE_API_BASE_URL`: `https://your-backend-url.onrender.com/api` (replace with your actual backend URL)

5. Add a redirect/rewrite rule for SPAs:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: Rewrite

6. Deploy the site

## Data Persistence Considerations

Since we're using SQLite on Render's free tier with an ephemeral filesystem, the database will be recreated and reseeded on every deployment or service restart. This means:

1. Any changes made to the data in production will be lost when the service restarts.
2. This is acceptable for a demo or internal tool with minimal data requirements.
3. For a production environment with real data persistence needs, consider:
   - Upgrading to a paid Render tier with persistent storage
   - Switching to a managed database service (e.g., PostgreSQL, MySQL)
   - Implementing backup/restore mechanisms for the SQLite database

## Maintenance

### Database Updates

If you need to update the database schema:

1. Update the `schema.sql` file with your changes
2. Modify the `seed.ts` script to handle any new tables or columns
3. Redeploy the backend service

### Environment Updates

The SQLite database will be recreated and reseeded:
- On every backend service deployment
- When the service restarts (which happens automatically every 15 minutes on the free tier)
- If the service is inactive for an extended period (free tier services spin down after inactivity)

## Testing Deployment Locally

To test the deployment process locally:

1. Backend:
   ```
   cd backend
   npm run build
   npm run seed
   npm start
   ```

2. Frontend:
   ```
   cd frontend
   npm run build
   # Test with a static server like serve
   npx serve -s dist
   ```

## Security Considerations

- The current implementation does not include authentication/authorization
- Implement proper authentication before exposing this application to a wider audience
- Consider implementing HTTPS, API rate limiting, and other security measures for production use