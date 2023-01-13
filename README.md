# Blockchain raffle (Next.js frontend)
User interface (Next.js) for the blockchain raffle contracts (Solidity).

Leveraging web3.js, currently only supports MetaMask.

### Management panel access
For users granted with contract roles (`CALLER_ROLE` or `MANAGER_ROLE`) on the `GameMaster` contract, click on the footer "✺" button to cache roles into local storage.

**Still in eary stages of development**

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

### Goerli test deployment
If you'd like to trial the UI on a Goerli deployment, try the following link https://raffle-nextjs-testnet.s3.eu-west-1.amazonaws.com/index.html