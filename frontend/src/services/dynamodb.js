import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { awsConfig } from '../config/aws-config';

let docClient = null;

export const initDynamoDB = (credentials) => {
  const client = new DynamoDBClient({
    region: awsConfig.region,
    credentials: credentials,
  });
  docClient = DynamoDBDocumentClient.from(client);
};

// Workout operations
export const addWorkout = async (userId, workout) => {
  const command = new PutCommand({
    TableName: awsConfig.dynamoTables.workouts,
    Item: {
      userId,
      workoutId: workout.workoutId,
      type: workout.type,
      name: workout.name,
      duration: workout.duration,
      calories: workout.calories,
      exercises: workout.exercises || [],
      notes: workout.notes || '',
      date: workout.date,
      createdAt: new Date().toISOString(),
    },
  });
  return docClient.send(command);
};

export const getWorkouts = async (userId) => {
  const command = new QueryCommand({
    TableName: awsConfig.dynamoTables.workouts,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
    ScanIndexForward: false,
  });
  const response = await docClient.send(command);
  return response.Items || [];
};

export const deleteWorkout = async (userId, workoutId) => {
  const command = new DeleteCommand({
    TableName: awsConfig.dynamoTables.workouts,
    Key: { userId, workoutId },
  });
  return docClient.send(command);
};

// Meal operations
export const addMeal = async (userId, meal) => {
  const command = new PutCommand({
    TableName: awsConfig.dynamoTables.meals,
    Item: {
      userId,
      mealId: meal.mealId,
      name: meal.name,
      type: meal.type,
      calories: meal.calories,
      protein: meal.protein || 0,
      carbs: meal.carbs || 0,
      fat: meal.fat || 0,
      date: meal.date,
      notes: meal.notes || '',
      createdAt: new Date().toISOString(),
    },
  });
  return docClient.send(command);
};

export const getMeals = async (userId) => {
  const command = new QueryCommand({
    TableName: awsConfig.dynamoTables.meals,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
    ScanIndexForward: false,
  });
  const response = await docClient.send(command);
  return response.Items || [];
};

export const deleteMeal = async (userId, mealId) => {
  const command = new DeleteCommand({
    TableName: awsConfig.dynamoTables.meals,
    Key: { userId, mealId },
  });
  return docClient.send(command);
};

// Progress photo operations
export const addProgress = async (userId, progress) => {
  const command = new PutCommand({
    TableName: awsConfig.dynamoTables.progress,
    Item: {
      userId,
      progressId: progress.progressId,
      photoUrl: progress.photoUrl,
      weight: progress.weight || null,
      bodyFat: progress.bodyFat || null,
      measurements: progress.measurements || {},
      notes: progress.notes || '',
      date: progress.date,
      createdAt: new Date().toISOString(),
    },
  });
  return docClient.send(command);
};

export const getProgress = async (userId) => {
  const command = new QueryCommand({
    TableName: awsConfig.dynamoTables.progress,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
    ScanIndexForward: false,
  });
  const response = await docClient.send(command);
  return response.Items || [];
};

export const deleteProgress = async (userId, progressId) => {
  const command = new DeleteCommand({
    TableName: awsConfig.dynamoTables.progress,
    Key: { userId, progressId },
  });
  return docClient.send(command);
};
