const hre = require("hardhat");

async function main() {

    // Game Data Manager
    const Poap = await hre.ethers.getContractFactory("Poap");
    const poap = await Poap.deploy("AdaSouls DevNet POAP", "TPOAP", "0x209b0C25745FEA2E9D99F65dF0949afCef281d55");

    await poap.waitForDeployment();

    // Verify the contracts after deploying
    await hre.run("verify:verify", {
        address: await poap.getAddress(),
        constructorArguments: [
            "AdaSouls DevNet POAP", 
            "TPOAP", 
            "0x209b0C25745FEA2E9D99F65dF0949afCef281d55"
        ],
    });

    // Smart Contract Address
    console.log(
        `Poap Contract deployed to ${await poap.getAddress()}`
    );

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
