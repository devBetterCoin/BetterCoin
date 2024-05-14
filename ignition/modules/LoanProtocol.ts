import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const loanProtocolModule = buildModule("loanProtocolModule", (m) => {
  const addrWbtc = m.getParameter(
    "addrWbtc",
    "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f" //Arbitrum wBTC
  );
  const addrUsdt = m.getParameter(
    "addrUsdt",
    "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9" //Arbitrum USDT
  );
  const addrBtt = m.getParameter("addrBtt");

  const addrPriceFeeder = m.getParameter("addrPriceFeeder");
  const loadRatioMin = m.getParameter("loanRatioMin", 50);
  const loadRatioMax = m.getParameter("loanRatioMax", 80);

  const loanProtocol = m.contract(
    "LoanProtocol",
    [addrWbtc, addrUsdt, addrBtt, addrPriceFeeder, loadRatioMin, loadRatioMax],
    {}
  );

  return { loanProtocol };
});

export default loanProtocolModule;
