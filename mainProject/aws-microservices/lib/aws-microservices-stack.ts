import * as cdk from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from "path";
import { SwnDatabase } from './database';
import { SwnMicroservices } from './microservice';
import { SwnApiGateway } from './apigateway';


// OUR MAIN CLASS
export class AwsMicroservicesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const database = new SwnDatabase(this, "Database");
    // The code that defines your stack goes here

    // DynamoDB
    // const productTable = new Table(this, 'product', {
    //   partitionKey: {
    //     name: "id",
    //     type: AttributeType.STRING
    //   },
    //   tableName: "product",
    //   // We need to set-up it while studying :>
    //   removalPolicy: cdk.RemovalPolicy.DESTROY,
    //   // Pay as you go
    //   billingMode: BillingMode.PAY_PER_REQUEST
    // })


    // Lambda Function
    // const fn = new Function(this, "MyFunction", {
    //   runtime: Runtime.NODEJS_18_X,
    //   handler: "index.handler",
    //   code: Code.fromAsset(path.join(__dirname, 'lambda-handler'))
    // })

    const microservices = new SwnMicroservices(this, 'Microservices', {
      productTable: database.productTable,
      basketTable: database.basketTable
    });

    const apigateway = new SwnApiGateway(this, 'ApiGateway', {
      productMicroservice: microservices.productMicroservice,
      basketMicroservice: microservices.basketMicroservice
    });   



  }
}
