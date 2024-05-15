import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const bttModule = buildModule("bttModule", (m) => {
  const btt = m.contract("BetterCoin", [], {});

  return { btt };
});

export default bttModule;
