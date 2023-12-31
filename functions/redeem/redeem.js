const { verifyRedeemTransaction } = require('../tools/tools');
const { errorHandle } = require('../utils/errorHandler');
const fetch = require('node-fetch');
const { FieldValue, getFirestore } = require('firebase-admin/firestore');

async function redeem(request, response) {
    try {
        const campaignDocument = (await getFirestore().collection('campaigns').doc(request.params.id).get());
        const {
            from, campaign_uuid: campaignId, collection_name: collectionName, asset_id: assetId,
        } = await verifyRedeemTransaction(
            request,
            response,
            campaignDocument.exists ? campaignDocument.data().receiverAccount : null,
        );
        if (request.params.id !== campaignId) {
            const error = new Error('Invalid campaign');
            error.code = 400;
            throw error;
        }
        console.log(`Redeeming asset ${assetId} from ${from} for campaign ${campaignId}`);
        if (response.locals.account !== from) {
            const error = new Error('Invalid actor');
            error.code = 400;
            throw error;
        }
        const campaignSnapshot = await getFirestore().collection('campaigns').doc(campaignId).get();
        if (!campaignSnapshot.exists) {
            const error = new Error('Invalid campaign');
            error.code = 400;
            throw error;
        }
        const campaign = campaignSnapshot.data();
        if (campaign.collectionNames.includes(collectionName) == false) {
            const error = new Error('Invalid collection');
            error.code = 400;
            throw error;
        }
        const asset = await fetchAsset(assetId);
        if (asset.owner !== from || asset.collection.collection_name !== collectionName) {
            const error = new Error('Invalid asset');
            error.code = 400;
            throw error;
        }
        const batch = getFirestore().batch();
        batch.create(
            getFirestore().collection('campaigns').doc(campaignId).collection('redemptions').doc(),
            {
                assetId,
                from,
                collectionName,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            },
        );
        batch.commit();
        return response.status(200).json({
            data: {
                message: 'Redemption successful',
            },
        });
    } catch (error) {
        console.error(error);
        return errorHandle(response, error);
    }
}

async function fetchAsset(id) {
    const baseUrl = process.env.ASSETS_API_BASE_URL;
    const response = await fetch(`${baseUrl}/v1/assets/${id}`, {
        method: 'GET',
    });
    if (response.status !== 200) {
        const error = new Error('Invalid asset');
        error.code = 400;
        throw error;
    }
    const data = (await response.json()).data;
    console.log(`Asset: ${JSON.stringify(data, null, '\t')}`);
    return data;
}

module.exports = { redeem };
