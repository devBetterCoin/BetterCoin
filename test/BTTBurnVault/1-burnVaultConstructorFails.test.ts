import { ethers } from "hardhat";
import chai from "chai";
import { BetterToken, Token } from "../../typechain-types";
import hre from "hardhat";
import erc20Module from "../../ignition/modules/token";
import bttModule from "../../ignition/modules/BetterToken";
const { expect } = chai;

describe("Burn vault constructor fail requires", function () {
  let btt: BetterToken;
  let wbtc: Token;
  let usdt: Token;
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  beforeEach(async function () {
    const [owner] = await ethers.getSigners();
    wbtc = (
      await hre.ignition.deploy(erc20Module, {
        parameters: {
          erc20Module: {
            name: "Wrapped Bitcoin",
            symbol: "WBTC",
            totalSupply: BigInt(21000000) * BigInt(10) ** BigInt(18),
          },
        },
      })
    ).erc20 as unknown as Token;
    btt = (await hre.ignition.deploy(bttModule)).btt as unknown as BetterToken;

    usdt = (
      await hre.ignition.deploy(erc20Module, {
        parameters: {
          erc20Module: {
            name: "USD Tether",
            symbol: "USDT",
            totalSupply: BigInt(1000000000) * BigInt(10) ** BigInt(18),
          },
        },
      })
    ).erc20 as unknown as Token;
  });

  it("Contract deployment may fail setting BTT address as zero address", async function () {
    const [owner] = await ethers.getSigners();
    const burnVault = await ethers.getContractFactory("BTTBurnVault");
    await expect(
      burnVault.deploy(zeroAddress, wbtc.getAddress())
    ).to.revertedWith("Cannot set BTT to zero address");
  });

  it("Contract deployment may fail setting BTT address as zero address", async function () {
    const [owner] = await ethers.getSigners();
    const burnVault = await ethers.getContractFactory("BTTBurnVault");
    await expect(
      burnVault.deploy(btt.getAddress(), zeroAddress)
    ).to.revertedWith("Cannot set wBTC to zero address");
  });
});
