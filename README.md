# Serverless CRUD Application

A full-stack serverless application for managing products, built with AWS CDK, Lambda, DynamoDB, API Gateway, React, S3, and CloudFront.

## Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ├──────────────────┐
       │                  │
       v                  v
┌─────────────┐    ┌──────────────┐
│ CloudFront  │    │ API Gateway  │
└──────┬──────┘    └──────┬───────┘
       │                  │
       v                  v
┌─────────────┐    ┌──────────────┐
│  S3 Bucket  │    │   Lambda     │
│   (React)   │    │  Functions   │
└─────────────┘    └──────┬───────┘
                          │
                          v
                   ┌──────────────┐
                   │  DynamoDB    │
                   │    Table     │
                   └──────────────┘
```

## Features

- **Create** new products with name, description, price, category, and optional image
- **Read** individual products or list all products
- **Update** existing product information
- **Delete** products
- **Responsive UI** with modern design
- **Serverless architecture** with automatic scaling
- **Pay-per-use pricing** with AWS free tier support

## Tech Stack

### Backend
- **AWS CDK** - Infrastructure as Code
- **AWS Lambda** - Serverless compute
- **API Gateway** - REST API endpoints
- **DynamoDB** - NoSQL database
- **TypeScript** - Type-safe backend code

### Frontend
- **React** - UI library
- **TypeScript** - Type-safe frontend code
- **S3** - Static website hosting
- **CloudFront** - CDN for global distribution

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or later)
- **npm** (v9 or later)
- **AWS CLI** configured with credentials
- **AWS CDK CLI** (`npm install -g aws-cdk`)
- **AWS Account** with appropriate permissions

### AWS Permissions Required

Your AWS user/role needs permissions for:
- CloudFormation
- Lambda
- API Gateway
- DynamoDB
- S3
- CloudFront
- IAM (for creating roles)

## Project Structure

```
serverless-crud-app/
├── bin/
│   └── app.ts              # CDK app entry point
├── lib/
│   ├── database-stack.ts   # DynamoDB table
│   ├── api-stack.ts        # API Gateway + Lambda
│   └── frontend-stack.ts   # S3 + CloudFront
├── functions/
│   ├── products.ts         # Lambda handlers
│   └── utils.ts            # Shared utilities
├── types/
│   └── index.ts            # Shared TypeScript types
├── web/
│   ├── components/         # React components
│   ├── App.tsx             # Main React component
│   ├── App.css             # Styles
│   ├── api.ts              # API client
│   └── index.tsx           # React entry point
├── package.json
├── tsconfig.json
├── cdk.json
└── README.md
```

## Getting Started

### 1. Install Dependencies

```bash
cd src/serverless-crud-app
npm install
```

### 2. Configure AWS Credentials

Ensure your AWS CLI is configured:

```bash
aws configure
```

Or set environment variables:

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

### 3. Bootstrap CDK (First Time Only)

If you haven't used CDK in your AWS account/region before:

```bash
cdk bootstrap
```

### 4. Build and Deploy

```bash
# Build the web application
npm run build:web

