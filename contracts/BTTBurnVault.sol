// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./BetterCoin.sol";

/// @title BTTBurnVault
/// @notice A vault that allows users to burn BTT tokens in exchange for backing wBTC tokens.
/// @dev This contract facilitates the burning of BTT tokens and ensures fair distribution of wBTC tokens.
contract BTTBurnVault {
    using SafeERC20 for IERC20;
    using SafeERC20 for BetterCoin;

    /// @notice The wBTC token contract address
    IERC20 immutable wbtc;
    /// @notice The BetterCoin (BTT) contract address
    BetterCoin immutable btt;
    /// @notice The publicly accessible address of the wBTC token contract
    address public wbtcAddress;

    /// @notice Emitted when a user burns BTT tokens and withdraws wBTC tokens
    /// @param bttBurned The amount of BTT tokens burned
    /// @param wbtcWithdrew The amount of wBTC tokens withdrawn
    event burnMade(uint256 bttBurned, uint256 wbtcWithdrew);

    /// @notice Constructor that sets up the vault with the BTT and wBTC token addresses
    /// @param _addrBtt The address of the BTT token contract
    /// @param _addrWbtc The address of the wBTC token contract
    constructor(address _addrBtt, address _addrWbtc) {
        require(_addrBtt != address(0), "Cannot set BTT to zero address");
        require(_addrWbtc != address(0), "Cannot set wBTC to zero address");

        btt = BetterCoin(_addrBtt);
        wbtc = IERC20(_addrWbtc);
        wbtcAddress = _addrWbtc;
    }

    /// @notice Withdraws a proportional amount of backing wBTC tokens by burning BTT tokens
    /// @dev The amount of wBTC tokens to withdraw is based on the BTT burned and the current wBTC balance
    /// @param amount The amount of BTT tokens to burn
    function backingWithdraw(uint256 amount) public {
        uint256 totalSupply = btt.totalSupply();

        require(
            totalSupply > 0,
            "Unable to withdraw with 0 total supply of BTT tokens"
        );
        require(wbtc.balanceOf(address(this)) > 0, "Nothing to withdraw");

        uint256 wbtcToTransfer = (amount * wbtc.balanceOf(address(this))) /
            totalSupply;
        require(wbtcToTransfer > 0, "Nothing to withdraw");

        btt.burnFrom(msg.sender, amount);
        wbtc.safeTransfer(msg.sender, wbtcToTransfer);

        emit burnMade(amount, wbtcToTransfer);
    }
}
