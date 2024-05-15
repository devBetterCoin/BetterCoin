import hre from "hardhat";
import bttModule from "../ignition/modules/BetterCoin";
import bttMarketModule from "../ignition/modules/BTTMarket";
import bttBurnVaultModule from "../ignition/modules/BTTBurnVault";
import erc20Module from "../ignition/modules/token";
async function main() {
  const { btt } = await hre.ignition.deploy(bttModule);
  const [owner] = await hre.ethers.getSigners();
  const wbtc = (
    await hre.ignition.deploy(erc20Module, {
      parameters: {
        erc20Module: {
          name: "Wrapped Bitcoin",
          symbol: "WBTC",
          totalSupply: BigInt(21000000) * BigInt(10) ** BigInt(18),
        },
      },
    })
  ).erc20;

  const usdt = (
    await hre.ignition.deploy(erc20Module, {
      parameters: {
        erc20Module: {
          name: "USD Tether",
          symbol: "USDT",
          totalSupply: BigInt(1000000000) * BigInt(10) ** BigInt(18),
        },
      },
    })
  ).erc20;

  const addrBtt = (await btt.getAddress()).toLocaleLowerCase();
  const addrWbtc = (await wbtc.getAddress()).toLocaleLowerCase();
  const addrUsdt = (await usdt.getAddress()).toLocaleLowerCase();

  const { bttBurnVault } = await hre.ignition.deploy(bttBurnVaultModule, {
    parameters: {
      bttBurnVaultModule: { addrBtt: addrBtt, addrWbtc: addrWbtc },
    },
  });

  const { bttMarket } = await hre.ignition.deploy(bttMarketModule, {
    parameters: {
      bttMarketModule: {
        addrBtt: addrBtt,
        addrMarketToken: addrUsdt,
        owner: owner.address,
      },
    },
  });
}

main().catch(console.error);
