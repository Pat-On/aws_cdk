import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Bucket } from 'aws-cdk-lib/aws-s3';

export class HelloCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // Level 2 construct developed by CDK team with roles etc
    // constructor(scope: Construct, id: string, props?: QueueProps);
    const queue = new Queue(this, "HelloCdkQueue", {
      visibilityTimeout: cdk.Duration.seconds(300)
    })

    // Adding S3 Bucket - level 2 construct
    const newBucker = new Bucket(this, "MyFirstBucker", {
      versioned: true,
      // not recommended for production :>
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    })

    // example resource
    // const queue = new sqs.Queue(this, 'HelloCdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }

}
