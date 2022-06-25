# Blockchain raffle (Next.js frontend)
User interface (Next.js) for the blockchain raffle contracts (Solidity).

Leveraging web3.js, currently only supports MetaMask.

### Management panel access
For users granted with contract roles (`CALLER_ROLE` or `MANAGER_ROLE`) on the `GameMaster` contract, visit endpoint `/management` to cache roles into local storage.

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