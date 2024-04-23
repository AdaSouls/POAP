const hre = require("hardhat");

async function main() {

    // Game Data Manager
    const Poap = await hre.ethers.getContractFactory("Poap");
    const poap = await Poap.deploy("AdaSouls POAP", "POAP", "0xC3B5E271767C789B2DCEb7f5f7aBe5dBe8679E23");

    await poap.waitForDeployment();

    // Verify the contracts after deploying
    await hre.run("verify:verify", {
        address: await poap.getAddress(),
        constructorArguments: [
            "AdaSouls POAP", 
            "POAP", 
            "0xC3B5E271767C789B2DCEb7f5f7aBe5dBe8679E23"
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
