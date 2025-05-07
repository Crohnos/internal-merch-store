# Deployment Guide for Internal Merchandise Store

## Project Overview

This project is an internal merchandise store for company employees built with:

- **Frontend**: React, React Router, Vite, PicoCSS, Zustand, axios, TypeScript
- **Backend**: Node.js, Express, SQLite, TypeScript, Zod

## Step-by-Step Deployment on Render.com (Free Tier)

### Prerequisites

1. Create a [Render.com](https://render.com) account
2. Connect your GitHub account to Render
3. Fork or push this repository to your GitHub account

### Important Note About Render's Free Tier

Render's free tier uses an **ephemeral filesystem**, which means the filesystem is not persistent across deployments or service restarts. Any changes to the filesystem (including the SQLite database) will be lost when the service restarts or a new deployment occurs.

To address this, we've implemented a database seeding script that initializes the database and populates it with sample data. This script will run as part of the build process.

### Backend Deployment (Web Service)

1. Log in to your Render.com dashboard
2. Click the "New +" button and select "Web Service"
3. Connect to your GitHub repository
4. Configure the following settings:
   - **Name**: `internal-merch-store-backend` (or whatever you prefer)
   - **Region**: Choose the closest to your users
   - **Branch**: `main` (or your preferred branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build && npm run seed`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. Click "Advanced" and add the following environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `3001` (Render will override this, but it's good to have)
   - `API_URL`: (leave blank for now, we'll update after frontend deployment)
   - `CORS_ORIGIN`: (leave blank for now, we'll update after frontend deployment)

6. Click "Create Web Service"
7. Wait for the initial deployment to complete (may take 5-10 minutes)
8. Once deployed, note the URL Render assigns to your service (e.g., `https://internal-merch-store-backend.onrender.com`)

### Frontend Deployment (Static Site)

1. Return to your Render.com dashboard
2. Click the "New +" button and select "Static Site"
3. Connect to the same GitHub repository
4. Configure the following settings:
   - **Name**: `internal-merch-store-frontend` (or whatever you prefer)
   - **Branch**: `main` (or your preferred branch)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

5. Click "Advanced" and add the following environment variables:
   - `VITE_API_BASE_URL`: `https://your-backend-url.onrender.com/api` (replace with your actual backend URL from step 8 above)

6. Add a redirect/rewrite rule for the SPA routing:
   - Click "Add Redirect/Rewrite"
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: Rewrite

7. Click "Create Static Site"
8. Wait for the initial deployment to complete
9. Once deployed, note the URL Render assigns to your frontend (e.g., `https://internal-merch-store-frontend.onrender.com`)

### Connecting Frontend and Backend

1. Go back to your backend web service in the Render dashboard
2. Click "Environment" in the left sidebar
3. Add/update the following environment variables:
   - `CORS_ORIGIN`: Your frontend URL (e.g., `https://internal-merch-store-frontend.onrender.com`)
4. Click "Save Changes"
5. Restart your backend service for the changes to take effect

### Testing Your Deployed Application

1. Visit your frontend URL in a browser
2. Ensure you can browse products and add items to cart
3. Test out the checkout process
4. Verify admin functionality (if applicable to your use case)

## Working with the Ephemeral Database

Since Render's free tier uses an ephemeral filesystem, the SQLite database will be recreated and reseeded:
- On every backend service deployment
- When the service restarts (which happens automatically after 15 minutes of inactivity on the free tier)
- If the service is inactive for an extended period (free tier services spin down after inactivity)

### Strategies for Dealing with Ephemeral Storage

1. **Demo/Testing Use**: For demos or testing, the automatic reseeding is actually beneficial as it resets the application to a known state.

2. **External Database Service**: For production use, consider:
   - PostgreSQL from Render (Render offers a free PostgreSQL database with limitations)
   - Another cloud database service (like Railway, ElephantSQL, etc.)
   - Modifying the backend to use the external database

3. **Scheduled Backups**: Implement a scheduled task to periodically backup the SQLite database to a persistent storage service (like S3, Google Cloud Storage, etc.)

## Upgrading to Persistent Storage

To upgrade to a persistent storage solution on Render:

1. Upgrade to a paid tier Web Service (which provides persistent disk)
2. OR Use Render's PostgreSQL service and modify the backend code to use PostgreSQL instead of SQLite

## Maintenance

### Updating Your Application

1. Push changes to your GitHub repository
2. Render will automatically redeploy both the frontend and backend

### Database Schema Updates

If you need to update the database schema:

1. Update the `schema.sql` file in `backend/src/database/`
2. Modify the `seed.ts` script in `backend/src/scripts/` to include any new tables or columns
3. Push changes to GitHub, which will trigger a redeployment

## Performance Optimization

1. **Build Optimization**: The frontend build is already optimized by Vite
2. **Cache Control**: Render automatically sets cache headers for static assets
3. **Service Suspension**: Be aware that free tier services suspend after 15 minutes of inactivity, which can cause a delay on the first request after inactivity

## Security Considerations

1. **API Security**: Consider implementing authentication for the API
2. **Environment Variables**: Store sensitive information in environment variables
3. **CORS**: The backend is already configured to use CORS, which is set to allow only the frontend domain
4. **HTTPS**: Render automatically provides HTTPS for all services

## Troubleshooting Common Issues

1. **Backend Not Responding**: Check Render logs for errors; ensure the backend service is awake
2. **Frontend Can't Connect to Backend**: Verify the `VITE_API_BASE_URL` environment variable is correct
3. **Database Issues**: If you encounter database errors, check if your schema and seed files are compatible
4. **Deployment Failures**: Check the build logs for errors; common issues include missing dependencies or build errors

## Cost Management

Render's free tier includes:
- 750 hours of service runtime per month (enough for one always-on service)
- 100 GB of outbound data transfer
- 500 build minutes per month

Monitor your usage in the Render dashboard to avoid unexpected charges.