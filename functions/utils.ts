import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
export const dynamoDb = DynamoDBDocumentClient.from(client);

export const TABLE_NAME = process.env.TABLE_NAME || '';

export interface ApiResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export function successResponse(data: any, statusCode: number = 200): ApiResponse {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    },
    body: JSON.stringify(data),
  };
}

export function errorResponse(message: string, statusCode: number = 500): ApiResponse {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    },
    body: JSON.stringify({ error: message }),
  };
}

export function validateProduct(data: any): string | null {
  if (!data.name || typeof data.name !== 'string') {
    return 'Name is required and must be a string';
  }
  if (!data.description || typeof data.description !== 'string') {
    return 'Description is required and must be a string';
  }
  if (data.price === undefined || typeof data.price !== 'number' || data.price < 0) {
    return 'Price is required and must be a non-negative number';
  }
  if (!data.category || typeof data.category !== 'string') {
    return 'Category is required and must be a string';
  }
  if (data.imageUrl && typeof data.imageUrl !== 'string') {
    return 'Image URL must be a string';
  }
  return null;
}
