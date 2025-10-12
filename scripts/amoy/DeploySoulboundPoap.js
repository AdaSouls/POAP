const hre = require("hardhat");

async function main() {

    // Game Data Manager
    const SoulboundPoap = await hre.ethers.getContractFactory("SoulboundPoap");
    const soulboundPoap = await SoulboundPoap.deploy("AdaSouls Soulbound POAP", "SPOAP", "0xC3B5E271767C789B2DCEb7f5f7aBe5dBe8679E23");

    await soulboundPoap.waitForDeployment();

    // Verify the contracts after deploying
    await hre.run("verify:verify", {
        address: await soulboundPoap.getAddress(),
        constructorArguments: [
            "AdaSouls Soulbound POAP", 
            "SPOAP", 
            "0xC3B5E271767C789B2DCEb7f5f7aBe5dBe8679E23"
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
