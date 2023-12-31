const express = require('express');
const { refresh } = require('../auth/auth');
// eslint-disable-next-line new-cap
const router = express.Router();
const dappsAuth = require('../auth/dapps/dappsAuth');

router.post('/auth/dapps/:type/login', async (request, response) => {
    return dappsAuth.login(request, response);
});

router.get('/auth/dapps/:type/nonce', async (request, response) => {
    return dappsAuth.fetchNonce(request, response);
});

router.post('/auth/refresh', async (request, response) => {
    return refresh(request, response);
});

module.exports = router;
