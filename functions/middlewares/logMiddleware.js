function log(request) {
    console.log(`Request: ${request.method} - ${request.path}`);
    if (Object.keys(request.params).length > 0) {
        console.log(`Parameters: ${JSON.stringify(request.params, null, '\t')}`);
    }
    if (request.body !== undefined && ['PATCH', 'POST', 'PUT'].includes(request.method)) {
        console.log(`Body: ${JSON.stringify(request.body, null, '\t')}`);
    }
    if (Object.keys(request.query).length > 0) {
        console.log(`Queries: ${JSON.stringify(request.query, null, '\t')}`);
    }
}

async function logMiddleware(request, response, next) {
    log(request);
    next();
}

module.exports = { logMiddleware };
