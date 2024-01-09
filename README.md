# [NFT's Redeem Protocol & Standard for vIRL NFT on WAX](https://labs.wax.io/proposals/100)

Welcome to the RE:DREAMER GitHub Repository! This repository contains the demonstration source code for the WAX proposal #100, focusing on NFT's Redeem Protocol & Standard for vIRL NFT on the WAX blockchain.

## Technologies Used

This project leverages the following technologies:

- **Firebase Functions**: For handling backend logic and API responses.
- **Firebase Firestore Database**: As a NoSQL database solution to store and retrieve data efficiently.
- **Firebase Hosting**: To host and demonstrate the web interface interacting with our APIs and the WAX blockchain.

## APIs

We provide four main APIs in this repository:

1. **Get Nonce**: To generate a nonce for cryptographic operations.
2. **Login**: To authenticate users.
3. **Refresh Access Token**: To renew the access token upon expiration.
4. **Redeem**: To redeem NFTs based on specific conditions.

You can explore and test these APIs using our [Postman Collection](https://www.postman.com/redreamerlabs/workspace/wax-proposal-100/collection/7595278-2184fb3f-ab20-415d-9e82-420fad0417b8?action=share&creator=7595278).

## Firestore Configuration

You can configure your Firebase project to include campaign information in the Firestore. This allows for the integration of various business models and strategies. Currently, the default configurations include:

- `collectionNames`: Specifies the Atomic Assets Collection Names required for the redeeming campaign.
- `receiverAccount`: The designated account where Atomic Assets should be transferred for redemption.

## Transaction Signature Verification

This project uses the signatures and serializedTransaction obtained from signing specific transactions to perform corresponding validations.

## Environment Variables

To set up and run this project, you will need to provide the following environment variables in your `.env` file:

- `WAX_CHAIN_ID`: The Chain ID of the WAX blockchain.
- `WAX_RPC_URL`: The URL of the WAX blockchain RPC endpoint.
- `WAX_AUTH_ACCOUNT`: The WAX account responsible for authentication.
It needs to provide `nonce` as data and the action name should be `auth`.
- `WAX_AUTH_ACTION_NAME`: The action name used for authentication.
- `WAX_REDEEM_ACCOUNT`: The WAX account is used for redeeming actions.
- `WAX_REDEEM_ACTION_NAME`: The action name used for redeeming.
- `JWT_ACCESS_KEY`: Key for JWT access token generation.
- `JWT_REFRESH_KEY`: Key for JWT refresh token generation.
- `ACCESS_TOKEN_EXPIRES_IN`: Expiration time for access tokens.
- `DAPPS_REFRESH_TOKEN_EXPIRES_IN`: Expiration time for DApp refresh tokens.
- `ASSETS_API_BASE_URL`: Base URL for the assets API.

## Contract Deployment

Anyone is free to deploy and interact with their own contracts. We also provide a default contract location on both the WAX Mainnet and testnet for immediate use and reference:

- **Contract Address**: `waxchihkaiyu`

Feel free to deploy your contracts and experiment with the protocol. 