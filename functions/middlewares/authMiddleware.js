const { errorHandle } = require('../utils/errorHandler');
const { verifyAccessToken } = require('../auth/token');

const authMiddleware = (scope) => {
    return async (request, response, next) => {
        const bearerToken = request.header('Authorization');
        try {
            if (bearerToken) {
                console.log(`Auth with bearer token: ${bearerToken}`);
                verifyBearerToken(bearerToken, request, response, scope, next);
            } else {
                const error = new Error('Authorization error');
                error.code = 401;
                throw error;
            }
        } catch (error) {
            return errorHandle(response, error);
        }
    };
};

function verifyBearerToken(token, request, response, scope, next) {
    const tokenValue = token.split(' ');
    if (tokenValue.length !== 2) {
        const error = new Error('Authorization error');
        error.code = 401;
        throw error;
    }
    const accessToken = tokenValue[1];
    try {
        const decode = verifyAccessToken(accessToken);
        console.log(`Scopes: ${decode.scopes}`);
        const scopes = decode.scopes;
        if (scopes === '') {
            response.locals.account = decode.account.toLowerCase();
            next();
        } else if (scopes.includes(scope)) {
            response.locals.account = decode.account.toLowerCase();
            response.locals.scopes = scopes;
            next();
        } else {
            const error = new Error('Permission denied');
            error.code = 403;
            throw error;
        }
    } catch (error) {
        throw error;
    }
}

module.exports = { authMiddleware };
