const hre = require("hardhat");

async function main() {

    // Game Data Manager
    const ConsensualSoulboundPoap = await hre.ethers.getContractFactory("SoulboundPoap");
    const consensualSoulboundPoap = await ConsensualSoulboundPoap.deploy("AdaSouls Consensual Soulbound POAP", "CSPOAP", "0xC3B5E271767C789B2DCEb7f5f7aBe5dBe8679E23");

    await consensualSoulboundPoap.waitForDeployment();

    // Verify the contracts after deploying
    await hre.run("verify:verify", {
        address: await consensualSoulboundPoap.getAddress(),
        constructorArguments: [
            "AdaSouls Consensual Soulbound POAP", 
            "CSPOAP", 
            "0xC3B5E271767C789B2DCEb7f5f7aBe5dBe8679E23"
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
