import AnchorLink from 'anchor-link';
import AnchorLinkBrowserTransport from 'anchor-link-browser-transport';

const transport = new AnchorLinkBrowserTransport();
const link = new AnchorLink({
    transport, chains: [{
        chainId: process.env.WAX_CHAIN_ID,
        nodeUrl: process.env.WAX_RPC_URL,
    }]
});
const appName = 'redreamer';
let userSession = null;
let account = null;

export const loginWithAnchor = async () => {
    try {
        const identity = await link.login(appName);
        account = identity.session.auth.actor;
        console.log(`Account: ${JSON.stringify(account, null, '\t')}`);
        console.log('Logged in as', account);
        userSession = identity.session;
        return account;
    } catch (error) {
        console.error(`Login failed: ${error}`);
    }
};

export const signTransactionWithAnchor = async (transaction, options) => {
    if (!userSession) {
        throw new Error('Not logged in');
    }
    try {
        console.log(`Signing transaction: ${JSON.stringify(transaction, null, '\t')}`);
        console.log(`Options: ${JSON.stringify(options, null, '\t')}`);
        const result = await userSession.transact(transaction, options);
        console.log('Transaction pushed', result);
        return result
    } catch (error) {
        console.error(`Transaction failed: ${error}`);
    }
}

export const restoreSession = async () => {
    try {
        const session = await link.restoreSession(appName);
        account = session.auth.actor;
        console.log(`Account: ${JSON.stringify(account, null, '\t')}`);
        console.log('Logged in as', account);
        userSession = session;
        return account;
    } catch (error) {
        console.error(`Login failed: ${error}`);
    }
}

export const getAccount = () => {
    if (!userSession) {
        throw new Error('Not logged in');
    }
    return userSession.auth.actor;
}