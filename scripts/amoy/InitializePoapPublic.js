const hre = require("hardhat");

async function main() {
    const PoapPublic = await hre.ethers.getContractFactory("PoapPublic");
    const poapPublic = PoapPublic.attach(
        "0xeaFb5fa833Bf35112Bfef885ccB7425233702740"
    );

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
