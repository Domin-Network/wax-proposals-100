require('dotenv').config();
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const Joi = require('joi');
const { errorHandle } = require('../../utils/errorHandler');
const { generateDappsAccessToken, generateDappsRefreshToken } = require('../token');
const { verifySignatures } = require('../../tools/tools');

async function fetchNonce(request, response) {
    const { account } = request.query;
    return response.status(200).json({
        data: {
            nonce: await getNonce(account),
        },
    });
}

async function login(request, response) {
    try {
        const loginSchema = Joi.object({
            from: Joi.string().required(),
            nonce: Joi.string().required(),
        });
        const {
            account, nonce, serializedTransaction, signatures,
        } = await verifySignatures(request, response, process.env.WAX_AUTH_ACCOUNT, process.env.WAX_AUTH_ACTION_NAME, loginSchema);
        console.log(`Account: ${account}`);
        console.log(`Nonce: ${nonce}`);
        const nonceSnapshots = await getFirestore().collection('auth')
            .doc('wax')
            .collection('accounts')
            .doc(account.toLowerCase())
            .collection('nonces')
            .where('isValidated', '==', false)
            .limit(1)
            .get();
        if (nonceSnapshots.empty) {
            const error = new Error('Invalid nonce');
            error.code = 400;
            return errorHandle(response, error);
        }
        const databaseNonce = nonceSnapshots.docs[0].id;
        if (databaseNonce !== nonce) {
            const error = new Error('Invalid nonce');
            error.code = 400;
            throw error;
        }
        const batch = getFirestore().batch();
        const accessToken = generateDappsAccessToken(account);
        const refreshToken = generateDappsRefreshToken(account);
        batch.update(nonceSnapshots.docs[0].ref, {
            isValidated: true,
            updatedAt: FieldValue.serverTimestamp(),
        });
        batch.create(
            getFirestore().collection('auth')
                .doc('wax')
                .collection('accounts')
                .doc(account.toLowerCase())
                .collection('transactions')
                .doc(),
            {
                serializedTransaction,
                signatures,
                accessToken,
                refreshToken,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            });
        await batch.commit();
        return response.status(200).json({
            data: {
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        error.code = 400;
        return errorHandle(response, error);
    }
}

async function getNonce(account) {
    const nonceSnapshot = await getFirestore().collection('auth')
        .doc('wax')
        .collection('accounts')
        .doc(account.toLowerCase())
        .collection('nonces')
        .where('isValidated', '==', false)
        .limit(1)
        .get();
    if (nonceSnapshot.empty) {
        const document = await getFirestore().collection('auth')
            .doc('wax')
            .collection('accounts')
            .doc(account.toLowerCase())
            .collection('nonces')
            .add({
                isValidated: false,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            });
        return document.id;
    } else {
        const nonce = nonceSnapshot.docs[0].id;
        await getFirestore().collection('auth')
            .doc('wax')
            .collection('accounts')
            .doc(account.toLowerCase())
            .collection('nonces')
            .doc(nonce)
            .update({
                updatedAt: FieldValue.serverTimestamp(),
            });
        return nonce;
    }
}

module.exports = {
    fetchNonce,
    login,
};
