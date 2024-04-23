require("@nomicfoundation/hardhat-toolbox");

const MNEMONIC_DEVNET = vars.get("MNEMONIC_DEVNET");
const MNEMONIC_MAINNET = vars.get("MNEMONIC_MAINNET");

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
    devnet: {
      url: "https://rpc-devnet-cardano-evm.c1.milkomeda.com",
      chainId: 200101,
      gasPrice: 70000000000,
      accounts: { mnemonic: `${MNEMONIC_DEVNET}` },
    },
    mainnet: {
      url: "https://rpc-mainnet-cardano-evm.c1.milkomeda.com",
      chainId: 2001,
      gasPrice: 70000000000,
      accounts: { mnemonic: `${MNEMONIC_MAINNET}` },
    },
  },
  etherscan: {
    customChains: [
      {
        network: "milkomeda-c1-devnet",
        chainId: 200101,
        urls: {
          apiURL: "https://explorer-devnet-cardano-evm.c1.milkomeda.com/api",
          browserURL: "https://explorer-devnet-cardano-evm.c1.milkomeda.com"
        }
      },
      {
        network: "milkomeda-c1-mainnet",
        chainId: 2001,
        urls: {
          apiURL: "https://explorer-mainnet-cardano-evm.c1.milkomeda.com/api",
          browserURL: "https://explorer-mainnet-cardano-evm.c1.milkomeda.com"
        }
      }
    ],
    apiKey: {
      "milkomeda-c1-devnet": "NO_API_KEY_PROVIDED",
      "milkomeda-c1-mainnet": "NO_API_KEY_PROVIDED",
    }
  },
};
