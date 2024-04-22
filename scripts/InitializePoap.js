const hre = require("hardhat");
const { BigNumber } = require("ethers");

async function main() {
    const Poap = await hre.ethers.getContractFactory("Poap");
    const poap = Poap.attach(
        "0xd4CE16B9EF9DcB76F3cAEf9a5875E9F461E364de"
    );

    const initializeTx = await poap["initialize(string,address[])"](
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
