import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';

interface ApiStackProps extends cdk.StackProps {
  productsTable: dynamodb.Table;
}

export class ApiStack extends cdk.Stack {
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const createProductFn = new NodejsFunction(this, 'CreateProductFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'createProduct',
      entry: path.join(__dirname, '../functions/products.ts'),
      environment: {
        TABLE_NAME: props.productsTable.tableName,
      },
      bundling: {
        externalModules: ['@aws-sdk/*'],
      },
    });

    const getProductFn = new NodejsFunction(this, 'GetProductFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'getProduct',
      entry: path.join(__dirname, '../functions/products.ts'),
      environment: {
        TABLE_NAME: props.productsTable.tableName,
      },
      bundling: {
        externalModules: ['@aws-sdk/*'],
      },
    });

    const listProductsFn = new NodejsFunction(this, 'ListProductsFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'listProducts',
      entry: path.join(__dirname, '../functions/products.ts'),
      environment: {
        TABLE_NAME: props.productsTable.tableName,
      },
      bundling: {
        externalModules: ['@aws-sdk/*'],
      },
    });

    const updateProductFn = new NodejsFunction(this, 'UpdateProductFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'updateProduct',
      entry: path.join(__dirname, '../functions/products.ts'),
      environment: {
        TABLE_NAME: props.productsTable.tableName,
      },
      bundling: {
        externalModules: ['@aws-sdk/*'],
      },
    });

    const deleteProductFn = new NodejsFunction(this, 'DeleteProductFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'deleteProduct',
      entry: path.join(__dirname, '../functions/products.ts'),
      environment: {
        TABLE_NAME: props.productsTable.tableName,
      },
      bundling: {
        externalModules: ['@aws-sdk/*'],
      },
    });

    props.productsTable.grantReadWriteData(createProductFn);
    props.productsTable.grantReadData(getProductFn);
    props.productsTable.grantReadData(listProductsFn);
    props.productsTable.grantReadWriteData(updateProductFn);
    props.productsTable.grantReadWriteData(deleteProductFn);

    const api = new apigateway.RestApi(this, 'ProductsApi', {
      restApiName: 'Products Service',
      description: 'API for managing products',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
    });

    const products = api.root.addResource('products');
    products.addMethod('POST', new apigateway.LambdaIntegration(createProductFn));
    products.addMethod('GET', new apigateway.LambdaIntegration(listProductsFn));

    const product = products.addResource('{id}');
    product.addMethod('GET', new apigateway.LambdaIntegration(getProductFn));
    product.addMethod('PUT', new apigateway.LambdaIntegration(updateProductFn));
    product.addMethod('DELETE', new apigateway.LambdaIntegration(deleteProductFn));

    this.apiUrl = api.url;

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
      exportName: 'ProductsApiUrl',
    });
  }
}
