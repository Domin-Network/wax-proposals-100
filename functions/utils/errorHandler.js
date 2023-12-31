function errorHandle(response, error) {
    console.error(error);
    if (error.details) {
        error.code = 400;
    }
    return response.status(error.code || 500).json({
        message: error.message,
    });
}

module.exports = { errorHandle };
