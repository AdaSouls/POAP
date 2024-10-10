const hre = require("hardhat");

async function main() {
  // Verify the contracts after deploying
  await hre.run("verify:verify", {
    address: "0x42c80D091657011A7e30E2B2884bE38c9DD0199B",
    constructorArguments: [
      "AdaSouls DevNet POAP",
      "TPOAP",
      "0x209b0C25745FEA2E9D99F65dF0949afCef281d55",
    ],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
