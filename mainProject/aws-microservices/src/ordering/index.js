exports.handler = async function (event) {
  return {
    statusCode: 200, 
    headers: { "Content-Type": "text/plain"},
    body: `Hello from Ordering ! You have hit ${event.path}\n`
  }
}