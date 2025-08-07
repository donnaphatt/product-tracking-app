# Railway Deployment Guide

## 🚀 Deploy Your Product Tracking App to Railway

### Prerequisites
- GitHub account
- Railway account (sign up at [railway.app](https://railway.app))
- Your code pushed to GitHub

### Step 1: Push to GitHub

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit - Product Tracking App with Railway deployment"

# Add your GitHub repository as origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

### Step 2: Deploy on Railway

1. **Sign up/Login to Railway**: Go to [railway.app](https://railway.app) and sign up with GitHub

2. **Create New Project**: Click "New Project" → "Deploy from GitHub repo"

3. **Select Repository**: Choose your product-tracking-app repository

4. **Deploy Services**: Railway will detect your services automatically:
   - **Backend**: Will deploy from `/backend` folder
   - **Frontend**: Will deploy from `/frontend` folder
   - **Database**: Add MongoDB service

### Step 3: Add MongoDB Database

1. In your Railway project dashboard, click **"+ New"**
2. Select **"Database"** → **"Add MongoDB"**
3. Railway will provision a MongoDB instance automatically

### Step 4: Configure Environment Variables

#### Backend Service Variables:
```
MONGODB_URL=mongodb://mongo.railway.internal:27017/product_tracking
ENVIRONMENT=production
```

#### Frontend Service Variables:
```
REACT_APP_API_URL=https://your-backend-url.railway.app
```

*Note: Replace `your-backend-url` with your actual backend Railway URL*

### Step 5: Custom Domains (Optional)

1. Go to your service settings
2. Click "Domains"
3. Add custom domain or use Railway's provided URLs

### Expected URLs After Deployment:
- **Frontend**: `https://your-app-name.railway.app`
- **Backend API**: `https://your-backend-name.railway.app`
- **Health Check**: `https://your-backend-name.railway.app/health`

### Troubleshooting

#### Common Issues:
1. **Build Failures**: Check Railway logs in the dashboard
2. **Database Connection**: Ensure MONGODB_URL is correct
3. **CORS Issues**: Update ALLOWED_ORIGINS in backend if needed

#### Useful Commands:
```bash
# Check Railway CLI status
railway status

# View logs
railway logs

# Connect to your project
railway link
```

### Cost Estimation:
- **Starter Plan**: $5/month in credits
- **Typical Usage**: ~$3-4/month for small apps
- **Free Trial**: Available for new users

### Automatic Deployments:
Once connected, every push to your `main` branch will automatically deploy to Railway! 🎉

### Support:
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: Create issues in your repository
