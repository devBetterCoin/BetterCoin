import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const priceFeederModule = buildModule("priceFeederModule", (m) => {
  const addrBtt = m.getParameter("addrBtt");
  const addrWbtc = m.getParameter(
    "addrWbtc",
    "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f" //Arbitrum wBTC
  );
  const addrPriceFeedUsdtWbtc = m.getParameter(
    "addrPriceFeedUsdtWbtc",
    "0x6ce185860a4963106506C203335A2910413708e9" //Arbitrum  chainlink USDT/WBTC price feed (https://data.chain.link/feeds/arbitrum/mainnet/btc-usd)
  );
  const addrBurnVault = m.getParameter("addrBurnVault");
  const marketTokenPer100Btt = 35;

  const priceFeeder = m.contract(
    "PriceFeeder",
    [
      addrBtt,
      addrWbtc,
      addrPriceFeedUsdtWbtc,
      addrBurnVault,
      marketTokenPer100Btt,
    ],
    {}
  );

  return { priceFeeder };
});

export default priceFeederModule;
