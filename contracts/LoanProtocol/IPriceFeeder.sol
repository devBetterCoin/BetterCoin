// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface IPriceFeeder {
    function getPrice(uint256 amountIn) external view returns (uint256);
}
