import { ethers } from "hardhat";
import chai from "chai";
import bttModule from "../../ignition/modules/BetterCoin";
import bttBurnVaultModule from "../../ignition/modules/BTTBurnVault";
import { BTTBurnVault, BetterCoin, Token } from "../../typechain-types";
import hre from "hardhat";
import erc20Module from "../../ignition/modules/token";
const { expect } = chai;

describe("burnVault", function () {
  let btt: BetterCoin;
  let wbtc: Token;
  let burnVault: BTTBurnVault;
  const bttTotalSupply = BigInt(21000000) * BigInt(10) ** BigInt(18);

  beforeEach(async function () {
    const [owner, addr1, addr2, addr3, addr4, addr5] =
      await ethers.getSigners();

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

    btt = (await hre.ignition.deploy(bttModule)).btt as unknown as BetterCoin;

    const addrBtt = (await btt.getAddress()).toLocaleLowerCase();
    const addrWbtc = (await wbtc.getAddress()).toLocaleLowerCase();

    burnVault = (
      await hre.ignition.deploy(bttBurnVaultModule, {
        parameters: {
          bttBurnVaultModule: { addrBtt: addrBtt, addrWbtc: addrWbtc },
        },
      })
    ).bttBurnVault as unknown as BTTBurnVault;
    //Allowances
    await btt
      .connect(addr1)
      .approve(await burnVault.getAddress(), ethers.parseEther("999999999999"));
    await btt
      .connect(addr2)
      .approve(await burnVault.getAddress(), ethers.parseEther("999999999999"));
    await btt
      .connect(addr3)
      .approve(await burnVault.getAddress(), ethers.parseEther("999999999999"));
    await btt
      .connect(addr4)
      .approve(await burnVault.getAddress(), ethers.parseEther("999999999999"));
    await btt
      .connect(addr5)
      .approve(await burnVault.getAddress(), ethers.parseEther("999999999999"));
  });

  it("UNIT: backing withdrawl", async function () {
    const [owner, addr1] = await ethers.getSigners();
    await btt.transfer(addr1.address, ethers.parseEther("10"));
    await wbtc.transfer(await burnVault.getAddress(), ethers.parseEther("100"));
    await expect(
      burnVault.connect(addr1).backingWithdraw(ethers.parseEther("10"))
    ).to.changeTokenBalance(
      wbtc,
      addr1.address,
      (ethers.parseEther("10") * ethers.parseEther("100")) / bttTotalSupply
    );
  });

  it("UNIT: backing withdrawl revert condition total supply eq to 0", async function () {
    const [owner, addr1] = await ethers.getSigners();
    await btt.burn(bttTotalSupply);

    await expect(burnVault.connect(addr1).backingWithdraw(10)).to.revertedWith(
      "Unable to withdraw with 0 total supply of BTT tokens"
    );
  });

  it("UNIT: backing withdrawl revert condition btcbToWithdraw eq to 0", async function () {
    const [owner, addr1] = await ethers.getSigners();
    await wbtc.transfer(await burnVault.getAddress(), ethers.parseEther("100"));
    await expect(burnVault.connect(addr1).backingWithdraw(10)).to.revertedWith(
      "Nothing to withdraw"
    );
  });

  it("UNIT: backing withdrawl revert condition wbtc balance eq to 0", async function () {
    const [owner, addr1] = await ethers.getSigners();

    await expect(burnVault.connect(addr1).backingWithdraw(10)).to.revertedWith(
      "Nothing to withdraw"
    );
  });

  it("UNIT: backing withdrawl must emit event with correct arguments", async function () {
    const [owner, addr1] = await ethers.getSigners();
    await btt.transfer(addr1.address, ethers.parseEther("10"));
    await wbtc.transfer(burnVault.getAddress(), ethers.parseEther("100"));
    await expect(
      burnVault.connect(addr1).backingWithdraw(ethers.parseEther("10"))
    )
      .to.emit(burnVault, "burnMade")
      .withArgs(
        ethers.parseEther("10"),
        (ethers.parseEther("10") * ethers.parseEther("100")) / bttTotalSupply
      );
  });

  it("Basic burn and distribution with multiple wallets", async function () {
    const [owner, addr1, addr2, addr3, addr4, addr5] =
      await ethers.getSigners();

    await btt.transfer(addr1.address, ethers.parseEther("10"));
    await btt.transfer(addr2.address, ethers.parseEther("10"));
    await btt.transfer(addr3.address, ethers.parseEther("20"));
    await btt.transfer(addr4.address, ethers.parseEther("20"));
    await btt.transfer(addr5.address, ethers.parseEther("40"));

    await wbtc.transfer(burnVault.getAddress(), ethers.parseEther("100"));

    await expect(
      burnVault.connect(addr1).backingWithdraw(ethers.parseEther("10"))
    ).to.changeTokenBalance(
      wbtc,
      addr1.address,
      (ethers.parseEther("10") * ethers.parseEther("100")) / bttTotalSupply
    );
    await expect(
      burnVault.connect(addr2).backingWithdraw(ethers.parseEther("10"))
    ).to.changeTokenBalance(
      wbtc,
      addr2.address,
      (ethers.parseEther("10") * ethers.parseEther("100")) / bttTotalSupply
    );
    await expect(
      burnVault.connect(addr3).backingWithdraw(ethers.parseEther("20"))
    ).to.changeTokenBalance(
      wbtc,
      addr3.address,
      (ethers.parseEther("20") * ethers.parseEther("100")) / bttTotalSupply
    );
    await expect(
      burnVault.connect(addr4).backingWithdraw(ethers.parseEther("20"))
    ).to.changeTokenBalance(
      wbtc,
      addr4.address,
      (ethers.parseEther("20") * ethers.parseEther("100")) / bttTotalSupply
    );
    await expect(
      burnVault.connect(addr5).backingWithdraw(ethers.parseEther("40"))
    ).to.changeTokenBalance(
      wbtc,
      addr5.address,
      (ethers.parseEther("40") * ethers.parseEther("100")) / bttTotalSupply
    );
  });
});
