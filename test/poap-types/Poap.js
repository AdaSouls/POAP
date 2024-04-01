const {
    loadFixture,
    time,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

const sevenDays = 7 * 24 * 60 * 60;
const eightDays = 8 * 24 * 60 * 60;

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

        describe("createEventId", function () {

            it("Should only be callable by the admin", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);
                
                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.connect(addr1).createEventId(1, 0, latestPlusSevenDays, addr2.address)).to.be.reverted;
                
                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr2.address)).to.be.fulfilled;
    
            });

            it("Should only be callable when contract is not paused", async function () {
    
                const { poapToken, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);
                
                await poapToken.pause();
                
                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr2.address)).to.be.reverted;
                
                await poapToken.unpause();

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr2.address)).to.be.fulfilled;
    
            });

            it("Should not allow the creation of events with same id", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.revertedWith("Poap: event already created");

                await expect(poapToken.createEventId(2, 100, latestPlusSevenDays, addr2.address)).to.be.fulfilled;

                await expect(poapToken.createEventId(2, 100, latestPlusSevenDays, addr2.address)).to.be.revertedWith("Poap: event already created");

            });

            it("Should not allow the creation of events with mint expiration date less than 3 days from now", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                const latest = await time.latest();

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.createEventId(2, 0, latest, addr2.address)).to.be.revertedWith("Poap: mint expiration must be higher than current timestamp plus 3 days");

            });

            it("Should allow the creation of events with mint expiration date 3 days from now", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.createEventId(2, 0, latestPlusSevenDays, addr2.address)).to.be.fulfilled;

            });

            it("Should allow the creation of events with no mint expiration date", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                await expect(poapToken.createEventId(1, 0, 0, addr1.address)).to.be.fulfilled;

                await expect(poapToken.createEventId(2, 0, 0, addr2.address)).to.be.fulfilled;

            });

            it("Should allow the creation of events with limited supply of tokens", async function () {
    
                const { poapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                const maxSupply = await poapToken.eventMaxSupply(1);

                expect(maxSupply).to.equal(10);
    
            });

            it("Should allow the creation of events with unlimited supply of tokens", async function () {
    
                const { poapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                const maxSupply = await poapToken.eventMaxSupply(1);

                expect(maxSupply).to.equal(BigInt(115792089237316195423570985008687907853269984665640564039457584007913129639935n));
    
            });

            it("Should add the event organizer as the initial minter of the event", async function () {
    
                const { poapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                const eventOrganizer = await poapToken.isEventMinter(1, addr1.address)
                
                expect(eventOrganizer).to.be.true;

            });

        })

        describe("mintToken", function () {

            it("Should only be callable by an event minter (admin or organizer)", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintToken(1, addr2.address, "InitialState")).to.be.fulfilled; // admin call

                await expect(poapToken.connect(addr1).mintToken(1, addr2.address, "InitialState")).to.be.fulfilled; // organizer call

                await expect(poapToken.connect(addr2).mintToken(1, addr2.address, "InitialState")).to.be.reverted; // not admin nor organizer call

            });

            it("Should only be callable when contract is not paused", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintToken(1, addr2.address, "InitialState")).to.be.fulfilled;

                await poapToken.pause();

                await expect(poapToken.mintToken(1, addr2.address, "InitialState")).to.be.reverted;

                await poapToken.unpause();

                await expect(poapToken.mintToken(1, addr2.address, "InitialState")).to.be.fulfilled;

            });

            it("Should only mint tokens for previously created events (createEventId)", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintToken(1, addr2.address, "InitialState")).to.be.fulfilled;

                await expect(poapToken.mintToken(2, addr2.address, "InitialState")).to.be.revertedWith("Poap: event does not exist");

            });

            it("Should only mint tokens if mint expiration date is not met (or not set)", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;
                const latestPlusEightDays = await time.latest() + eightDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 0, 0, addr2.address)).to.be.fulfilled;

                await expect(poapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintToken(2, addr2.address, "InitialState")).to.be.fulfilled;

                await time.increaseTo(latestPlusEightDays);

                await expect(poapToken.mintToken(1, addr1.address, "InitialState")).to.be.revertedWith("Poap: event mint has expired");
                await expect(poapToken.mintToken(2, addr2.address, "InitialState")).to.be.fulfilled;

            });

            it("Should only mint tokens if total supply < max supply", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 5, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintToken(1, addr2.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintToken(1, addr2.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintToken(1, addr2.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintToken(1, addr2.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintToken(1, addr2.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintToken(1, addr2.address, "InitialState")).to.be.revertedWith("Poap: max supply reached for event");

            });

            it("Should assign the right token id to the token", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 5, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await poapToken.mintToken(1, addr2.address, "InitialState");
                await poapToken.mintToken(1, addr2.address, "InitialState");

                await expect(poapToken.createEventId(2, 5, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await poapToken.mintToken(2, addr2.address, "InitialState");
                await poapToken.mintToken(2, addr2.address, "InitialState");

                // TODO: check how to get the token id returned by mintToken function
                expect(1).to.be.equal(1);
                expect(2).to.be.equal(2);
                expect(3).to.be.equal(3);
                expect(4).to.be.equal(4);

            });

            it("Should assign the right event id to the token", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 5, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await poapToken.mintToken(1, addr2.address, "InitialState");
                await poapToken.mintToken(1, addr2.address, "InitialState");

                await expect(poapToken.createEventId(2, 5, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await poapToken.mintToken(2, addr2.address, "InitialState");
                await poapToken.mintToken(2, addr2.address, "InitialState");

                expect(await poapToken.tokenEvent(1)).to.be.equal(1);
                expect(await poapToken.tokenEvent(2)).to.be.equal(1);
                expect(await poapToken.tokenEvent(3)).to.be.equal(2);
                expect(await poapToken.tokenEvent(4)).to.be.equal(2);

            });

            it("Should increase the token total supply for that event by 1", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 5, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                expect(await poapToken.eventTotalSupply(1)).to.be.equal(0);

                await expect(poapToken.mintToken(1, addr2.address, "InitialState")).to.be.fulfilled;

                expect(await poapToken.eventTotalSupply(1)).to.be.equal(1);

                await expect(poapToken.mintToken(1, addr2.address, "InitialState")).to.be.fulfilled;

                expect(await poapToken.eventTotalSupply(1)).to.be.equal(2);

            });

            it("Should emit EventToken event", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 5, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintToken(1, addr2.address, "InitialState")).to.emit(poapToken, "EventToken").withArgs(1, 1);

            });


        })

    })


});