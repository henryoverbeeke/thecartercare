export const awsConfig = {
  region: 'us-east-2',
  userPoolId: 'us-east-2_JUAxxs3Kb',
  userPoolWebClientId: '5cta5s9nt88tt5rf5t9366gfgs',
  identityPoolId: 'us-east-2:66c889ff-1e2e-4d08-941a-3868c962db17',
  s3Bucket: 'cartercare-progress-photos-584973764297',
  dynamoTables: {
    workouts: 'CarterCare_Workouts',
    meals: 'CarterCare_Meals',
    progress: 'CarterCare_Progress',
    users: 'CarterCare_Users',
    platform: 'CarterCare_Platform'
  }
};

// Admin configuration
export const adminConfig = {
  // Users with admin access (can view all users, stats, view-as-user)
  adminEmails: [
    'henryoverbeeke@gmail.com',
    'sarahcarter@gmail.com',
    'claireoverbeeke@gmail.com'
  ],
  // Super admins (can disable users, platform lockdown, password changes)
  superAdminEmails: [
    'henryoverbeeke@gmail.com',
    'claireoverbeeke@gmail.com'
  ]
};
