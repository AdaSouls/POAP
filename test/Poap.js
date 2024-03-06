const {
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

async function deployPoapFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const poapFactory = await ethers.getContractFactory("Poap");
    const poapToken = await poapFactory.deploy("Test Poap", "TPOAP");

    // Fixtures can return anything you consider useful for your tests
    return { poapToken, owner, addr1, addr2 };
}

describe("Poap contract", function () {

    describe("Deployment", function () {
        it("Should assign the name correctly", async function () {

            const { poapToken } = await loadFixture(deployPoapFixture);
    
            const poapName = await poapToken.name();
            expect(poapName).to.equal("Test Poap");
        });
    
        it("Should assign the symbol correctly", async function () {
    
            const { poapToken } = await loadFixture(deployPoapFixture);
    
            const poapSymbol = await poapToken.symbol();
            expect(poapSymbol).to.equal("TPOAP");
        });
    })


});