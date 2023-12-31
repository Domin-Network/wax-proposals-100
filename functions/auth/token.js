const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const jwt = require('jsonwebtoken');

function generateToken(account, expiresIn, key, scopes) {
    return jwt.sign({
        account,
        scopes,
    }, key, {
        algorithm: 'HS512',
        expiresIn,
        issuer: 'RE:DREAMER',
    });
}

function generateDappsAccessToken(account, refreshExpiresIn = Number(process.env.DAPPS_REFRESH_TOKEN_EXPIRES_IN)) {
    const expiresIn = Math.min(refreshExpiresIn, Number(process.env.ACCESS_TOKEN_EXPIRES_IN));
    return generateToken(
        account, expiresIn, process.env.JWT_ACCESS_KEY, '',
    );
}

function generateDappsRefreshToken(account) {
    return generateToken(
        account, Number(process.env.DAPPS_REFRESH_TOKEN_EXPIRES_IN), process.env.JWT_REFRESH_KEY, 'auth.token.refresh',
    );
}

function verifyAccessToken(token) {
    return verifyJWT(token, process.env.JWT_ACCESS_KEY);
}

function verifyJWT(token, key) {
    try {
        const result = jwt.verify(token, key);
        return result;
    } catch (error) {
        error.code = 401;
        throw error;
    }
}

async function refreshAccessToken(refreshToken) {
    const db = getFirestore();
    const { account } = verifyJWT(refreshToken, process.env.JWT_REFRESH_KEY);
    console.log(`Refresh token: ${refreshToken}`);
    console.log(`Account: ${account}`);
    const snapshot = await db.collection('auth')
        .doc('wax')
        .collection('accounts')
        .doc(account.toLowerCase())
        .collection('transactions')
        .where('refreshToken', '==', refreshToken)
        .limit(1)
        .get();
    let document;
    snapshot.forEach((result) => {
        document = result;
    });
    if (document) {
        const accessToken = generateDappsAccessToken(account);
        await document.ref.set({
            updatedAt: FieldValue.serverTimestamp(),
            accessToken,
        }, { merge: true });
        return {
            accessToken,
            refreshToken,
        };
    } else {
        const error = new Error('Refresh token not found');
        error.code = 404;
        throw error;
    }
}

module.exports = {
    generateDappsAccessToken,
    generateDappsRefreshToken,
    refreshAccessToken,
    verifyAccessToken,
};
