const {
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

async function deployPoapFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const poapFactory = await ethers.getContractFactory("SoulboundPoap");
    const soulboundPoapToken = await poapFactory.deploy("Test Soulbound Poap", "TSPOAP", 10);

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
        it("Should only be called once", async function () {

            const { soulboundPoapToken } = await loadFixture(deployPoapFixture);
            
            await soulboundPoapToken["initialize(string, address[])"]("https://ipfs.io/ipfs/QmQ8kV9JuhkiSt7Qp7HTsiyVUiaobFeTTyjK71q5k8e46w/", []);

            await expect(soulboundPoapToken["initialize(string, address[])"]("https://ipfs.io/ipfs/QmQ8kV9JuhkiSt7Qp7HTsiyVUiaobFeTTyjK71q5k8e46w/", [])).to.be.revertedWithCustomError(soulboundPoapToken, "InvalidInitialization");
        });
        it("Should set the right admin", async function () {

            const { soulboundPoapToken, owner } = await loadFixture(deployPoapFixture);
            
            await soulboundPoapToken["initialize(string, address[])"]("https://ipfs.io/ipfs/QmQ8kV9JuhkiSt7Qp7HTsiyVUiaobFeTTyjK71q5k8e46w/", []);

            const soulboundPoapIsAdmin = await soulboundPoapToken.isAdmin(owner.address);
            expect(soulboundPoapIsAdmin).to.equal(true);
        });

        it("Should set pause status to false", async function () {

            const { soulboundPoapToken } = await loadFixture(deployPoapFixture);
    
            const soulboundPoapPaused = await soulboundPoapToken.paused();
            expect(soulboundPoapPaused).to.equal(false);
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