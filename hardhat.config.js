require("@nomicfoundation/hardhat-toolbox");

const MNEMONIC_DEVNET = vars.get("MNEMONIC_DEVNET");
const MNEMONIC_MAINNET = vars.get("MNEMONIC_MAINNET");
const POLYGONSCAN_API = vars.get("POLYGONSCAN_API");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      gas: 19000000,
      allowUnlimitedContractSize: true,
      timeout: 1800000,
      accounts: { mnemonic: `${MNEMONIC_DEVNET}` },
    },
    hardhat: {
      gas: 19000000,
      allowUnlimitedContractSize: true,
      timeout: 1800000,
      accounts: { mnemonic: `${MNEMONIC_DEVNET}` },
    },
    amoy: {
      url: "https://polygon-amoy.infura.io/v3/d7bf219eb0e1429ca0066ef1734ee1e7",
      chainId: 80002,
      gasPrice: 30000000000,
      accounts: { mnemonic: `${MNEMONIC_DEVNET}` },
    },
  },
  etherscan: {
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
    ],
    apiKey: {
      polygonAmoy: `${POLYGONSCAN_API}`,
    },
  },
};
