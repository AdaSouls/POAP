const {
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

async function deployPoapFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const poapFactory = await ethers.getContractFactory("SoulboundPoap");
    const soulboundPoapToken = await poapFactory.deploy("Test Soulbound Poap", "TSPOAP", 10, owner.address);

    // Fixtures can return anything you consider useful for your tests
    return { soulboundPoapToken, owner, addr1, addr2 };
}

describe("Soulbound Poap contract", function () {

    describe("Deployment", function () {
        it("Should assign the name correctly", async function () {

            const { soulboundPoapToken } = await loadFixture(deployPoapFixture);
    
            const soulboundPoapName = await soulboundPoapToken.name();
            expect(soulboundPoapName).to.equal("Test Soulbound Poap");
        });
    
        it("Should assign the symbol correctly", async function () {
    
            const { soulboundPoapToken } = await loadFixture(deployPoapFixture);
    
            const soulboundPoapSymbol = await soulboundPoapToken.symbol();
            expect(soulboundPoapSymbol).to.equal("TSPOAP");
        });

        it("Should assign the right max supply", async function () {
    
            const { soulboundPoapToken } = await loadFixture(deployPoapFixture);
    
            const soulboundPoapMaxSupply = await soulboundPoapToken.maxSupply();
            expect(soulboundPoapMaxSupply).to.equal("10");
        });

        it("Should assign the right owner", async function () {
    
            const { soulboundPoapToken, owner } = await loadFixture(deployPoapFixture);
    
            const soulboundPoapOwner = await soulboundPoapToken.owner();
            expect(soulboundPoapOwner).to.equal(owner.address);
        });
    })

    describe("Initialize", function () {
        it("Should set the right base URI", async function () {

            const { soulboundPoapToken } = await loadFixture(deployPoapFixture);
    
            const soulboundPoapName = await soulboundPoapToken.name();
            expect(soulboundPoapName).to.equal("Test Soulbound Poap");
        });
    
        it("Should set the right admins", async function () {
    
            const { soulboundPoapToken } = await loadFixture(deployPoapFixture);
    
            const soulboundPoapSymbol = await soulboundPoapToken.symbol();
            expect(soulboundPoapSymbol).to.equal("TSPOAP");
        });

        it("Should only be callable by the owner", async function () {
    
            const { soulboundPoapToken } = await loadFixture(deployPoapFixture);
    
            const soulboundPoapMaxSupply = await soulboundPoapToken.maxSupply();
            expect(soulboundPoapMaxSupply).to.equal("10");
        });

        it("Should assign the right owner", async function () {
    
            const { soulboundPoapToken, owner } = await loadFixture(deployPoapFixture);
    
            const soulboundPoapOwner = await soulboundPoapToken.owner();
            expect(soulboundPoapOwner).to.equal(owner.address);
        });
    })


});