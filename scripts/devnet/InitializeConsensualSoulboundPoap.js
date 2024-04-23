const hre = require("hardhat");

async function main() {
    const ConsensualSoulboundPoap = await hre.ethers.getContractFactory("ConsensualSoulboundPoap");
    const consensualSoulboundPoap = ConsensualSoulboundPoap.attach(
        "0x42Bc413E4B3DdF30A7cE55ba03c5D3c28d1D9e46"
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
