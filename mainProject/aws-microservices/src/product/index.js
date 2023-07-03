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
