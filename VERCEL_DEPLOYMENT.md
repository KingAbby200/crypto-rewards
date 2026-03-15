# Vercel Deployment Guide

This guide explains how to deploy the Crypto Rewards Dashboard to Vercel. The project has been modified to use Vercel serverless functions for the backend API.

## Prerequisites

- Vercel account
- MongoDB Atlas database
- GitHub repository

## Project Structure

The frontend is in `artifacts/artifacts/crypto-app`, and the backend API is implemented as Vercel serverless functions in `artifacts/artifacts/crypto-app/api/`.

## Deployment

1. Connect your GitHub repository to Vercel
2. Set the root directory to `artifacts/artifacts/crypto-app`
3. Vercel will automatically detect the functions in `api/`
4. Set the build command to: `cd ../.. && pnpm --filter @workspace/api-spec run codegen && pnpm --filter @workspace/crypto-app run build`
5. Output directory: `dist/public`

## Environment Variables

Add these to Vercel:

```
MONGODB_URI=your-mongodb-atlas-uri
ADMIN_PASSWORD=your-admin-password
JWT_SECRET=your-jwt-secret
```

## API Functions

The following serverless functions have been created:

- `api/auth/login.js` - Admin login
- `api/auth/logout.js` - Admin logout
- `api/auth/me.js` - Check auth status
- `api/healthz.js` - Health check

## Frontend Configuration

The frontend automatically uses the serverless functions in production. In development, it proxies `/api` requests to the local backend.

## Post-Deployment

Test the login functionality with the admin password.</content>
<parameter name="filePath">C:\Users\USER\Downloads\SFC2\VERCEL_DEPLOYMENT.md