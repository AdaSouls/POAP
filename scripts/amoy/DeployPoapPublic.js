const hre = require("hardhat");

async function main() {

    // Game Data Manager
    const PoapPublic = await hre.ethers.getContractFactory("PoapPublic");
    const poapPublic = await PoapPublic.deploy("Test AdaSouls POAP", "TPOAP", "0xfe02781cc0fe76Bfd2D211430bfa97D2889fd853");

    await poapPublic.waitForDeployment();

    // Smart Contract Address
    console.log(
        `PoapPublic Contract deployed to ${await poapPublic.getAddress()}`
    );

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
