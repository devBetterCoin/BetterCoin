import { ethers } from "hardhat";
import chai from "chai";
import { BTTMarket, BetterCoin, Token } from "../../typechain-types";
import hre from "hardhat";
import erc20Module from "../../ignition/modules/token";
import bttModule from "../../ignition/modules/BetterCoin";
import bttMarketModule from "../../ignition/modules/BTTMarket";
const { expect } = chai;

describe("Market", function () {
  let btt: BetterCoin;
  let wbtc: Token;
  let usdt: Token;
  let market: BTTMarket;
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

    btt = (await hre.ignition.deploy(bttModule)).btt as unknown as BetterCoin;

    const addrBtt = (await btt.getAddress()).toLocaleLowerCase();
    const addrWbtc = (await wbtc.getAddress()).toLocaleLowerCase();
    const addrUsdt = (await usdt.getAddress()).toLocaleLowerCase();

    market = (
      await hre.ignition.deploy(bttMarketModule, {
        parameters: {
          bttMarketModule: {
            addrBtt: addrBtt,
            addrMarketToken: addrUsdt,
            owner: owner.address,
          },
        },
      })
    ).bttMarket as unknown as BTTMarket;
  });
  it("Owner must be able to change rate", async function () {
    const [owner] = await ethers.getSigners();
    await market.setRate(15);
    expect(await market.marketTokenPer100Btt()).to.equal(15);
  });

  it("Owner must not  be able to set 0 as rate", async function () {
    const [owner] = await ethers.getSigners();
    await expect(market.setRate(0)).to.revertedWith(
      "Rate must be greater than 0"
    );
  });

  it("Owner must be able to change fee", async function () {
    const [owner] = await ethers.getSigners();
    await market.setFee(980);
    expect(await market.fee()).to.equal(980);
  });

  it("Owner must not able to change fee to a value greater than 1000", async function () {
    const [owner] = await ethers.getSigners();
    expect(market.setFee(1001)).to.revertedWith("Fee must be lesser than 1000");
  });

  it("User should be able to buy at defined rate", async function () {
    const [owner, user] = await ethers.getSigners();

    //Send tokens to market to be able to execute exchanges
    await usdt.transfer(market.getAddress(), 1000000);
    await btt.transfer(market.getAddress(), 2857 * 2); //Border case emptying the market

    //Send tokens to user to be able to buy
    await usdt.transfer(user.address, 2000);

    //User approve usdt to be expended by market
    await usdt.connect(user).approve(market.getAddress(), 100000);

    const usdtToSend = 1000n;
    const expectedAmtToRecive =
      (usdtToSend * 100n) / (await market.marketTokenPer100Btt());

    await expect(market.connect(user).buy(usdtToSend)).to.changeTokenBalances(
      btt,
      [user.address, await market.getAddress()],
      [expectedAmtToRecive, -expectedAmtToRecive]
    );
    await expect(market.connect(user).buy(usdtToSend)).to.changeTokenBalances(
      usdt,
      [user.address, owner.address],
      [-usdtToSend, usdtToSend]
    );
  });

  it("User must not be able to buy with not enough balance", async function () {
    const [owner, user] = await ethers.getSigners();

    //Send tokens to market to be able to execute exchanges
    await usdt.transfer(market.getAddress(), 1000000);
    await btt.transfer(market.getAddress(), 1000000);

    //Send tokens to user to be able to buy
    await usdt.transfer(user.address, 1000);

    //User approve usdt to be expended by market
    await usdt.connect(user).approve(market.getAddress(), 100000);

    const usdtToSend = 1001n;
    const expectedBttToRecive =
      (usdtToSend * 100n) / (await market.marketTokenPer100Btt());

    await expect(market.connect(user).buy(usdtToSend)).to.revertedWith(
      "User doesn't have enough balance"
    );
  });

  it("User must not be able to buy very small amounts", async function () {
    const [owner, user] = await ethers.getSigners();

    //Send tokens to market to be able to execute exchanges
    await usdt.transfer(market.getAddress(), 1000000);
    await btt.transfer(market.getAddress(), 1000000);

    //Send tokens to user to be able to buy
    await usdt.transfer(user.address, 1000);

    //User approve usdt to be expended by market
    await usdt.connect(user).approve(market.getAddress(), 100000);

    const usdtToSend = 1001n;
    const expectedAmtToRecive =
      (usdtToSend * 100n) / (await market.marketTokenPer100Btt());

    await market.setRate(ethers.parseEther("1000000000000000"));
    await expect(market.connect(user).buy(1)).to.revertedWith(
      "Amount too small"
    );
  });
  it("User must not be able to buy more btt than the market balance", async function () {
    const [owner, user] = await ethers.getSigners();

    //Send tokens to market to be able to execute exchanges
    await usdt.transfer(market.getAddress(), 1000000);
    await btt.transfer(market.getAddress(), 100);

    //Send tokens to user to be able to buy
    await usdt.transfer(user.address, 1000);

    //User approve usdt to be expended by market
    await usdt.connect(user).approve(market.getAddress(), 100000);

    const usdtToSend = 1000n;
    const expectedAmtToRecive =
      (usdtToSend * 100n) / (await market.marketTokenPer100Btt());

    await expect(market.connect(user).buy(usdtToSend)).to.revertedWith(
      "Market doesn't have enough BTT"
    );
  });

  it("Buy function must emmit event with correct params", async function () {
    const [owner, user] = await ethers.getSigners();

    //Send tokens to market to be able to execute exchanges
    await usdt.transfer(market.getAddress(), 1000000);
    await btt.transfer(market.getAddress(), 1000000);

    //Send tokens to user to be able to buy
    await usdt.transfer(user.address, 1000);

    //User approve usdt to be expended by market
    await usdt.connect(user).approve(market.getAddress(), 100000);

    const usdtToSend = 1000n;
    const expectedAmtToRecive =
      (usdtToSend * 100n) / (await market.marketTokenPer100Btt());

    await expect(market.connect(user).buy(usdtToSend))
      .to.emit(market, "userBought")
      .withArgs(usdtToSend, expectedAmtToRecive);
  });

  it("User should be able to sell at defined rate paying the fee", async function () {
    const [owner, user] = await ethers.getSigners();
    //Send tokens to market to be able to execute exchanges
    await usdt.transfer(market.getAddress(), 1000000);
    await btt.transfer(market.getAddress(), 1000000);

    //Send tokens to user to be able to sell
    await btt.transfer(user.address, 10000);

    //User approve amt to be expended by market
    await btt.connect(user).approve(market.getAddress(), 100000);

    const amtToSend = 100n;
    const expectedUsdtToRecive =
      (((amtToSend * 35n) / 100n) * (1000n - 10n)) / 1000n;
    await expect(market.connect(user).sell(amtToSend)).to.changeTokenBalances(
      usdt,
      [user.address, await market.getAddress()],
      [expectedUsdtToRecive, -expectedUsdtToRecive]
    );
    await expect(market.connect(user).sell(amtToSend)).to.changeTokenBalances(
      btt,
      [user.address, owner.address],
      [-amtToSend, amtToSend]
    );
  });

  it("User must not be able to sell with not enough btt ", async function () {
    const [owner, user] = await ethers.getSigners();
    //Send tokens to market to be able to execute exchanges
    await usdt.transfer(market.getAddress(), 1000000);
    await btt.transfer(market.getAddress(), 1000000);

    //Send tokens to user to be able to sell
    await btt.transfer(user.address, 10000);

    //User approve amt to be expended by market
    await btt.connect(user).approve(market.getAddress(), 100000);

    const bttToSend = 10001n;
    const expectedUsdtToRecive =
      (((bttToSend * 35n) / 100n) * (1000n - 10n)) / 1000n;
    await expect(market.connect(user).sell(bttToSend)).to.revertedWith(
      "User doesn't have enough BTT"
    );
  });

  it("User must not be able to recive more tokens than the market tokens balance", async function () {
    const [owner, user] = await ethers.getSigners();
    //Send tokens to market to be able to execute exchanges
    await usdt.transfer(market.getAddress(), 100);
    await btt.transfer(market.getAddress(), 1000000);

    //Send tokens to user to be able to sell
    await btt.transfer(user.address, 10000);

    //User approve amt to be expended by market
    await btt.connect(user).approve(market.getAddress(), 100000);

    const bttToSend = 10000n;

    await expect(market.connect(user).sell(bttToSend)).to.revertedWith(
      "Market doesn't have enough balance"
    );
  });

  it("Buy function must emmit event with correct params", async function () {
    const [owner, user] = await ethers.getSigners();
    //Send tokens to market to be able to execute exchanges
    await usdt.transfer(market.getAddress(), 1000000);
    await btt.transfer(market.getAddress(), 1000000);

    //Send tokens to user to be able to sell
    await btt.transfer(user.address, 10000);

    //User approve amt to be expended by market
    await btt.connect(user).approve(market.getAddress(), 100000);

    const bttToSend = 100n;
    const expectedUsdtToRecive =
      (((bttToSend * 35n) / 100n) * (1000n - 10n)) / 1000n;
    await expect(market.connect(user).sell(bttToSend))
      .to.emit(market, "userSold")
      .withArgs(expectedUsdtToRecive, bttToSend);
  });

  it("WithdrawAll must empty the market and send every token to the owner", async function () {
    const [owner, user] = await ethers.getSigners();
    //Send tokens to market to be able to execute exchanges
    await usdt.transfer(market.getAddress(), 1000000);
    await btt.transfer(market.getAddress(), 1000000);

    const prevBttBalance = await btt.balanceOf(owner.address);
    const prevUsdtBalance = await usdt.balanceOf(owner.address);

    const transaction = await market.withdrawAll();
    await transaction.wait();
    expect(await btt.balanceOf(owner.address)).to.be.equal(
      prevBttBalance + 1000000n
    );
    expect(await usdt.balanceOf(owner.address)).to.be.equal(
      prevUsdtBalance + 1000000n
    );
    expect(await btt.balanceOf(market.getAddress())).to.be.equal(0);
    expect(await usdt.balanceOf(market.getAddress())).to.be.equal(0);
  });

  it("MODIFIERS: operations with only owner", async function () {
    const [owner, user] = await ethers.getSigners();

    await expect(market.connect(user).setRate(25))
      .to.revertedWithCustomError(market, "OwnableUnauthorizedAccount")
      .withArgs(user.address);
    await expect(market.connect(user).setFee(25))
      .to.revertedWithCustomError(market, "OwnableUnauthorizedAccount")
      .withArgs(user.address);
    await expect(market.connect(user).withdrawAll())
      .to.revertedWithCustomError(market, "OwnableUnauthorizedAccount")
      .withArgs(user.address);
  });
});
