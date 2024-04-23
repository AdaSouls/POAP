const hre = require("hardhat");

async function main() {

    // Game Data Manager
    const SoulboundPoap = await hre.ethers.getContractFactory("SoulboundPoap");
    const soulboundPoap = await SoulboundPoap.deploy("AdaSouls DevNet Soulbound POAP", "TSPOAP", "0x209b0C25745FEA2E9D99F65dF0949afCef281d55");

    await soulboundPoap.waitForDeployment();

    // Verify the contracts after deploying
    await hre.run("verify:verify", {
        address: await soulboundPoap.getAddress(),
        constructorArguments: [
            "AdaSouls DevNet Soulbound POAP", 
            "TSPOAP", 
            "0x209b0C25745FEA2E9D99F65dF0949afCef281d55"
        ],
    });

    // Smart Contract Address
    console.log(
        `Soulbound Poap Contract deployed to ${await soulboundPoap.getAddress()}`
    );

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
