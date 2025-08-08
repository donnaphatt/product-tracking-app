# Deploy to Render with GitHub (Easy & Free!)

## Why Render + GitHub is Perfect
- **Free tier**: 750 hours/month per service (more than enough)
- **GitHub integration**: Auto-deploy on push
- **Docker support**: Uses your existing Dockerfiles
- **Simple setup**: Much easier than Railway
- **Reliable**: Great uptime and performance

## Prerequisites
1. Push your code to GitHub (if not already done)
2. Create MongoDB Atlas free account (512MB free)

## Step-by-Step Deployment

### 1. Set Up MongoDB Atlas (Free Database)
```bash
# Go to https://www.mongodb.com/atlas
# 1. Create free account
# 2. Create new cluster (M0 Sandbox - FREE)
# 3. Create database user
# 4. Whitelist IP addresses (0.0.0.0/0 for now)
# 5. Get connection string (looks like):
#    mongodb+srv://username:password@cluster.mongodb.net/product_tracking
```

### 2. Push to GitHub
```bash
# If not already on GitHub
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 3. Deploy Backend Service
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Configure:
   - **Name**: `product-tracker-backend`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Plan**: `Free`

6. Add Environment Variables:
   ```
   MONGODB_URL=mongodb+srv://your-connection-string
   ENVIRONMENT=production
   ```

7. Click "Create Web Service"

### 4. Deploy Frontend Service
1. Click "New +" → "Web Service"
2. Connect same GitHub repo
3. Configure:
   - **Name**: `product-tracker-frontend`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./frontend/Dockerfile.backup`
   - **Plan**: `Free`

4. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://product-tracker-backend.onrender.com
   ```
   (Replace with your actual backend URL from step 3)

5. Click "Create Web Service"

### 5. Alternative: One-Click Deploy with render.yaml
Instead of manual setup, you can use the `render.yaml` file I created:

1. Push the `render.yaml` to your GitHub repo
2. Go to Render Dashboard
3. Click "New +" → "Blueprint"
4. Connect your GitHub repo
5. Render will automatically create both services!

## Environment Variables Summary

### Backend Service
```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/product_tracking
ENVIRONMENT=production
```

### Frontend Service
```env
REACT_APP_API_URL=https://your-backend-service.onrender.com
```

## Free Tier Limits
- **Web Services**: 750 hours/month each (perfect for 2 services)
- **Build Time**: Unlimited
- **Bandwidth**: 100GB/month
- **Custom Domains**: Yes
- **SSL**: Free

## Auto-Deploy Setup
Once connected to GitHub:
- Every push to `main` branch auto-deploys
- Build logs available in dashboard
- Rollback to previous versions easily

## Troubleshooting
1. **Build fails**: Check Dockerfile paths in render.yaml
2. **Services can't communicate**: Verify REACT_APP_API_URL points to backend
3. **Database connection**: Verify MongoDB Atlas connection string

## Cost Breakdown (FREE!)
- **Backend**: Free (750 hours/month)
- **Frontend**: Free (750 hours/month)  
- **Database**: Free (MongoDB Atlas 512MB)
- **Total**: $0/month

## Next Steps After Deployment
1. Set up custom domain (optional)
2. Configure environment-specific variables
3. Set up monitoring and alerts
4. Add CI/CD workflows

## Benefits Over Railway
- ✅ Simpler setup process
- ✅ Better GitHub integration
- ✅ More predictable free tier
- ✅ Better documentation
- ✅ No complex multi-service configuration needed

Ready to deploy? Just follow the steps above or use the render.yaml for one-click deployment!
