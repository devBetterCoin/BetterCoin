import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const bttModule = buildModule("bttModule", (m) => {
  const btt = m.contract("BetterToken", [], {});

  return { btt };
});

export default bttModule;
