const {
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

async function deployPoapFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const poapFactory = await ethers.getContractFactory("Poap");
    const poapToken = await poapFactory.deploy("Test Poap", "TPOAP", owner.address);

    return { poapToken, owner, addr1, addr2 };
}

async function deployPoapFixtureAndInitialize() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const poapFactory = await ethers.getContractFactory("Poap");
    const poapToken = await poapFactory.deploy("Test Poap", "TPOAP", owner.address);
    await poapToken["initialize(string, address[])"]("https://ipfs.io/ipfs/QmQ8kV9JuhkiSt7Qp7HTsiyVUiaobFeTTyjK71q5k8e46w/", []);

    return { poapToken, owner, addr1, addr2 };
}

describe("Poap contract", function () {

    describe("Deployment", function () {

        it("Should assign the name correctly", async function () {

            const { poapToken } = await loadFixture(deployPoapFixture);
    
            const soulboundPoapName = await poapToken.name();
            expect(soulboundPoapName).to.equal("Test Poap");
        });
    
        it("Should assign the symbol correctly", async function () {
    
            const { poapToken } = await loadFixture(deployPoapFixture);
    
            const soulboundPoapSymbol = await poapToken.symbol();
            expect(soulboundPoapSymbol).to.equal("TPOAP");
        });

        it("Should assign the right owner", async function () {
    
            const { poapToken, owner } = await loadFixture(deployPoapFixture);
    
            const soulboundPoapOwner = await poapToken.owner();
            expect(soulboundPoapOwner).to.equal(owner.address);
        });
    })

    describe("Initialize", function () {

        it("Should only be called once", async function () {

            const { poapToken } = await loadFixture(deployPoapFixtureAndInitialize);
            
            await expect(poapToken["initialize(string, address[])"]("https://ipfs.io/ipfs/QmQ8kV9JuhkiSt7Qp7HTsiyVUiaobFeTTyjK71q5k8e46w/", [])).to.be.revertedWithCustomError(poapToken, "InvalidInitialization");
        });

        it("Should set the right admin", async function () {

            const { poapToken, owner } = await loadFixture(deployPoapFixtureAndInitialize);
            
            const soulboundPoapIsAdmin = await poapToken.isAdmin(owner.address);
            expect(soulboundPoapIsAdmin).to.equal(true);
        });

        it("Should set extra admins if specified", async function () {

            const { poapToken, owner, addr1, addr2 } = await loadFixture(deployPoapFixture);
            
            await poapToken["initialize(string, address[])"]("https://ipfs.io/ipfs/QmQ8kV9JuhkiSt7Qp7HTsiyVUiaobFeTTyjK71q5k8e46w/", [addr1.address, addr2.address]);

            const soulboundPoapIsAdmin1 = await poapToken.isAdmin(owner.address);
            const soulboundPoapIsAdmin2 = await poapToken.isAdmin(owner.address);
            const soulboundPoapIsAdmin3 = await poapToken.isAdmin(owner.address);

            expect(soulboundPoapIsAdmin1).to.equal(true);
            expect(soulboundPoapIsAdmin2).to.equal(true);
            expect(soulboundPoapIsAdmin3).to.equal(true);
        });

        it("Should set pause status to false", async function () {

            const { poapToken } = await loadFixture(deployPoapFixtureAndInitialize);
            
            const soulboundPoapPaused = await poapToken.paused();
            expect(soulboundPoapPaused).to.equal(false);
        });

        it("Should only be callable by the owner", async function () {
    
            const { poapToken, addr1 } = await loadFixture(deployPoapFixture);

            await expect(poapToken.connect(addr1)["initialize(string, address[])"]("https://ipfs.io/ipfs/QmQ8kV9JuhkiSt7Qp7HTsiyVUiaobFeTTyjK71q5k8e46w/", [])).to.be.revertedWithCustomError(poapToken, "AccessControlUnauthorizedAccount");
            
            await expect(poapToken["initialize(string, address[])"]("https://ipfs.io/ipfs/QmQ8kV9JuhkiSt7Qp7HTsiyVUiaobFeTTyjK71q5k8e46w/", [])).to.be.fulfilled;

        });

        it("Should support erc165 interface", async function () {
    
            const { poapToken } = await loadFixture(deployPoapFixtureAndInitialize);

            const soulboundPoapInterface = await poapToken.supportsInterface("0x01ffc9a7");
            
            expect(soulboundPoapInterface).to.be.true;

        });

        it("Should support paima minting interface", async function () {
    
            const { poapToken } = await loadFixture(deployPoapFixtureAndInitialize);

            const soulboundPoapInterface = await poapToken.supportsInterface("0xd0def521");
            
            expect(soulboundPoapInterface).to.be.true;

        });


    })

    describe("Functions", function () {

        describe("mintToken", function () {

        
        })

    })


});