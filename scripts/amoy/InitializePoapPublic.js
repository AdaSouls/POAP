const hre = require("hardhat");

async function main() {
    const PoapPublic = await hre.ethers.getContractFactory("PoapPublic");
    const poapPublic = PoapPublic.attach(
        "0x8782Ea1ee75e6EdCACFF2c9ED4985Ce76fA228fa"
    );

    const initializeTx = await poapPublic["initialize(string,address[])"](
        "https://api.adasouls.io/metadata/",
        []
    );

    console.log("Initialize Tx: ", initializeTx);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
