const Joi = require('joi');
const ecc = require('eosjs-ecc');
const { Api, JsonRpc } = require('eosjs');
const api = new Api({
    rpc: new JsonRpc(process.env.WAX_RPC_URL),
    signatureProvider: null,
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder(),
});
const { errorHandle } = require('../utils/errorHandler');

function verifyRequestBody(request, response) {
    const requestBodySchema = Joi.object({
        signatures: Joi.array().items(Joi.string().required()).required(),
        serializedTransaction: Joi.array().items(Joi.number()).required(),
        transactionId: Joi.string(),
    });
    const { error, value } = requestBodySchema.validate(request.body);
    if (error) {
        return errorHandle(response, error.details[0].message);
    }
    const { signatures, serializedTransaction } = value;
    const transactionArray = Buffer.from(serializedTransaction, 'hex');
    const data = Buffer.concat([
        Buffer.from(process.env.WAX_CHAIN_ID, 'hex'),
        transactionArray,
        Buffer.from(new Uint8Array(32)),
    ]);
    const publicKeys = [];
    for (const signature of signatures) {
        const publicKey = ecc.recover(signature, data);
        publicKeys.push(publicKey);
    }
    const result = {
        ...value,
        publicKeys,
    };
    return result;
}

async function verifySignatures(request, response, actionAccount, actionName, schema) {
    const { signatures, serializedTransaction, publicKeys } = verifyRequestBody(request, response);
    let actions = [];
    try {
        const transactionArray = Buffer.from(serializedTransaction, 'hex');
        const transaction = api.deserializeTransaction(transactionArray);
        actions = await api.deserializeActions(
            transaction.actions,
        );
        console.log(`Transaction: ${JSON.stringify(transaction, null, '\t')}`);
    } catch (error) {
        console.error(`Error deserializing transaction: ${error}`);
        throw new Error('Error deserializing transaction');
    }
    for (const action of actions) {
        const result = verifyAction(action, actionAccount, actionName, serializedTransaction, signatures, publicKeys, schema);
        if (result) {
            if (response.locals.account && response.locals.account !== result.account) {
                throw new Error('Invalid actor');
            }
            return result;
        }
    }
    throw new Error('Invalid signature');
}

async function verifyAction(action, actionAccount, actionName, serializedTransaction, signatures, publicKeys, schema) {
    if (action.account === actionAccount && action.name === actionName) {
        const { error, value } = schema.validate(action.data);
        if (!error) {
            console.log(`Action: ${JSON.stringify(action, null, '\t')}`);
            const { from } = value;
            const auth = action.authorization[0];
            if (auth.actor !== from) {
                console.error(`Invalid actor: ${auth.actor} !== ${from}`);
                throw new Error('Invalid actor');
            }
            if (auth.permission !== 'active') {
                console.error(`Invalid permission: ${auth.permission} !== active`);
                throw new Error('Invalid permission');
            }
            const account = await api.rpc.get_account(from);
            for (const permission of account.permissions) {
                if (permission.perm_name === auth.permission) {
                    if (publicKeys.includes(permission.required_auth.keys[0].key)) {
                        const result = {
                            ...value,
                            account: auth.actor,
                            serializedTransaction,
                            signatures,
                        };
                        return result;
                    } else {
                        console.error(`Invalid signature: ${permission.required_auth.keys[0].key} not in ${publicKeys}`);
                    }
                } else {
                    console.error(`Invalid permission: ${permission.perm_name} !== ${auth.permission}`);
                }
            }
        } else {
            console.error(`Invalid action data: ${error}`);
        }
    }
}

async function verifyRedeemTransaction(request, response, transferTo = null) {
    const { signatures, serializedTransaction, transactionId, publicKeys } = verifyRequestBody(request, response);
    console.log(`Verifying transaction ${transactionId} and ${transferTo ? `transfer to ${transferTo}` : `redeem`}`);
    const transaction = await api.rpc.history_get_transaction(transactionId);
    if (!transaction) {
        throw new Error('Transaction not found');
    }
    if (transaction.trx.receipt.status !== 'executed') {
        throw new Error('Transaction not executed');
    }
    const transferSchema = Joi.object({
        from: Joi.string().required(),
        to: Joi.string().required(),
        asset_ids: Joi.array().items(Joi.string()).required(),
        memo: Joi.string().allow('').required(),
    });
    const redeemSchema = Joi.object({
        from: Joi.string().required(),
        campaign_uuid: Joi.string().required(),
        collection_name: Joi.string().required(),
        asset_id: Joi.string().required(),
    });
    let redeemAction;
    const transferActions = [];
    console.log(`Trances: ${JSON.stringify(transaction.traces, null, '\t')}`);
    for (const trace of transaction.traces) {
        if (transferTo) {
            const transferAction = await verifyAction(
                trace.act,
                'atomicassets',
                'transfer',
                serializedTransaction,
                signatures,
                publicKeys,
                transferSchema,
            );
            if (transferAction) {
                transferActions.push(transferAction);
            }
        }
        if (!redeemAction) {
            redeemAction = await verifyAction(
                trace.act,
                process.env.WAX_REDEEM_ACCOUNT,
                process.env.WAX_REDEEM_ACTION_NAME,
                serializedTransaction,
                signatures,
                publicKeys,
                redeemSchema,
            );
        }
    }
    if (transferTo) {
        let hasTransferred = false;
        for (const transferAction of transferActions) {
            if (
                transferAction.to === transferTo &&
                transferAction.asset_ids.includes(redeemAction.asset_id) &&
                transferAction.from === redeemAction.from
            ) {
                hasTransferred = true;
            }
        }
        if (!hasTransferred) {
            throw new Error('Asset not transferred');
        }
    }
    if (!redeemAction) {
        throw new Error('Redeem not found');
    }
    return redeemAction;
}

module.exports = {
    verifySignatures,
    verifyRedeemTransaction,
};
