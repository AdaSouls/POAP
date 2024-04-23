const hre = require("hardhat");

async function main() {
    const SoulboundPoap = await hre.ethers.getContractFactory("SoulboundPoap");
    const soulboundPoap = SoulboundPoap.attach(
        "0x466b22dCAE2C8dE98e1BcEA839a70145537da97a"
    );

    const initializeTx = await soulboundPoap["initialize(string,address[])"](
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
