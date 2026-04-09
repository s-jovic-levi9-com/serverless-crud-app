#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DatabaseStack } from '../lib/database-stack';
import { ApiStack } from '../lib/api-stack';
import { FrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();

const databaseStack = new DatabaseStack(app, 'ProductsDatabase', {
  description: 'DynamoDB table for products',
});

const apiStack = new ApiStack(app, 'ProductsApi', {
  productsTable: databaseStack.productsTable,
  description: 'API Gateway and Lambda functions for products',
});
apiStack.addDependency(databaseStack);

const frontendStack = new FrontendStack(app, 'ProductsFrontend', {
  apiUrl: apiStack.apiUrl,
  description: 'S3 and CloudFront for frontend hosting',
});
frontendStack.addDependency(apiStack);
