// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "./IPriceFeeder.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "hardhat/console.sol";

/// @title Price Feeder for BTT BTC to be used on loan protocol
/// @notice This contract provides price feed functionality for BTT-BTCB in USDT using chainlink oracles to get the price of USDT wBTC and the burnVault to derive the price BTT wBTC.

/// @dev Inherits from OpenZeppelin's Ownable for access control and utilizes Chainlink for reliable price feeds.
contract PriceFeeder is Ownable2Step, IPriceFeeder {
    using SafeERC20 for IERC20;

    address internal immutable btt;
    address internal immutable wbtc;
    address internal immutable burnVault;
    AggregatorV3Interface internal immutable priceFeedUsdtWbtc;

    /// @notice Initializes the contract with necessary oracle and token addresses.
    /// @param _btt Address of the BTT token.
    /// @param _wbtc Address of the BTCB token.
    /// @param _priceFeedUsdtWbtc Address of the Chainlink price feed for USDT-wBTC.
    /// @param _burnVault Address of the of the burnVault to calculate the exchange rate of BTT-BTCB.
    constructor(
        address _btt,
        address _wbtc,
        address _priceFeedUsdtWbtc,
        address _burnVault
    ) Ownable(msg.sender) {
        require(_btt != address(0), "BTT must not be the zero address");
        require(_wbtc != address(0), "wBTC must not be the zero address");
        require(
            _priceFeedUsdtWbtc != address(0),
            "priceFeedUSDTwBTC must not be the zero address"
        );
        require(
            _burnVault != address(0),
            "Burn Vault BTTwBTC must not be the zero address"
        );
        btt = _btt;
        wbtc = _wbtc;
        burnVault = _burnVault;
        priceFeedUsdtWbtc = AggregatorV3Interface(_priceFeedUsdtWbtc);
    }

    /// @notice Fetches the latest wBTC price from the Chainlink oracle.
    /// @return The latest wBTC price scaled to 8 decimal places.
    function getLatestBTCPrice() public view returns (uint256) {
        (
            uint80 roundID,
            int256 price,
            ,
            uint256 timestamp,
            uint80 answeredInRound
        ) = priceFeedUsdtWbtc.latestRoundData();
        require(answeredInRound >= roundID, "Stale price");
        require(timestamp != 0, "Round not complete");
        require(price > 0, "Chainlink price reporting 0");
        return uint256(price / 10 ** 8); // Scale to 8 decimal places
    }

    /// @notice Calculates the price of a given amount of AMT in USDT terms.
    /// @dev Uses both AMT-BTCB oracle and Chainlink aggregator for USDT-BTCB to derive the final price.
    /// @dev Takes the lower price between the quoted balance and the oracle price
    /// @param amountIn The amount of AMT tokens to price in USDT.
    /// @return The calculated price of the given amount of AMT in USDT.
    function getPrice(uint256 amountIn) public view returns (uint256) {
        IERC20 Btt = IERC20(btt);
        IERC20 Wbtc = IERC20(wbtc);
        uint256 priceBttWbtc = (amountIn * Wbtc.balanceOf(burnVault)) /
            Btt.totalSupply();
        uint256 priceBttWbtcUsdt = getLatestBTCPrice() * priceBttWbtc;

        return priceBttWbtcUsdt;
    }
}
