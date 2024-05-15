// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "./BetterCoin.sol";

/// @title BTTMarket
/// @notice A centralized market for buying and selling BTT tokens at administratively defined rates.
/// @dev This contract allows users to buy or sell BTT tokens using a defined market token, with adjustable rates and fees.
contract BTTMarket is Ownable2Step {
    using SafeERC20 for IERC20;
    using SafeERC20 for BetterCoin;

    /// @notice The BetterToken (BTT) contract address
    BetterCoin private immutable btt;
    /// @notice The market token used for buying and selling BTT
    IERC20 private immutable marketToken;

    /// @notice The current price of 100 BTT tokens in the market token
    uint256 public marketTokenPer100Btt;

    /// @notice The fee for transactions, represented in perthousand (1/1000)
    uint256 public fee;

    /// @notice Emitted when a user buys BTT tokens with market tokens
    /// @param marketTokenFromUser The amount of market tokens spent by the user
    /// @param bttToUser The amount of BTT tokens received by the user
    event userBought(uint256 marketTokenFromUser, uint256 bttToUser);

    /// @notice Emitted when a user sells BTT tokens for market tokens
    /// @param marketTokenToUser The amount of market tokens received by the user
    /// @param bttFromUser The amount of BTT tokens sold by the user
    event userSold(uint256 marketTokenToUser, uint256 bttFromUser);

    /// @notice Constructor that sets up the market with the BTT, market token, initial rate, and fee
    /// @param _addrBtt The address of the BTT contract
    /// @param _addrMarketToken The address of the market token
    /// @param _marketTokenPer100Btt The price of 100 BTT in market tokens
    /// @param _fee The transaction fee in perthousand (1/1000)
    constructor(
        address _addrBtt,
        address _addrMarketToken,
        uint256 _marketTokenPer100Btt,
        uint256 _fee
    ) Ownable(msg.sender) {
        require(_addrBtt != address(0), "Cannot set BTT to zero address");
        require(
            _addrMarketToken != address(0),
            "Cannot set market token to zero address"
        );
        require(_marketTokenPer100Btt > 0, "Rate must be greater than 0");
        require(_fee < 1000, "Fee must be lesser than 1000");

        btt = BetterCoin(_addrBtt);
        marketToken = IERC20(_addrMarketToken);

        marketTokenPer100Btt = _marketTokenPer100Btt;
        fee = _fee;
    }

    /// @notice Allows a user to buy BTT tokens with market tokens
    /// @param amount The amount of market tokens to spend
    function buy(uint256 amount) public {
        require(
            amount <= marketToken.balanceOf(msg.sender),
            "User doesn't have enough balance"
        );

        uint256 bttToUser = (amount * 100) / marketTokenPer100Btt;
        require(bttToUser > 0, "Amount too small");
        require(
            bttToUser <= btt.balanceOf(address(this)),
            "Market doesn't have enough BTT"
        );

        marketToken.safeTransferFrom(msg.sender, this.owner(), amount);
        btt.safeTransfer(msg.sender, bttToUser);

        emit userBought(amount, bttToUser);
    }

    /// @notice Allows a user to sell BTT tokens for market tokens
    /// @param amount The amount of BTT tokens to sell
    function sell(uint256 amount) public {
        require(
            amount <= btt.balanceOf(msg.sender),
            "User doesn't have enough BTT"
        );

        uint256 marketTokenToTransfer = (((amount * marketTokenPer100Btt) /
            100) * (1000 - fee)) / 1000;
        require(
            marketTokenToTransfer <= marketToken.balanceOf(address(this)),
            "Market doesn't have enough balance"
        );

        btt.safeTransferFrom(msg.sender, this.owner(), amount);
        marketToken.safeTransfer(msg.sender, marketTokenToTransfer);

        emit userSold(marketTokenToTransfer, amount);
    }

    /// @notice Allows the contract owner to set the price of 100 BTT tokens in market tokens
    /// @param _marketTokenPer100Btt The new price for 100 BTT in market tokens
    function setRate(uint256 _marketTokenPer100Btt) public onlyOwner {
        require(_marketTokenPer100Btt > 0, "Rate must be greater than 0");
        marketTokenPer100Btt = _marketTokenPer100Btt;
    }

    /// @notice Allows the contract owner to set the transaction fee for selling BTT tokens
    /// @param _fee The new fee to use, in perthousand (1/1000)
    function setFee(uint256 _fee) public onlyOwner {
        require(_fee < 1000, "Fee must be lesser than 1000");
        fee = _fee;
    }

    /// @notice Allows the contract owner to withdraw all tokens from the contract
    function withdrawAll() public onlyOwner {
        uint256 balanceBtt = btt.balanceOf(address(this));
        uint256 balanceMarketToken = marketToken.balanceOf(address(this));

        btt.safeTransfer(this.owner(), balanceBtt);
        marketToken.safeTransfer(this.owner(), balanceMarketToken);
    }
}
