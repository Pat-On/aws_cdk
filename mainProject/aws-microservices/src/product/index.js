// ES 5 Way of importing
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { ddbClient } = require("./ddbClient");
const { GetItemCommand, ScanCommand, PutItemCommand, DeleteItemCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");

// ES 6
import { v4 as uuidv4 } from 'uuid';

exports.handler = async function (event) {
    console.log("request:", JSON.stringify(event, undefined, 2));
    let body;
    // TODO - Switch case event.httpMethod to perform CRUD
    try {
        switch (event.httpMethod) {
            case "GET":
                if (event.queryStringParameters != null) {
                    body = await getProductsByCategory(event); // GET product/1234?category=Phone
                }
                else if (event.pathParameters != null) {
                    body = await getProduct(event.pathParameters.id); // GET product/{id}
                    
                } else {
                    body = await getAllProducts(); // GET product
                }
                break;
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
            default:
                throw new Error(`Unsupported route: "${event.httpMethod}"`);
        }

        console.log(body);
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: `Successfully finished operation: "${event.httpMethod}"`,
            body: body
          })
        };

    } catch (e) {
        console.error(e);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Failed to perform operation.",
                errorMsg: e.message,
                errorStack: e.stack,
            })
        };
    }
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
        TableName: process.env.DYNAMODB_TABLE_NAME
      };
  
      const { Items } = await ddbClient.send(new ScanCommand(params));
  
      console.log(Items);
      return (Items) ? Items.map((item) => unmarshall(item)) : {};
  
    } catch(e) {
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
        const getProductsByCategory = async (event) => {
            console.log("getProductsByCategory");
            try {
                // GET product/1234?category=Phone
                const productId = event.pathParameters.id;
                const category = event.queryStringParameters.category;

                const params = {
                    KeyConditionExpression: "id = :productId",
                    FilterExpression: "contains (category, :category)",
                    ExpressionAttributeValues: {
                        ":productId": { S: productId },
                        ":category": { S: category }
                    },
                    TableName: process.env.DYNAMODB_TABLE_NAME
                };

                const { Items } = await ddbClient.send(new QueryCommand(params));

                console.log(Items);
                return Items.map((item) => unmarshall(item));
            } catch (e) {
                console.error(e);
                throw e;
            }
        }
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
    } catch (e) {
        console.error(e);
        throw e;
    }
}

const getProductsByCategory = async (event) => {
    console.log("getProductsByCategory");
    try {
        // GET product/1234?category=Phone
        const productId = event.pathParameters.id;
        const category = event.queryStringParameters.category;

        const params = {
            KeyConditionExpression: "id = :productId",
            FilterExpression: "contains (category, :category)",
            ExpressionAttributeValues: {
                ":productId": { S: productId },
                ":category": { S: category }
            },
            TableName: process.env.DYNAMODB_TABLE_NAME
        };

        const { Items } = await ddbClient.send(new QueryCommand(params));

        console.log(Items);
        return Items.map((item) => unmarshall(item));
    } catch (e) {
        console.error(e);
        throw e;
    }
}