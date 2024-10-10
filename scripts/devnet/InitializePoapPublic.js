const hre = require("hardhat");

async function main() {
  const PoapPublic = await hre.ethers.getContractFactory("PoapPublic");
  const poapPublic = PoapPublic.attach(
    "0x0a835ac5be03f62f659e96082c852ac6a9eac98b"
  );

  const initializeTx = await poapPublic["initialize(string,address[])"](
    "https://api.adasouls.io/metadata/",
    []
  );

  console.log("Initialize Tx: ", initializeTx);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
