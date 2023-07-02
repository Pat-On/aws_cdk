exports.handler = async function(event) {
    console.log('request:', JSON.stringify(event, undefined, 2));

    return {
        statusCode: 200,
        headers: { "Content-type" : "text/plain "},
        body: `Hello from Product! You have hit ${event.path} \n`
    };  
};