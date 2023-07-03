// ES 5 Way of importing
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { ddbClient } = require("./ddbClient");
const { GetItemCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");

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