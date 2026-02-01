# CarterCare - Fitness Tracking App

A modern, retro-styled fitness tracking application built with React, AWS DynamoDB, and S3.

## Features

- 🏋️ **Workouts** - Log and track your workouts
- 🍽️ **Nutrition** - Track meals and macros
- 📸 **Progress** - Upload progress photos and track body measurements
- 📊 **Dashboard** - View your fitness journey at a glance

## Tech Stack

### Frontend
- **React** with Vite
- **Framer Motion** for animations
- **Lucide React** for icons
- **React Dropzone** for file uploads
- **Date-fns** for date formatting

### Backend (AWS)
- **Amazon Cognito** - User authentication
- **DynamoDB** - NoSQL database for workouts, meals, and progress
- **S3** - Secure photo storage with signed URLs
- **IAM** - Identity and access management

## Getting Started

### Prerequisites
- Node.js (v16+)
- AWS Account
- AWS CLI configured

### Installation

1. Clone the repository:
```bash
git clone https://github.com/henryoverbeeke/thecartercare.git
cd thecartercare
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Configure AWS credentials in `frontend/src/config/aws-config.js`

4. Run the development server:
```bash
npm run dev
```

## Project Structure

```
CarterCareDynamoDB/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── contexts/     # React contexts (Auth)
│   │   ├── pages/        # Main app pages
│   │   ├── services/     # AWS service integrations
│   │   ├── styles/       # CSS styling
│   │   └── config/       # AWS configuration
│   └── package.json
├── lambda/               # AWS Lambda functions
│   └── auto-confirm/    # Auto-confirm Cognito users
└── README.md
```

## AWS Setup

### Required Services
1. **Cognito User Pool** - For user authentication
2. **Cognito Identity Pool** - For temporary AWS credentials
3. **DynamoDB Tables**:
   - `CarterCare_Workouts`
   - `CarterCare_Meals`
   - `CarterCare_Progress`
4. **S3 Bucket** - For progress photos (private with signed URLs)

### Lambda Functions
- `auto-confirm` - Automatically confirms new Cognito users

## Features in Detail

### Progress Photos
- Upload photos in JPG, PNG, WebP, GIF, HEIC, BMP, TIFF, SVG
- Max file size: 10MB
- Secure storage with AWS S3 signed URLs
- Track body measurements and weight changes

### Workouts
- Log exercises with sets, reps, and weight
- Track workout duration
- View workout history

### Nutrition
- Log meals with macros (protein, carbs, fats, calories)
- Track daily nutrition goals
- Search and log meals quickly

## Security

- All photos are stored in a private S3 bucket
- Temporary signed URLs (1-hour expiration) for secure photo access
- AWS Cognito for secure authentication
- IAM roles with least-privilege access

## Deployment

### AWS Amplify
This app is configured for deployment on AWS Amplify:

1. Connect your GitHub repository to AWS Amplify
2. Configure build settings (see `amplify.yml`)
3. Deploy!

## License

MIT

## Author

Henry Overbeeke
