const { initializeApp } = require('firebase-admin/app');
const { onRequest } = require('firebase-functions/v2/https');
const { logMiddleware } = require('./middlewares/logMiddleware');

initializeApp();

const express = require('express');
const authRoutes = require('./routers/authRoutes');
const redeemRoutes = require('./routers/redeemRoutes');

const api = express();

api.use('/api/v1', authRoutes);
api.use('/api/v1', redeemRoutes);
api.all('*', logMiddleware);

exports.api = onRequest(api);
