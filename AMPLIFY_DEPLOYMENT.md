# AWS Amplify Deployment Guide

This guide will help you deploy CarterCare to AWS Amplify.

## Prerequisites

- AWS Account with access to Amplify Console
- GitHub repository already set up (✅ Done!)
- AWS services already configured (Cognito, DynamoDB, S3)

## Step 1: Open AWS Amplify Console

1. Go to the [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"New app"** → **"Host web app"**

## Step 2: Connect GitHub Repository

1. Select **GitHub** as your repository provider
2. Click **"Connect branch"**
3. Authorize AWS Amplify to access your GitHub account
4. Select repository: **henryoverbeeke/thecartercare**
5. Select branch: **main**
6. Click **"Next"**

## Step 3: Configure Build Settings

The build settings should be auto-detected from `amplify.yml`. Verify they look like this:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/dist
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```

### App Name
- Set your app name (e.g., "CarterCare")

### Environment Variables
You don't need to add environment variables since AWS config is in the code, but if you want to make it more secure later, you can add:

- `VITE_AWS_REGION`
- `VITE_USER_POOL_ID`
- `VITE_USER_POOL_CLIENT_ID`
- `VITE_IDENTITY_POOL_ID`
- `VITE_S3_BUCKET`

Click **"Next"**

## Step 4: Review and Deploy

1. Review all settings
2. Click **"Save and deploy"**
3. Wait for the deployment to complete (usually 3-5 minutes)

## Step 5: Access Your App

Once deployed, Amplify will provide you with a URL like:
```
https://main.d1234abcd.amplifyapp.com
```

## Step 6: Configure Custom Domain (Optional)

1. In the Amplify Console, go to **"Domain management"**
2. Click **"Add domain"**
3. Enter your custom domain (if you have one)
4. Follow the DNS configuration instructions

## Step 7: Enable Continuous Deployment

Continuous deployment is automatically enabled! Now whenever you push to the `main` branch on GitHub, Amplify will automatically rebuild and redeploy your app.

## Monitoring Your App

### View Build Logs
- Click on any deployment to view detailed build logs
- Check for errors in the preBuild, build, or deploy phases

### Set Up Notifications (Optional)
1. Go to **"Notifications"** in the Amplify Console
2. Add email notifications for build status
3. Get notified when builds succeed or fail

## Troubleshooting

### Build Fails
- Check build logs in the Amplify Console
- Verify `package.json` has all required dependencies
- Ensure Node.js version is compatible (Amplify uses Node 16 by default)

### App Loads But AWS Services Don't Work
- Verify your AWS Cognito, DynamoDB, and S3 are in the correct region
- Check that IAM roles have proper permissions
- Verify S3 CORS configuration allows requests from your Amplify domain

### Update CORS for Your Amplify Domain
After deployment, update your S3 CORS configuration to include your Amplify domain:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": [
        "http://localhost:5173",
        "https://main.d1234abcd.amplifyapp.com"
      ],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

Apply with:
```bash
aws s3api put-bucket-cors --bucket cartercare-progress-photos-584973764297 --cors-configuration file://s3-cors.json
```

## Updating Your App

To deploy updates:
```bash
git add .
git commit -m "Your update message"
git push origin main
```

Amplify will automatically detect the push and deploy your changes!

## Cost Optimization

- Amplify Free Tier includes:
  - 1000 build minutes per month
  - 15 GB served per month
  - 5 GB stored per month

- After free tier, costs are minimal for small apps

## Need Help?

Check the [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/) for more information.
