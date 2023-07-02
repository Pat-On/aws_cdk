import * as cdk from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
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
    const fn = new Function(this, "MyFunction", {
      runtime: Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: Code.fromAsset(path.join(__dirname, 'lambda-handler'))
    })

  }
}
