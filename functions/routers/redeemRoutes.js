const express = require('express');
const { redeem } = require('../redeem/redeem');
const { authMiddleware } = require('../middlewares/authMiddleware');
// eslint-disable-next-line new-cap
const router = express.Router();


router.post('/center/dapps/:type/redeem/:id', authMiddleware('redeem'), async (request, response) => {
    return redeem(request, response);
});

module.exports = router;
