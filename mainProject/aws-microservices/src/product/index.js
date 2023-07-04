// ES 5 Way of importing
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { ddbClient } = require("./ddbClient");
const { GetItemCommand, ScanCommand, PutItemCommand, DeleteItemCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");

// ES 6
import { v4 as uuidv4 } from 'uuid';

exports.handler = async function (event) {
    console.log("request:", JSON.stringify(event, undefined, 2));

    // TODO - Switch case event.httpmethod to perform CRUD

    switch (event.httpMethod) {
        case "GET":
            if (event.pathParameters != null) {
                body = await getProduct(event.pathParameters.id);
            } else {
                body = await getAllProducts();
            }
        case "POST":
            // demo - no sanitization
            body = await createProduct(event);
            break;
        case "DELETE":
            body = await deleteProduct(event.pathParameters.id);
            break;
        case "UPDATE":
            body = await updateProduct(event);
            break;
    }

    return {
        statusCode: 200,
        headers: { "Content-type": "text/plain " },
        body: `Hello from Product! You have hit ${event.path} \n`,
    };
};


const getProduct = async (productId) => {
    console.log("getProduct");

    try {

        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            // marshal is covering for ass providing types
            Key: marshall({ id: productId })
        };

        const { Item } = await ddbClient.send(new GetItemCommand(params));

        console.log(Item);
        return (Item) ? unmarshall(Item) : {};

    } catch (e) {
        console.error(e);
        throw e;
    }
}

const getAllProducts = async () => {
    console.log("getAllProducts");

    try {
        const params = {
            // this env is coming from aws-microservices-stack.ts
            TableName: process.env.DYNAMODB_TABLE_NAME,
        };

        const { Item } = await ddbClient.send(new ScanCommand(params));

        console.log(Item);
        return (Item) ? unmarshall(Item) : {};

    } catch (e) {
        console.error(e);
        throw e;
    }
}

const createProduct = async (event) => {
    console.log(`createProduct function. event : "${event}"`);
    try {
        const productRequest = JSON.parse(event.body);

        const productId = uuidv4();
        productRequest.id = productId;

        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            // marshal is covering for ass providing types
            Key: marshall(productRequest || {})
        };

        // replacing entire object or creating the new one
        const createdResult = await ddbClient.send(new PutItemCommand(params));
        console.log(createdResult);
        return createdResult;

    } catch (e) {
        console.log(e);
        throw e;
    }
}

const deleteProduct = async (productId) => {
    console.log(`deleteProduct function productId ${productId}`);

    try {

        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ id: productId })
        }

        const deleteProduct = await ddbClient.send(new DeleteItemCommand(params));

        console.log(deleteProduct);
        return deleteProduct;


    } catch (e) {
        console.error(e);
        throw e;
    }

}

const updateProduct = async (event) => {
    console.log(`updateProduct function. event : "${event}"`);
    try {
      const requestBody = JSON.parse(event.body);
      const objKeys = Object.keys(requestBody);
      console.log(`updateProduct function. requestBody : "${requestBody}", objKeys: "${objKeys}"`);    
  
      const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: marshall({ id: event.pathParameters.id }),
        UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
        ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
            ...acc,
            [`#key${index}`]: key,
        }), {}),
        ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
            ...acc,
            [`:value${index}`]: requestBody[key],
        }), {})),
      };
  
      const updateResult = await ddbClient.send(new UpdateItemCommand(params));
  
      console.log(updateResult);
      return updateResult;
    } catch(e) {
      console.error(e);
      throw e;
    }
  }