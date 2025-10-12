const hre = require("hardhat");

async function main() {
    const ConsensualSoulboundPoap = await hre.ethers.getContractFactory("ConsensualSoulboundPoap");
    const consensualSoulboundPoap = ConsensualSoulboundPoap.attach(
        "0x37998311f41ab9a6ca29eAA8bDEAB22c27741b8b"
    );

    const initializeTx = await consensualSoulboundPoap["initialize(string,address[])"](
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
