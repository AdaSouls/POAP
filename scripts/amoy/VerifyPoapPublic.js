const hre = require("hardhat");

async function main() {

    // Get Smart Contract from Blockchain
    const PoapPublic = await hre.ethers.getContractFactory("PoapPublic");
    const poapPublic = PoapPublic.attach(
        "0x68FF54eCa3C4b71ecE479306F199816f5f4c17d0"
    );

    // Verify the Contract
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
