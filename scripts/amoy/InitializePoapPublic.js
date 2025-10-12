const hre = require("hardhat");

async function main() {

    // Get Smart Contract from Blockchain
    const PoapPublic = await hre.ethers.getContractFactory("PoapPublic");
    const poapPublic = PoapPublic.attach(
        "0x68FF54eCa3C4b71ecE479306F199816f5f4c17d0"
    );

    // Initialise Transaction
    const initializeTx = await poapPublic["initialize(string,address[])"](
        "https://api.adasouls.io/metadata/",
        []
    );

    console.log("Initialize Tx: ", initializeTx.hash);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
