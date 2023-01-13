# Blockchain raffle (Next.js frontend)
User interface (Next.js) for the blockchain raffle contracts (Solidity).

Leveraging web3.js, currently only supports MetaMask.

**Still in eary stages of development**

### Goerli/Sepolia testnet deployments
If you'd like to trial the UI and contracts on either a Goerli (some games will be have been set up with Chainlink's faucet for easier testing) or Sepolia deployment, try the following link https://raffle-nextjs-testnet.s3.eu-west-1.amazonaws.com/index.html

Feel free to start your own game on the deployed contracts, remember, the contract supports ERC-20, ERC-721, and ERC-1155 contract assets for the optional game pots. However, you can only use ERC-20 tokens for raffle tickets, at this time.

### Management panel access
For users granted with contract roles (`CALLER_ROLE` or `MANAGER_ROLE`) on the `GameMaster` contract, click on the footer "✺" button to cache roles into local storage.

## Contracts
https://github.com/AlexanderGW/raffle-contracts

## Development
Run `npm run dev` then visit http://localhost:3200/

### Windows
A Docker solution for hot-reloading issues on WSL
```
docker-compose up
```

## Deployment
Can be deployed as a static build, to AWS S3, IPFS, etc...
```
BUCKET=foobar
npm run build
npm run export
aws s3 rm --recursive s3://${BUCKET}
aws s3 sync ./out s3://${BUCKET}
```