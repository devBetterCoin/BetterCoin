import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const bttBurnVaultModule = buildModule("bttBurnVaultModule", (m) => {
  const addrBtt = m.getParameter("addrBtt");
  const addrWbtc = m.getParameter(
    "addrWbtc",
    "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f"
  );
  const bttBurnVault = m.contract("BTTBurnVault", [addrBtt, addrWbtc], {});

  return { bttBurnVault };
});

export default bttBurnVaultModule;
