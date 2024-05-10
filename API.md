# Better Token Project - API Documentation

## BetterToken (BTT)

### Overview

BetterToken (BTT) is a burnable ERC20 token with a limited supply, designed to work on the Arbitrum network. This contract manages the minting and burning of BTT tokens, with a capped total supply of 21,000,000 tokens.

### Constructor

```solidity
constructor() ERC20(nameForDeploy, symbolForDeploy)
```

- **Purpose:** Mints the entire supply to the deployer and sets the token's name and symbol.
- **Parameters:**
  - None.

### Public State Variables

1. **`MAX_SUPPLY`**
   - **Type:** `uint256`
   - **Purpose:** The maximum number of BTT tokens that can ever exist (21,000,000 \* 10^18).

### Functions

1. **`burn`**

   ```solidity
   function burn(uint256 amount) public virtual
   ```

   - **Purpose:** Burns a specified amount of the caller's BTT tokens.
   - **Parameters:**
     - `amount` (uint256): The number of BTT tokens to burn.

2. **`burnFrom`**
   ```solidity
   function burnFrom(address account, uint256 amount) public virtual
   ```
   - **Purpose:** Burns a specified amount of tokens from a specific account, reducing the balance of the specified account and spending the caller's allowance.
   - **Parameters:**
     - `account` (address): The address of the account to burn tokens from.
     - `amount` (uint256): The number of BTT tokens to burn.

---

## BTTBurnVault

### Overview

A vault that allows users to burn BTT tokens in exchange for backing wBTC tokens. The contract facilitates the burning of BTT tokens and ensures fair distribution of wBTC tokens.

### Constructor

```solidity
constructor(address _addrBtt, address _addrWbtc)
```

- **Purpose:** Sets up the vault with the BTT and wBTC token addresses.
- **Parameters:**
  - `_addrBtt` (address): The address of the BTT token contract.
  - `_addrWbtc` (address): The address of the wBTC token contract.

### Public State Variables

1. **`wbtcAddress`**
   - **Type:** `address`
   - **Purpose:** The publicly accessible address of the wBTC token contract.

### Events

1. **`burnMade`**
   ```solidity
   event burnMade(uint256 bttBurned, uint256 wbtcWithdrew)
   ```
   - **Parameters:**
     - `bttBurned` (uint256): The amount of BTT tokens burned.
     - `wbtcWithdrew` (uint256): The amount of wBTC tokens withdrawn.

### Functions

1. **`backingWithdraw`**
   ```solidity
   function backingWithdraw(uint256 amount) public
   ```
   - **Purpose:** Withdraws a proportional amount of backing wBTC tokens by burning BTT tokens.
   - **Parameters:**
     - `amount` (uint256): The amount of BTT tokens to burn.

---

## BTTMarket

### Overview

A centralized market for buying and selling BTT tokens at administratively defined rates. The contract allows users to buy or sell BTT tokens using a defined market token, with adjustable rates and fees.

### Constructor

```solidity
constructor(address _addrBtt, address _addrMarketToken, uint256 _marketTokenPer100Btt, uint256 _fee) Ownable(msg.sender)
```

- **Purpose:** Sets up the market with the BTT, market token, initial rate, and fee.
- **Parameters:**
  - `_addrBtt` (address): The address of the BTT contract.
  - `_addrMarketToken` (address): The address of the market token.
  - `_marketTokenPer100Btt` (uint256): The price of 100 BTT in market tokens.
  - `_fee` (uint256): The transaction fee in perthousand (1/1000).

### Public State Variables

1. **`marketTokenPer100Btt`**

   - **Type:** `uint256`
   - **Purpose:** The current price of 100 BTT tokens in the market token.

2. **`fee`**
   - **Type:** `uint256`
   - **Purpose:** The fee for transactions, represented in perthousand (1/1000).

### Events

1. **`userBought`**

   ```solidity
   event userBought(uint256 marketTokenFromUser, uint256 bttToUser)
   ```

   - **Parameters:**
     - `marketTokenFromUser` (uint256): The amount of market tokens spent by the user.
     - `bttToUser` (uint256): The amount of BTT tokens received by the user.

2. **`userSold`**
   ```solidity
   event userSold(uint256 marketTokenToUser, uint256 bttFromUser)
   ```
   - **Parameters:**
     - `marketTokenToUser` (uint256): The amount of market tokens received by the user.
     - `bttFromUser` (uint256): The amount of BTT tokens sold by the user.

### Functions

1. **`buy`**

   ```solidity
   function buy(uint256 amount) public
   ```

   - **Purpose:** Allows a user to buy BTT tokens with market tokens.
   - **Parameters:**
     - `amount` (uint256): The amount of market tokens to spend.

2. **`sell`**

   ```solidity
   function sell(uint256 amount) public
   ```

   - **Purpose:** Allows a user to sell BTT tokens for market tokens.
   - **Parameters:**
     - `amount` (uint256): The amount of BTT tokens to sell.

3. **`setRate`**

   ```solidity
   function setRate(uint256 _marketTokenPer100Btt) public onlyOwner
   ```

   - **Purpose:** Allows the contract owner to set the price of 100 BTT tokens in market tokens.
   - **Parameters:**
     - `_marketTokenPer100Btt` (uint256): The new price for 100 BTT in market tokens.

4. **`setFee`**

   ```solidity
   function setFee(uint256 _fee) public onlyOwner
   ```

   - **Purpose:** Allows the contract owner to set the transaction fee for selling BTT tokens.
   - **Parameters:**
     - `_fee` (uint256): The new fee to use, in perthousand (1/1000).

5. **`withdrawAll`**
   ```solidity
   function withdrawAll() public onlyOwner
   ```
   - **Purpose:** Allows the contract owner to withdraw all tokens from the contract.
