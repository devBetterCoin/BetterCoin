import hre from "hardhat";
import bttModule from "../ignition/modules/BetterCoin";
import bttMarketModule from "../ignition/modules/BTTMarket";
import bttBurnVaultModule from "../ignition/modules/BTTBurnVault";
import erc20Module from "../ignition/modules/token";
async function main() {
  const { btt } = await hre.ignition.deploy(bttModule);
  const [owner] = await hre.ethers.getSigners();

  const addrBtt = (await btt.getAddress()).toLocaleLowerCase();

  const { bttBurnVault } = await hre.ignition.deploy(bttBurnVaultModule, {
    parameters: {
      bttBurnVaultModule: { addrBtt: addrBtt },
    },
  });

  const { bttMarket } = await hre.ignition.deploy(bttMarketModule, {
    parameters: {
      bttMarketModule: {
        addrBtt: addrBtt,
      },
    },
  });
}

main().catch(console.error);
