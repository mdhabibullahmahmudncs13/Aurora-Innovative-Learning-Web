# Vercel Deployment Guide

This guide will walk you through deploying your Next.js learning platform to Vercel.

## Prerequisites

- Node.js 18+ installed
- Git repository (GitHub, GitLab, or Bitbucket)
- Vercel account (free tier available)
- Appwrite backend configured

## Step 1: Prepare Your Project

### 1.1 Environment Variables

Ensure your `.env.local` file contains all necessary environment variables:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=your_appwrite_endpoint
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID=your_storage_bucket_id
# Add other environment variables as needed
```

### 1.2 Verify Build Process

Test your build locally:

```bash
npm run build
npm start
```

Ensure there are no build errors.

## Step 2: Push to Git Repository

### 2.1 Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit"
```

### 2.2 Connect to Remote Repository

```bash
# For GitHub
git remote add origin https://github.com/yourusername/your-repo-name.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. **Sign up/Login to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub, GitLab, or Bitbucket

2. **Import Project**
   - Click "New Project"
   - Import your Git repository
   - Select the repository containing your Next.js app

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (or `./front-end` if your Next.js app is in a subdirectory)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Environment Variables**
   - In the "Environment Variables" section, add all variables from your `.env.local`:
     ```
     NEXT_PUBLIC_APPWRITE_ENDPOINT = your_appwrite_endpoint
     NEXT_PUBLIC_APPWRITE_PROJECT_ID = your_project_id
     NEXT_PUBLIC_APPWRITE_DATABASE_ID = your_database_id
     NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID = your_storage_bucket_id
     ```

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

### Method 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd front-end
   vercel
   ```

   Follow the prompts:
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N` (for first deployment)
   - Project name? Enter your desired name
   - Directory? `./` (current directory)

## Step 4: Configure Custom Domain (Optional)

1. **In Vercel Dashboard**
   - Go to your project settings
   - Navigate to "Domains"
   - Add your custom domain
   - Configure DNS records as instructed

## Step 5: Set Up Automatic Deployments

Vercel automatically deploys when you push to your main branch. For other branches:

1. **Preview Deployments**
   - Every push to any branch creates a preview deployment
   - Perfect for testing features before merging

2. **Production Deployments**
   - Only pushes to your main branch deploy to production
   - Configure in Project Settings > Git

## Step 6: Optimize for Production

### 6.1 Performance Optimizations

Add these to your `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable compression
  compress: true,
  
  // Optimize images
  images: {
    domains: ['your-appwrite-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Enable experimental features
  experimental: {
    optimizeCss: true,
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### 6.2 Environment-Specific Configurations

Create different environment variables for different stages:

- **Development**: Local Appwrite instance
- **Preview**: Staging Appwrite instance
- **Production**: Production Appwrite instance

## Step 7: Monitor and Maintain

### 7.1 Analytics

- Enable Vercel Analytics in your dashboard
- Monitor performance and user behavior

### 7.2 Error Monitoring

Consider integrating:
- Sentry for error tracking
- LogRocket for session replay

### 7.3 Performance Monitoring

- Use Vercel's built-in performance monitoring
- Set up Core Web Vitals tracking

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Verify environment variables are set

2. **Environment Variables Not Working**
   - Ensure variables start with `NEXT_PUBLIC_` for client-side access
   - Redeploy after adding new environment variables

3. **404 Errors**
   - Check your routing configuration
   - Ensure dynamic routes are properly configured

4. **API Routes Not Working**
   - Verify API routes are in the correct directory structure
   - Check for serverless function limits

### Getting Help

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

## Security Checklist

- [ ] Environment variables are properly configured
- [ ] No sensitive data in client-side code
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Security headers are configured
- [ ] Dependencies are up to date

## Post-Deployment

1. **Test all functionality**
   - User registration/login
   - Course enrollment
   - Video playback
   - Payment processing (if applicable)

2. **Set up monitoring**
   - Error tracking
   - Performance monitoring
   - Uptime monitoring

3. **Configure backups**
   - Database backups
   - Media file backups

## Useful Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Start production server locally
npm start

# Deploy to Vercel (CLI)
vercel

# Deploy to production (CLI)
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]
```

## Support

If you encounter any issues during deployment, please:

1. Check the Vercel build logs
2. Verify your environment variables
3. Ensure your Appwrite backend is accessible
4. Contact support with specific error messages

---

**Congratulations!** Your learning platform is now live on Vercel! 🎉

Your application will be available at: `https://your-project-name.vercel.app`