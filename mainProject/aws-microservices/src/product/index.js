exports.handler = async function(event) {
    console.log('request:', JSON.stringify(event, undefined, 2));

    // TODO - Switch case event.httpmethod to perform CRUD

    




    return {
        statusCode: 200,
        headers: { "Content-type" : "text/plain "},
        body: `Hello from Product! You have hit ${event.path} \n`
    };  
};