const { errorHandle } = require('../utils/errorHandler');
const Joi = require('joi');
const { refreshAccessToken } = require('./token');

async function refresh(request, response) {
    const schema = Joi.object({
        refreshToken: Joi.string().required(),
    });
    const { error, value } = schema.validate(request.body);
    if (error) {
        return errorHandle(response, error);
    }
    const { refreshToken } = value;
    try {
        const data = await refreshAccessToken(refreshToken);
        return response.status(200).send({
            data,
        });
    } catch (error) {
        return errorHandle(response, error);
    }
}

module.exports = { refresh };
