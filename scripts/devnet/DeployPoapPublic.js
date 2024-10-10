const hre = require("hardhat");

async function main() {
  // Game Data Manager
  const PoapPublic = await hre.ethers.getContractFactory("PoapPublic");
  const poapPublic = await PoapPublic.deploy(
    "AdaSouls DevNet POAP",
    "TPOAP",
    "0x209b0C25745FEA2E9D99F65dF0949afCef281d55"
  );

  await poapPublic.waitForDeployment();

  // Verify the contracts after deploying
  await hre.run("verify:verify", {
    address: await poapPublic.getAddress(),
    constructorArguments: [
      "AdaSouls DevNet POAP",
      "TPOAP",
      "0x209b0C25745FEA2E9D99F65dF0949afCef281d55",
    ],
  });

  // Smart Contract Address
  console.log(
    `Poap Public Contract deployed to ${await poapPublic.getAddress()}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
