const hre = require("hardhat");

async function main() {

    // Game Data Manager
    const ConsensualSoulboundPoap = await hre.ethers.getContractFactory("SoulboundPoap");
    const consensualSoulboundPoap = await ConsensualSoulboundPoap.deploy("AdaSouls DevNet Consensual Soulbound POAP", "TCSPOAP", "0x209b0C25745FEA2E9D99F65dF0949afCef281d55");

    await consensualSoulboundPoap.waitForDeployment();

    // Verify the contracts after deploying
    await hre.run("verify:verify", {
        address: await consensualSoulboundPoap.getAddress(),
        constructorArguments: [
            "AdaSouls DevNet Consensual Soulbound POAP", 
            "TCSPOAP", 
            "0x209b0C25745FEA2E9D99F65dF0949afCef281d55"
        ],
    });

    // Smart Contract Address
    console.log(
        `Consensual Soulbound Poap Contract deployed to ${await consensualSoulboundPoap.getAddress()}`
    );

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
