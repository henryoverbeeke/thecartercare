import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { awsConfig } from '../config/aws-config';

let docClient = null;

export const initAdminDB = (credentials) => {
  const client = new DynamoDBClient({
    region: awsConfig.region,
    credentials: credentials,
  });
  docClient = DynamoDBDocumentClient.from(client);
};

// User operations
export const saveUser = async (userData) => {
  const command = new PutCommand({
    TableName: awsConfig.dynamoTables.users,
    Item: {
      email: userData.email,
      cognitoId: userData.cognitoId,
      name: userData.name || '',
      isDisabled: userData.isDisabled || false,
      createdAt: userData.createdAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    },
  });
  return docClient.send(command);
};

export const getUser = async (email) => {
  const command = new GetCommand({
    TableName: awsConfig.dynamoTables.users,
    Key: { email },
  });
  const response = await docClient.send(command);
  return response.Item || null;
};

export const getAllUsers = async () => {
  const command = new ScanCommand({
    TableName: awsConfig.dynamoTables.users,
  });
  const response = await docClient.send(command);
  return response.Items || [];
};

export const updateUserDisabledStatus = async (email, isDisabled) => {
  const command = new UpdateCommand({
    TableName: awsConfig.dynamoTables.users,
    Key: { email },
    UpdateExpression: 'SET isDisabled = :isDisabled, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':isDisabled': isDisabled,
      ':updatedAt': new Date().toISOString(),
    },
    ReturnValues: 'ALL_NEW',
  });
  const response = await docClient.send(command);
  return response.Attributes;
};

// Platform operations
export const getPlatformLockdown = async () => {
  const command = new GetCommand({
    TableName: awsConfig.dynamoTables.platform,
    Key: { settingId: 'lockdown' },
  });
  const response = await docClient.send(command);
  return response.Item || { settingId: 'lockdown', enabled: false };
};

export const setPlatformLockdown = async (enabled, updatedBy) => {
  const command = new PutCommand({
    TableName: awsConfig.dynamoTables.platform,
    Item: {
      settingId: 'lockdown',
      enabled: enabled,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy,
    },
  });
  return docClient.send(command);
};

// Stats operations for admin dashboard
export const getUserStats = async (userId, credentials) => {
  // Import dynamodb functions
  const { getWorkouts, getMeals, getProgress } = await import('./dynamodb');

  const [workouts, meals, progress] = await Promise.all([
    getWorkouts(userId),
    getMeals(userId),
    getProgress(userId),
  ]);

  const totalCaloriesBurned = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
  const totalCaloriesConsumed = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalWorkoutMinutes = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);

  return {
    workoutCount: workouts.length,
    mealCount: meals.length,
    progressCount: progress.length,
    totalCaloriesBurned,
    totalCaloriesConsumed,
    totalWorkoutMinutes,
    // Return data without photos for privacy
    workouts,
    meals,
    progress: progress.map(p => ({
      ...p,
      photoUrl: null, // Hide photo URLs for privacy
    })),
  };
};

// Get aggregate platform stats
export const getPlatformStats = async () => {
  const users = await getAllUsers();
  const activeUsers = users.filter(u => !u.isDisabled);

  return {
    totalUsers: users.length,
    activeUsers: activeUsers.length,
    disabledUsers: users.length - activeUsers.length,
  };
};
