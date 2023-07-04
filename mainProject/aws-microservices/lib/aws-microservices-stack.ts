import * as cdk from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from "path";


// OUR MAIN CLASS
export class AwsMicroservicesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // DynamoDB
    const productTable = new Table(this, 'product', {
      partitionKey: {
        name: "id",
        type: AttributeType.STRING
      },
      tableName: "product",
      // We need to set-up it while studying :>
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      // Pay as you go
      billingMode: BillingMode.PAY_PER_REQUEST
    })


    // Lambda Function
    // const fn = new Function(this, "MyFunction", {
    //   runtime: Runtime.NODEJS_18_X,
    //   handler: "index.handler",
    //   code: Code.fromAsset(path.join(__dirname, 'lambda-handler'))
    // })

    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: [
          'aws-sdk',
        ]
      },
      // injecting variables like in the docker
      environment: {
        PRIMARY_KEY: 'id',
        DYNAMODB_TABLE_NAME: productTable.tableName
      },
      runtime: Runtime.NODEJS_18_X,
      // you can specify entry here too
    };


    const productFunction = new NodejsFunction(this, "productLambdaFunction", {
      entry: path.join(__dirname, '/../src/product/index.js'),
      ...nodeJsFunctionProps
    });

    // grant permissions to the DynamoDB to the Lambda Function
    productTable.grantReadWriteData(productFunction);

    // Product microservice api gateway
    // root name = product

    // product
    // GET /product
    // POST /product

    // single product with id parameter
    // GET /product/{id}
    // PUT /product/{id}
    // DELETE /product/{id}

    const apigw = new LambdaRestApi(this, 'productApi', {
      restApiName: "Product Service",
      handler: productFunction,
      proxy: false
    });

    const product = apigw.root.addResource('product');
    product.addMethod("GET");
    product.addMethod("POST");
    
    const singleProduct = product.addResource('{id}') // product/id
    singleProduct.addMethod('GET')
    singleProduct.addMethod('PUT')
    singleProduct.addMethod('DELETE')
  }
}
