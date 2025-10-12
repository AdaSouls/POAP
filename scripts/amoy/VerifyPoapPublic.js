const hre = require("hardhat");

async function main() {

    // Game Data Manager
    const PoapPublic = await hre.ethers.getContractFactory("PoapPublic");
    const poapPublic = PoapPublic.attach(
        "0xeaFb5fa833Bf35112Bfef885ccB7425233702740"
    );

    // Verify the contracts after deploying
    await hre.run("verify:verify", {
        address: await poapPublic.getAddress(),
        constructorArguments: [
            "Test AdaSouls POAP", 
            "TPOAP", 
            "0xfe02781cc0fe76Bfd2D211430bfa97D2889fd853"
        ],
    });

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