# Deploy all stacks
npm run deploy
```

This will deploy three CloudFormation stacks:
1. **ProductsDatabase** - DynamoDB table
2. **ProductsApi** - API Gateway and Lambda functions
3. **ProductsFrontend** - S3 bucket and CloudFront distribution

### 5. Access Your Application

After deployment completes, CDK will output the CloudFront URL:

```
ProductsFrontend.DistributionUrl = https://d1234567890.cloudfront.net
```

Open this URL in your browser to use the application.

## API Endpoints

The API Gateway provides the following endpoints:

### Create Product
```http
POST /products
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "price": 29.99,
  "category": "Electronics",
  "imageUrl": "https://example.com/image.jpg"
}
```

### List Products
```http
GET /products?limit=50&lastKey=encodedKey
```

### Get Product
```http
GET /products/{id}
```

### Update Product
```http
PUT /products/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 39.99
}
```

### Delete Product
```http
DELETE /products/{id}
```

## Product Schema

```typescript
{
  id: string;           // UUID (auto-generated)
  name: string;         // Product name
  description: string;  // Product description
  price: number;        // Price (non-negative)
  category: string;     // Product category
  imageUrl?: string;    // Optional image URL
  createdAt: string;    // ISO timestamp
  updatedAt: string;    // ISO timestamp
}
```

## Development

### Build TypeScript

```bash
npm run build
```

### Build Web Application

```bash
npm run build:web
```

### Synthesize CloudFormation Templates

```bash
npm run cdk:synth
```

### Deploy Changes

```bash
npm run deploy
```

## Local Development

For local development, you can:

1. **Test Lambda functions locally** using AWS SAM:
   ```bash
   sam local start-api
   ```

2. **Run React app locally** (requires API endpoint):
   - Update `web/api.ts` to point to your deployed API or local endpoint
   - Use a development server like Vite or webpack-dev-server

## Cleanup

To avoid ongoing AWS charges, destroy all resources:

```bash
npm run cdk:destroy
```

This will delete:
- CloudFront distribution
- S3 bucket and contents
- API Gateway
- Lambda functions
- DynamoDB table and data

**Warning:** This action is irreversible and will delete all your data.

## Cost Estimation

With AWS Free Tier:
- **DynamoDB**: 25 GB storage, 25 WCU, 25 RCU (free)
- **Lambda**: 1M requests/month, 400,000 GB-seconds compute (free)
- **API Gateway**: 1M requests/month (free for 12 months)
- **S3**: 5 GB storage, 20,000 GET requests (free for 12 months)
- **CloudFront**: 1 TB data transfer out (free for 12 months)

After free tier, estimated costs for low-traffic app: **$1-5/month**

## Troubleshooting

### Deployment Fails

1. **Check AWS credentials**: `aws sts get-caller-identity`
2. **Check CDK bootstrap**: `cdk bootstrap`
3. **Check CloudFormation console** for detailed error messages

### CORS Errors

- Ensure API Gateway CORS is properly configured in `lib/api-stack.ts`
- Check browser console for specific CORS error details

### Lambda Function Errors

- Check CloudWatch Logs for Lambda execution errors
- Verify DynamoDB table name environment variable
- Ensure Lambda has proper IAM permissions

### Frontend Not Loading

- Check CloudFront distribution status (may take 10-15 minutes to deploy)
- Verify S3 bucket has `config.json` with correct API URL
- Check browser console for JavaScript errors

### API Returns 500 Errors

- Check Lambda CloudWatch Logs
- Verify DynamoDB table exists and is accessible
- Check IAM permissions for Lambda execution role

## Configuration

### Change AWS Region

Edit `bin/app.ts` and add `env` to stack props:

```typescript
const databaseStack = new DatabaseStack(app, 'ProductsDatabase', {
  env: { region: 'us-west-2', account: process.env.CDK_DEFAULT_ACCOUNT },
});
```

### Change Table Name

Edit `lib/database-stack.ts`:

```typescript
tableName: 'MyCustomTableName',
```

### Customize CORS Origins

Edit `lib/api-stack.ts`:

```typescript
allowOrigins: ['https://yourdomain.com'],
```

## Security Considerations

This is a demo application. For production use:

1. **Add authentication** (AWS Cognito, API Keys, or IAM)
2. **Implement rate limiting** on API Gateway
3. **Add input validation** and sanitization
4. **Enable AWS WAF** for CloudFront
5. **Use custom domain** with SSL certificate
6. **Enable CloudTrail** for audit logging
7. **Implement backup strategy** for DynamoDB
8. **Add monitoring and alarms** with CloudWatch

## Future Enhancements

- [ ] Add authentication with AWS Cognito
- [ ] Implement search and filtering
- [ ] Add pagination for large product lists
- [ ] Support image upload to S3
- [ ] Add product categories management
- [ ] Implement caching with CloudFront
- [ ] Add unit and integration tests
- [ ] Set up CI/CD pipeline
- [ ] Add monitoring dashboard

## License

MIT

## Support

For issues or questions:
- Check AWS CloudWatch Logs
- Review CDK documentation: https://docs.aws.amazon.com/cdk/
- Check AWS service status: https://status.aws.amazon.com/

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Built with AWS CDK and React**
