const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');

module.exports = (env) => {
    const envFile = dotenv.config({ path: `.env.${env.ENVIRONMENT}` }).parsed;
    for (const key in envFile) {
        process.env[key] = envFile[key];
    }
    return {
        mode: env.ENVIRONMENT,
        entry: './index.js',
        output: {
            path: path.resolve(__dirname, '../public'),
            filename: 'anchor.js',
            library: 'AnchorModule',
            libraryTarget: 'umd',
            globalObject: 'this',
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.WAX_CHAIN_ID': JSON.stringify(process.env.WAX_CHAIN_ID),
                'process.env.WAX_RPC_URL': JSON.stringify(process.env.WAX_RPC_URL),
            }),
        ]
    }
};
