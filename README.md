# Better Token (BTT)

## Introduction

Better Token (BTT) is an ERC20 token designed to work on the Arbitrum network. With a fixed supply limit of 21,000,000 tokens, BTT is burnable and interacts with various smart contracts to provide a decentralized finance (DeFi) ecosystem centered around token burns and exchanges.

The primary objective of the BTT token and its ecosystem of smart contracts is to create a share system where holders can increase their value by receiving a proportional share of the system's earnings. This is achieved through the BTTBurnVault, where holders can burn their tokens at any time to receive their share of the wBTC reserves, based on their holdings.

As the system evolves and holders burn their tokens, the next earnings are distributed among fewer BTT tokens, thereby increasing the value of remaining tokens relative to the BTTBurnVault. This not only improves the value against the BurnVault but also enhances the overall distribution rate, rewarding holders who continue to hold and benefit from a higher share of the system's earnings.

## Features

- **Burnable ERC20 Token**: BTT tokens can be burned to withdraw a proportional amount of wBTC from the _BTTBurnVault_.
- **Fixed Supply**: The total supply of BTT tokens is capped at 21,000,000, ensuring scarcity and value preservation.
- **BTTBurnVault**: A smart contract that allows BTT holders to burn their tokens in exchange for wBTC, based on the current token reserve and total supply.
- **BTTMarket**: A centralized market place to buy and sell BTT tokens at rates set by the administrator, providing liquidity and easy exchange options for token holders.

## Contract Architecture

To read the entire API definition refer to [API DOCUMENTATION](API.md)

### BetterToken Contract

### Overview:

BetterToken (BTT) is a burnable ERC20 token with a limited supply, designed to work on the Arbitrum network. This contract manages the minting and burning of BTT tokens, with a capped total supply of 21,000,000 tokens.

### BTTBurnVault Contract

This contract allows users to burn their BTT in exchange for wBTC stored in the vault. The exchange rate adjusts dynamically based on the BTT total supply and the current wBTC reserves, ensuring that all token holders receive the same value per token burned at a defined moment.

### BTTMarket Contract

Operates as a centralized exchange for BTT, where users can buy or sell BTT tokens against a market token at administratively set rates. This contract includes transaction fees and provides functionalities for rate and fee adjustments by the contract owner.

## Installation

After cloning the repository run:

```bash
npm install
```

## Testing

We have a complete test suit that covers all the smart contracts and it's functionabilities located in `./test/`

- After installing everything run:

```bash
npx hardhat test
```

- For coverage testing:

```bash
  npx hardhat test --coverage
```

## Deployment

We've created an Ignition module for each contract located in `./ignition/modules`. Each module has the default parameter definitions of the addresses required for mainnet deployment.

Additionally, we've created two custom deployment scripts:

1. **`deploy4Mainnet.ts`**
2. **`deploy4Testing.ts`**

### Deployment Modules

- **`./ignition/modules`**
  - Contains the Ignition modules for each contract with default parameters for mainnet deployment.
  - Transfers ownership of the contracts to the intended owners.

### Custom Deployment Scripts

#### `deploy4Mainnet.ts`

This script:

1. Uses the Ignition modules to deploy the contracts on the mainnet with the default parameters.

#### `deploy4Testing.ts`

This script:

1. Deploys test versions of the USDT and wBTC tokens to be used in testing.
2. Deploys the BTT contracts using the Ignition modules with testing parameters.
