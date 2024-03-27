const {
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

async function deployPoapFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const poapFactory = await ethers.getContractFactory("SoulboundPoap");
    const soulboundPoapToken = await poapFactory.deploy("Test Soulbound Poap", "TSPOAP", owner.address);

    return { soulboundPoapToken, owner, addr1, addr2 };
}

async function deployPoapFixtureAndInitialize() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const poapFactory = await ethers.getContractFactory("SoulboundPoap");
    const soulboundPoapToken = await poapFactory.deploy("Test Soulbound Poap", "TSPOAP", owner.address);
    await soulboundPoapToken["initialize(string, address[])"]("https://ipfs.io/ipfs/QmQ8kV9JuhkiSt7Qp7HTsiyVUiaobFeTTyjK71q5k8e46w/", []);

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

        it("Should assign the right owner", async function () {
    
            const { soulboundPoapToken, owner } = await loadFixture(deployPoapFixture);
    
            const soulboundPoapOwner = await soulboundPoapToken.owner();
            expect(soulboundPoapOwner).to.equal(owner.address);
        });
    })

    describe("Initialize", function () {

        it("Should only be called once", async function () {

            const { soulboundPoapToken } = await loadFixture(deployPoapFixtureAndInitialize);
            
            await expect(soulboundPoapToken["initialize(string, address[])"]("https://ipfs.io/ipfs/QmQ8kV9JuhkiSt7Qp7HTsiyVUiaobFeTTyjK71q5k8e46w/", [])).to.be.revertedWithCustomError(soulboundPoapToken, "InvalidInitialization");
        });

        it("Should set the right admin", async function () {

            const { soulboundPoapToken, owner } = await loadFixture(deployPoapFixtureAndInitialize);
            
            const soulboundPoapIsAdmin = await soulboundPoapToken.isAdmin(owner.address);
            expect(soulboundPoapIsAdmin).to.equal(true);
        });

        it("Should set extra admins if specified", async function () {

            const { soulboundPoapToken, owner, addr1, addr2 } = await loadFixture(deployPoapFixture);
            
            await soulboundPoapToken["initialize(string, address[])"]("https://ipfs.io/ipfs/QmQ8kV9JuhkiSt7Qp7HTsiyVUiaobFeTTyjK71q5k8e46w/", [addr1.address, addr2.address]);

            const soulboundPoapIsAdmin1 = await soulboundPoapToken.isAdmin(owner.address);
            const soulboundPoapIsAdmin2 = await soulboundPoapToken.isAdmin(owner.address);
            const soulboundPoapIsAdmin3 = await soulboundPoapToken.isAdmin(owner.address);

            expect(soulboundPoapIsAdmin1).to.equal(true);
            expect(soulboundPoapIsAdmin2).to.equal(true);
            expect(soulboundPoapIsAdmin3).to.equal(true);
        });

        it("Should set pause status to false", async function () {

            const { soulboundPoapToken } = await loadFixture(deployPoapFixtureAndInitialize);
            
            const soulboundPoapPaused = await soulboundPoapToken.paused();
            expect(soulboundPoapPaused).to.equal(false);
        });

        it("Should only be callable by the owner", async function () {
    
            const { soulboundPoapToken, addr1 } = await loadFixture(deployPoapFixture);

            await expect(soulboundPoapToken.connect(addr1)["initialize(string, address[])"]("https://ipfs.io/ipfs/QmQ8kV9JuhkiSt7Qp7HTsiyVUiaobFeTTyjK71q5k8e46w/", [])).to.be.revertedWithCustomError(soulboundPoapToken, "OwnableUnauthorizedAccount");
            
            await expect(soulboundPoapToken["initialize(string, address[])"]("https://ipfs.io/ipfs/QmQ8kV9JuhkiSt7Qp7HTsiyVUiaobFeTTyjK71q5k8e46w/", [])).to.be.fulfilled;

        });

        it("Should support erc165 interface", async function () {
    
            const { soulboundPoapToken } = await loadFixture(deployPoapFixtureAndInitialize);

            const soulboundPoapInterface = await soulboundPoapToken.supportsInterface("0x01ffc9a7");
            
            expect(soulboundPoapInterface).to.be.true;

        });

        it("Should support paima minting interface", async function () {
    
            const { soulboundPoapToken } = await loadFixture(deployPoapFixtureAndInitialize);

            const soulboundPoapInterface = await soulboundPoapToken.supportsInterface("0xd0def521");
            
            expect(soulboundPoapInterface).to.be.true;

        });


    })

    describe("Functions", function () {

        describe("mintToken", function () {

        
        })

    })


});