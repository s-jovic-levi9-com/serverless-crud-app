import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutCommand, GetCommand, ScanCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { dynamoDb, TABLE_NAME, successResponse, errorResponse, validateProduct } from './utils';
import { Product, CreateProductInput, UpdateProductInput } from '../types';

export async function createProduct(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      return errorResponse('Request body is required', 400);
    }

    const input: CreateProductInput = JSON.parse(event.body);
    
    const validationError = validateProduct(input);
    if (validationError) {
      return errorResponse(validationError, 400);
    }

    const now = new Date().toISOString();
    const product: Product = {
      id: uuidv4(),
      name: input.name,
      description: input.description,
      price: input.price,
      category: input.category,
      imageUrl: input.imageUrl,
      createdAt: now,
      updatedAt: now,
    };

    await dynamoDb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: product,
      })
    );

    return successResponse(product, 201);
  } catch (error) {
    console.error('Error creating product:', error);
    return errorResponse('Failed to create product', 500);
  }
}

export async function getProduct(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const id = event.pathParameters?.id;
    if (!id) {
      return errorResponse('Product ID is required', 400);
    }

    const result = await dynamoDb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id },
      })
    );

    if (!result.Item) {
      return errorResponse('Product not found', 404);
    }

    return successResponse(result.Item);
  } catch (error) {
    console.error('Error getting product:', error);
    return errorResponse('Failed to get product', 500);
  }
}

export async function listProducts(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const limit = event.queryStringParameters?.limit 
      ? parseInt(event.queryStringParameters.limit) 
      : 50;
    
    const lastKey = event.queryStringParameters?.lastKey 
      ? JSON.parse(decodeURIComponent(event.queryStringParameters.lastKey))
      : undefined;

    const result = await dynamoDb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        Limit: limit,
        ExclusiveStartKey: lastKey,
      })
    );

    const response = {
      products: result.Items || [],
      lastKey: result.LastEvaluatedKey 
        ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey))
        : undefined,
    };

    return successResponse(response);
  } catch (error) {
    console.error('Error listing products:', error);
    return errorResponse('Failed to list products', 500);
  }
}

export async function updateProduct(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const id = event.pathParameters?.id;
    if (!id) {
      return errorResponse('Product ID is required', 400);
    }

    if (!event.body) {
      return errorResponse('Request body is required', 400);
    }

    const input: UpdateProductInput = JSON.parse(event.body);
    
    const existingProduct = await dynamoDb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id },
      })
    );

    if (!existingProduct.Item) {
      return errorResponse('Product not found', 404);
    }

    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (input.name !== undefined) {
      updateExpressions.push('#name = :name');
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':name'] = input.name;
    }

    if (input.description !== undefined) {
      updateExpressions.push('#description = :description');
      expressionAttributeNames['#description'] = 'description';
      expressionAttributeValues[':description'] = input.description;
    }

    if (input.price !== undefined) {
      if (input.price < 0) {
        return errorResponse('Price must be non-negative', 400);
      }
      updateExpressions.push('#price = :price');
      expressionAttributeNames['#price'] = 'price';
      expressionAttributeValues[':price'] = input.price;
    }

    if (input.category !== undefined) {
      updateExpressions.push('#category = :category');
      expressionAttributeNames['#category'] = 'category';
      expressionAttributeValues[':category'] = input.category;
    }

    if (input.imageUrl !== undefined) {
      updateExpressions.push('#imageUrl = :imageUrl');
      expressionAttributeNames['#imageUrl'] = 'imageUrl';
      expressionAttributeValues[':imageUrl'] = input.imageUrl;
    }

    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    if (updateExpressions.length === 1) {
      return errorResponse('No fields to update', 400);
    }

    const result = await dynamoDb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      })
    );

    return successResponse(result.Attributes);
  } catch (error) {
    console.error('Error updating product:', error);
    return errorResponse('Failed to update product', 500);
  }
}

export async function deleteProduct(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const id = event.pathParameters?.id;
    if (!id) {
      return errorResponse('Product ID is required', 400);
    }

    const existingProduct = await dynamoDb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id },
      })
    );

    if (!existingProduct.Item) {
      return errorResponse('Product not found', 404);
    }

    await dynamoDb.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id },
      })
    );

    return successResponse({ message: 'Product deleted successfully' }, 204);
  } catch (error) {
    console.error('Error deleting product:', error);
    return errorResponse('Failed to delete product', 500);
  }
}
