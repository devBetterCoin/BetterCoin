import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "solidity-coverage";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      { version: "0.8.9" },
      { version: "0.8.20" },
      { version: "0.6.6" },
      { version: "0.5.16" },
      { version: "0.4.18" },
    ],
  },
};

export default config;
