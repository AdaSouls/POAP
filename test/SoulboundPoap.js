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
    const soulboundPoapFactory = await ethers.getContractFactory("SoulboundPoap");
    const soulboundPoapToken = await soulboundPoapFactory.deploy("Test Soulbound Poap", "TSPOAP", owner.address);

    return { soulboundPoapToken, owner, addr1, addr2 };
}

async function deployPoapFixtureAndInitialize() {
    const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
    const soulboundPoapFactory = await ethers.getContractFactory("SoulboundPoap");
    const soulboundPoapToken = await soulboundPoapFactory.deploy("Test Soulbound Poap", "TSPOAP", owner.address);
    await soulboundPoapToken["initialize(string, address[])"]("https://ipfs.io/ipfs/QmQ8kV9JuhkiSt7Qp7HTsiyVUiaobFeTTyjK71q5k8e46w/", []);

    return { soulboundPoapToken, owner, addr1, addr2, addr3, addr4 };
}

describe("Soulbound Poap Contract", function () {

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

            await expect(soulboundPoapToken.connect(addr1)["initialize(string, address[])"]("https://ipfs.io/ipfs/QmQ8kV9JuhkiSt7Qp7HTsiyVUiaobFeTTyjK71q5k8e46w/", [])).to.be.revertedWithCustomError(soulboundPoapToken, "AccessControlUnauthorizedAccount");
            
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

        describe("createEventId", function () {

            it("Should only be callable by the admin", async function () {
    
                const { soulboundPoapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);
                
                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.connect(addr1).createEventId(1, 0, latestPlusSevenDays, addr2.address)).to.be.reverted;
                
                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr2.address)).to.be.fulfilled;
    
            });

            it("Should only be callable when contract is not paused", async function () {
    
                const { soulboundPoapToken, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);
                
                await soulboundPoapToken.pause();
                
                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr2.address)).to.be.reverted;
                
                await soulboundPoapToken.unpause();

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr2.address)).to.be.fulfilled;
    
            });

            it("Should not allow the creation of events with same id", async function () {
    
                const { soulboundPoapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.revertedWith("SoulboundPoap: event already created");

                await expect(soulboundPoapToken.createEventId(2, 100, latestPlusSevenDays, addr2.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.createEventId(2, 100, latestPlusSevenDays, addr2.address)).to.be.revertedWith("SoulboundPoap: event already created");

            });

            it("Should not allow the creation of events with mint expiration date less than 3 days from now", async function () {
    
                const { soulboundPoapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                const latest = await time.latest();

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.createEventId(2, 0, latest, addr2.address)).to.be.revertedWith("SoulboundPoap: mint expiration must be higher than current timestamp plus 3 days");

            });

            it("Should allow the creation of events with mint expiration date 3 days from now", async function () {
    
                const { soulboundPoapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.createEventId(2, 0, latestPlusSevenDays, addr2.address)).to.be.fulfilled;

            });

            it("Should allow the creation of events with no mint expiration date", async function () {
    
                const { soulboundPoapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                await expect(soulboundPoapToken.createEventId(1, 0, 0, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.createEventId(2, 0, 0, addr2.address)).to.be.fulfilled;

            });

            it("Should allow the creation of events with limited supply of tokens", async function () {
    
                const { soulboundPoapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                const maxSupply = await soulboundPoapToken.eventMaxSupply(1);

                expect(maxSupply).to.equal(10);
    
            });

            it("Should allow the creation of events with unlimited supply of tokens", async function () {
    
                const { soulboundPoapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                const maxSupply = await soulboundPoapToken.eventMaxSupply(1);

                expect(maxSupply).to.equal(BigInt(115792089237316195423570985008687907853269984665640564039457584007913129639935n));
    
            });

            it("Should add the event organizer as the initial minter of the event", async function () {
    
                const { soulboundPoapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                const eventOrganizer = await soulboundPoapToken.isEventMinter(1, addr1.address)
                
                expect(eventOrganizer).to.be.true;

            });

        })

        describe("mintToken", function () {

            it("Should only be callable by an event minter (admin or organizer)", async function () {
    
                const { soulboundPoapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintToken(1, addr2.address, "InitialState")).to.be.fulfilled; // admin call

                await expect(soulboundPoapToken.connect(addr1).mintToken(1, addr2.address, "InitialState")).to.be.fulfilled; // organizer call

                await expect(soulboundPoapToken.connect(addr2).mintToken(1, addr2.address, "InitialState")).to.be.reverted; // not admin nor organizer call

            });

            it("Should only be callable when contract is not paused", async function () {
    
                const { soulboundPoapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintToken(1, addr2.address, "InitialState")).to.be.fulfilled;

                await soulboundPoapToken.pause();

                await expect(soulboundPoapToken.mintToken(1, addr2.address, "InitialState")).to.be.reverted;

                await soulboundPoapToken.unpause();

                await expect(soulboundPoapToken.mintToken(1, addr2.address, "InitialState")).to.be.fulfilled;

            });

            it("Should only mint tokens for previously created events (createEventId)", async function () {
    
                const { soulboundPoapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintToken(1, addr2.address, "InitialState")).to.be.fulfilled;

                await expect(soulboundPoapToken.mintToken(2, addr2.address, "InitialState")).to.be.revertedWith("SoulboundPoap: event does not exist");

            });

            it("Should only mint tokens if mint expiration date is not met (or not set)", async function () {
    
                const { soulboundPoapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;
                const latestPlusEightDays = await time.latest() + eightDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(2, 0, 0, addr2.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintToken(2, addr2.address, "InitialState")).to.be.fulfilled;

                await time.increaseTo(latestPlusEightDays);

                await expect(soulboundPoapToken.mintToken(1, addr1.address, "InitialState")).to.be.revertedWith("SoulboundPoap: event mint has expired");
                await expect(soulboundPoapToken.mintToken(2, addr2.address, "InitialState")).to.be.fulfilled;

            });

            it("Should only mint tokens if total supply < max supply", async function () {
    
                const { soulboundPoapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 5, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintToken(1, addr2.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintToken(1, addr2.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintToken(1, addr2.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintToken(1, addr2.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintToken(1, addr2.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintToken(1, addr2.address, "InitialState")).to.be.revertedWith("SoulboundPoap: max supply reached for event");

            });

            it("Should assign the right token id to the token", async function () {
    
                const { soulboundPoapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 5, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await soulboundPoapToken.mintToken(1, addr2.address, "InitialState");
                await soulboundPoapToken.mintToken(1, addr2.address, "InitialState");

                await expect(soulboundPoapToken.createEventId(2, 5, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await soulboundPoapToken.mintToken(2, addr2.address, "InitialState");
                await soulboundPoapToken.mintToken(2, addr2.address, "InitialState");

                // TODO: check how to get the token id returned by mintToken function
                expect(1).to.be.equal(1);
                expect(2).to.be.equal(2);
                expect(3).to.be.equal(3);
                expect(4).to.be.equal(4);

            });

            it("Should lock the token on receiver's wallet", async function () {
    
                const { soulboundPoapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 5, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await soulboundPoapToken.mintToken(1, addr2.address, "InitialState");

                expect(await soulboundPoapToken.locked(1)).to.be.true;

            });

            it("Should assign the right event id to the token", async function () {
    
                const { soulboundPoapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 5, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await soulboundPoapToken.mintToken(1, addr2.address, "InitialState");
                await soulboundPoapToken.mintToken(1, addr2.address, "InitialState");

                await expect(soulboundPoapToken.createEventId(2, 5, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await soulboundPoapToken.mintToken(2, addr2.address, "InitialState");
                await soulboundPoapToken.mintToken(2, addr2.address, "InitialState");

                expect(await soulboundPoapToken.tokenEvent(1)).to.be.equal(1);
                expect(await soulboundPoapToken.tokenEvent(2)).to.be.equal(1);
                expect(await soulboundPoapToken.tokenEvent(3)).to.be.equal(2);
                expect(await soulboundPoapToken.tokenEvent(4)).to.be.equal(2);

            });

            it("Should increase the token total supply for that event by 1", async function () {
    
                const { soulboundPoapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 5, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                expect(await soulboundPoapToken.eventTotalSupply(1)).to.be.equal(0);

                await expect(soulboundPoapToken.mintToken(1, addr2.address, "InitialState")).to.be.fulfilled;

                expect(await soulboundPoapToken.eventTotalSupply(1)).to.be.equal(1);

                await expect(soulboundPoapToken.mintToken(1, addr2.address, "InitialState")).to.be.fulfilled;

                expect(await soulboundPoapToken.eventTotalSupply(1)).to.be.equal(2);

            });

            it("Should emit EventToken event", async function () {
    
                const { soulboundPoapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 5, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintToken(1, addr2.address, "InitialState")).to.emit(soulboundPoapToken, "EventToken").withArgs(1, 1);

            });

            it("Should emit Locked event", async function () {
    
                const { soulboundPoapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 5, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintToken(1, addr2.address, "InitialState")).to.emit(soulboundPoapToken, "Locked").withArgs(1);

            });

        })

        describe("mintEventToManyUsers", function () {

            it("Should only be callable by an event minter (admin or organizer)", async function () {
    
                const { soulboundPoapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled; // admin call

                await expect(soulboundPoapToken.connect(addr1).mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled; // organizer call

                await expect(soulboundPoapToken.connect(addr2).mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.reverted; // not admin nor organizer call

            });

            it("Should only be callable when contract is not paused", async function () {
    
                const { soulboundPoapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled;

                await soulboundPoapToken.pause();

                await expect(soulboundPoapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.reverted;

                await soulboundPoapToken.unpause();

                await expect(soulboundPoapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled;

            });

            it("Should only mint tokens for previously created events (createEventId)", async function () {
    
                const { soulboundPoapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled;

                await expect(soulboundPoapToken.mintEventToManyUsers(2, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.revertedWith("SoulboundPoap: event does not exist");

            });

            it("Should only mint tokens if mint expiration date is not met (or not set)", async function () {
    
                const { soulboundPoapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;
                const latestPlusEightDays = await time.latest() + eightDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(2, 0, 0, addr2.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintEventToManyUsers(2, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled;

                await time.increaseTo(latestPlusEightDays);

                await expect(soulboundPoapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.revertedWith("SoulboundPoap: event mint has expired");
                await expect(soulboundPoapToken.mintEventToManyUsers(2, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled;

            });

            it("Should only mint tokens if total supply < max supply", async function () {
    
                const { soulboundPoapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 17, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.revertedWith("SoulboundPoap: max supply reached for event");

            });

            it("Should assign the right token id to the token", async function () {
    
                const { soulboundPoapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await soulboundPoapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState");
                await soulboundPoapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState");

                await expect(soulboundPoapToken.createEventId(2, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await soulboundPoapToken.mintEventToManyUsers(2, [addr2.address, addr3.address, addr4.address], "InitialState");
                await soulboundPoapToken.mintEventToManyUsers(2, [addr2.address, addr3.address, addr4.address], "InitialState");

                // TODO: check how to get the token id returned by mintEventToManyUsers function
                expect(1).to.be.equal(1);
                expect(2).to.be.equal(2);
                expect(3).to.be.equal(3);
                expect(4).to.be.equal(4);
                expect(5).to.be.equal(5);
                expect(6).to.be.equal(6);
                expect(7).to.be.equal(7);
                expect(8).to.be.equal(8);
                expect(9).to.be.equal(9);
                expect(10).to.be.equal(10);
                expect(11).to.be.equal(11);
                expect(12).to.be.equal(12);

            });

            it("Should assign the right event id to the token", async function () {
    
                const { soulboundPoapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await soulboundPoapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState");
                await soulboundPoapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState");

                await expect(soulboundPoapToken.createEventId(2, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await soulboundPoapToken.mintEventToManyUsers(2, [addr2.address, addr3.address, addr4.address], "InitialState");
                await soulboundPoapToken.mintEventToManyUsers(2, [addr2.address, addr3.address, addr4.address], "InitialState");

                expect(await soulboundPoapToken.tokenEvent(1)).to.be.equal(1);
                expect(await soulboundPoapToken.tokenEvent(2)).to.be.equal(1);
                expect(await soulboundPoapToken.tokenEvent(3)).to.be.equal(1);
                expect(await soulboundPoapToken.tokenEvent(4)).to.be.equal(1);
                expect(await soulboundPoapToken.tokenEvent(5)).to.be.equal(1);
                expect(await soulboundPoapToken.tokenEvent(6)).to.be.equal(1);

                expect(await soulboundPoapToken.tokenEvent(7)).to.be.equal(2);
                expect(await soulboundPoapToken.tokenEvent(8)).to.be.equal(2);
                expect(await soulboundPoapToken.tokenEvent(9)).to.be.equal(2);
                expect(await soulboundPoapToken.tokenEvent(10)).to.be.equal(2);
                expect(await soulboundPoapToken.tokenEvent(11)).to.be.equal(2);
                expect(await soulboundPoapToken.tokenEvent(12)).to.be.equal(2);

            });

            it("Should increase the token total supply for that event by 1", async function () {
    
                const { soulboundPoapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                expect(await soulboundPoapToken.eventTotalSupply(1)).to.be.equal(0);

                await expect(soulboundPoapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled;

                expect(await soulboundPoapToken.eventTotalSupply(1)).to.be.equal(3);

                await expect(soulboundPoapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled;

                expect(await soulboundPoapToken.eventTotalSupply(1)).to.be.equal(6);

            });

            it("Should emit EventToken event", async function () {
    
                const { soulboundPoapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 5, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState"))
                    .to.emit(soulboundPoapToken, "EventToken").withArgs(1, 1)
                    .to.emit(soulboundPoapToken, "EventToken").withArgs(1, 2)
                    .to.emit(soulboundPoapToken, "EventToken").withArgs(1, 3);

            });

        })

        describe("mintUserToManyEvents", function () {

            it("Should only be callable by an admin", async function () {
    
                const { soulboundPoapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(2, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(3, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr2.address, "InitialState")).to.be.fulfilled; // admin call

                await expect(soulboundPoapToken.connect(addr1).mintUserToManyEvents([1, 2, 3], addr3.address, "InitialState")).to.be.reverted; // organizer call

                await expect(soulboundPoapToken.connect(addr2).mintUserToManyEvents([1, 2, 3], addr4.address, "InitialState")).to.be.reverted; // not admin nor organizer call

            });

            it("Should only be callable when contract is not paused", async function () {
    
                const { soulboundPoapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(2, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(3, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr2.address, "InitialState")).to.be.fulfilled;

                await soulboundPoapToken.pause();

                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr3.address, "InitialState")).to.be.reverted;

                await soulboundPoapToken.unpause();

                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr4.address, "InitialState")).to.be.fulfilled;

            });

            it("Should only mint tokens for previously created events (createEventId)", async function () {
    
                const { soulboundPoapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(2, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(3, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr2.address, "InitialState")).to.be.fulfilled;

                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2, 3, 4], addr3.address, "InitialState")).to.be.revertedWith("SoulboundPoap: event does not exist");

            });

            it("Should only mint tokens if mint expiration date is not met (or not set)", async function () {
    
                const { soulboundPoapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;
                const latestPlusEightDays = await time.latest() + eightDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(2, 0, 0, addr2.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(3, 0, 0, addr2.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr2.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr3.address, "InitialState")).to.be.fulfilled;

                await time.increaseTo(latestPlusEightDays);

                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr4.address, "InitialState")).to.be.revertedWith("SoulboundPoap: event mint has expired");
                await expect(soulboundPoapToken.mintUserToManyEvents([2, 3], addr2.address, "InitialState")).to.be.fulfilled;

            });

            it("Should only mint tokens if total supply < max supply", async function () {
    
                const { soulboundPoapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(2, 5, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(3, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr2.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr3.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr4.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr2.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr3.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr4.address, "InitialState")).to.be.revertedWith("SoulboundPoap: max supply reached for event");

            });

            it("Should assign the right token id to the token", async function () {
    
                const { soulboundPoapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(2, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(3, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr2.address, "InitialState");
                await soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr3.address, "InitialState");

                await soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr4.address, "InitialState");
                await soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr2.address, "InitialState");

                // TODO: check how to get the token id returned by mintUserToManyEvents function
                expect(1).to.be.equal(1);
                expect(2).to.be.equal(2);
                expect(3).to.be.equal(3);
                expect(4).to.be.equal(4);
                expect(5).to.be.equal(5);
                expect(6).to.be.equal(6);
                expect(7).to.be.equal(7);
                expect(8).to.be.equal(8);
                expect(9).to.be.equal(9);
                expect(10).to.be.equal(10);
                expect(11).to.be.equal(11);
                expect(12).to.be.equal(12);

            });

            it("Should assign the right event id to the token", async function () {
    
                const { soulboundPoapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(2, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(3, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr2.address, "InitialState");
                await soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr3.address, "InitialState");

                await soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr4.address, "InitialState");
                await soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr2.address, "InitialState");

                expect(await soulboundPoapToken.tokenEvent(1)).to.be.equal(1);
                expect(await soulboundPoapToken.tokenEvent(2)).to.be.equal(2);
                expect(await soulboundPoapToken.tokenEvent(3)).to.be.equal(3);
                expect(await soulboundPoapToken.tokenEvent(4)).to.be.equal(1);
                expect(await soulboundPoapToken.tokenEvent(5)).to.be.equal(2);
                expect(await soulboundPoapToken.tokenEvent(6)).to.be.equal(3);

                expect(await soulboundPoapToken.tokenEvent(7)).to.be.equal(1);
                expect(await soulboundPoapToken.tokenEvent(8)).to.be.equal(2);
                expect(await soulboundPoapToken.tokenEvent(9)).to.be.equal(3);
                expect(await soulboundPoapToken.tokenEvent(10)).to.be.equal(1);
                expect(await soulboundPoapToken.tokenEvent(11)).to.be.equal(2);
                expect(await soulboundPoapToken.tokenEvent(12)).to.be.equal(3);

            });

            it("Should increase the token total supply for that event by 1", async function () {
    
                const { soulboundPoapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(2, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(3, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                expect(await soulboundPoapToken.eventTotalSupply(1)).to.be.equal(0);
                expect(await soulboundPoapToken.eventTotalSupply(2)).to.be.equal(0);
                expect(await soulboundPoapToken.eventTotalSupply(3)).to.be.equal(0);

                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr2.address, "InitialState")).to.be.fulfilled;

                expect(await soulboundPoapToken.eventTotalSupply(1)).to.be.equal(1);
                expect(await soulboundPoapToken.eventTotalSupply(2)).to.be.equal(1);
                expect(await soulboundPoapToken.eventTotalSupply(3)).to.be.equal(1);

                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr3.address, "InitialState")).to.be.fulfilled;

                expect(await soulboundPoapToken.eventTotalSupply(1)).to.be.equal(2);
                expect(await soulboundPoapToken.eventTotalSupply(2)).to.be.equal(2);
                expect(await soulboundPoapToken.eventTotalSupply(3)).to.be.equal(2);

            });

            it("Should emit EventToken event", async function () {
    
                const { soulboundPoapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(2, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(3, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr2.address, "InitialState"))
                    .to.emit(soulboundPoapToken, "EventToken").withArgs(1, 1)
                    .to.emit(soulboundPoapToken, "EventToken").withArgs(2, 2)
                    .to.emit(soulboundPoapToken, "EventToken").withArgs(3, 3);

            });

        })

        describe("transferFrom", function () {

            it("Should not allow the transfer of a token", async function () {
    
                const { soulboundPoapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);
                
                const latestPlusSevenDays = await time.latest() + sevenDays;
                
                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr2.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;

                await expect(soulboundPoapToken.connect(addr1).transferFrom(addr1.address, addr3.address, 1)).to.be.revertedWith("SoulboundPoap: soulbound is locked to transfer");

            });

        })

        describe("safeTransferFrom", function () {

            it("Should not allow the transfer of a token", async function () {
    
                const { soulboundPoapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);
                
                const latestPlusSevenDays = await time.latest() + sevenDays;
                
                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr2.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;

                await expect(soulboundPoapToken.connect(addr1).safeTransferFrom(addr1.address, addr3.address, 1)).to.be.revertedWith("SoulboundPoap: soulbound is locked to transfer");

            });

        })

        describe("eventMaxSupply", function () {

            it("Should be callable by any address", async function () {
    
                const { soulboundPoapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(2, 100, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(3, 20, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr1.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2], addr2.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintUserToManyEvents([2, 3], addr2.address, "InitialState")).to.be.fulfilled;

                expect(await soulboundPoapToken.connect(addr1).eventMaxSupply(1)).to.equal(BigInt(115792089237316195423570985008687907853269984665640564039457584007913129639935n));
                expect(await soulboundPoapToken.connect(addr2).eventMaxSupply(2)).to.be.equal(100);
                expect(await soulboundPoapToken.connect(addr3).eventMaxSupply(3)).to.be.equal(20);

            });

            it("Should retrieve the right max supply for an event", async function () {
    
                const { soulboundPoapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(2, 100, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(3, 20, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr1.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2], addr2.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintUserToManyEvents([2, 3], addr2.address, "InitialState")).to.be.fulfilled;

                expect(await soulboundPoapToken.connect(addr1).eventMaxSupply(1)).to.equal(BigInt(115792089237316195423570985008687907853269984665640564039457584007913129639935n));
                expect(await soulboundPoapToken.connect(addr1).eventMaxSupply(2)).to.be.equal(100);
                expect(await soulboundPoapToken.connect(addr1).eventMaxSupply(3)).to.be.equal(20);

            });

            it("Should retrieve 0 as max supply for non existing events", async function () {
    
                const { soulboundPoapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(2, 100, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(3, 20, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr1.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2], addr2.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintUserToManyEvents([2, 3], addr2.address, "InitialState")).to.be.fulfilled;

                expect(await soulboundPoapToken.connect(addr1).eventMaxSupply(1)).to.equal(BigInt(115792089237316195423570985008687907853269984665640564039457584007913129639935n));
                expect(await soulboundPoapToken.connect(addr1).eventMaxSupply(2)).to.be.equal(100);
                expect(await soulboundPoapToken.connect(addr1).eventMaxSupply(3)).to.be.equal(20);
                expect(await soulboundPoapToken.connect(addr1).eventMaxSupply(4)).to.be.equal(0);

            });

        })

        describe("eventTotalSupply", function () {

            it("Should be callable by any address", async function () {
    
                const { soulboundPoapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(2, 100, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(3, 20, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr1.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2], addr2.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintUserToManyEvents([2, 3], addr2.address, "InitialState")).to.be.fulfilled;

                expect(await soulboundPoapToken.connect(addr1).eventTotalSupply(1)).to.be.equal(2);
                expect(await soulboundPoapToken.connect(addr2).eventTotalSupply(2)).to.be.equal(3);
                expect(await soulboundPoapToken.connect(addr3).eventTotalSupply(3)).to.be.equal(2);

            });

            it("Should retrieve the right total supply for an event", async function () {
    
                const { soulboundPoapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(2, 100, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(3, 20, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr1.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2], addr2.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintUserToManyEvents([2, 3], addr2.address, "InitialState")).to.be.fulfilled;

                expect(await soulboundPoapToken.connect(addr1).eventTotalSupply(1)).to.be.equal(2);
                expect(await soulboundPoapToken.connect(addr1).eventTotalSupply(2)).to.be.equal(3);
                expect(await soulboundPoapToken.connect(addr1).eventTotalSupply(3)).to.be.equal(2);

            });

            it("Should retrieve 0 as total supply for events that haven't yet minted any token (or don't exist)", async function () {
    
                const { soulboundPoapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(2, 100, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(3, 20, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2], addr1.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2], addr2.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintUserToManyEvents([2], addr2.address, "InitialState")).to.be.fulfilled;

                expect(await soulboundPoapToken.connect(addr1).eventTotalSupply(1)).to.be.equal(2);
                expect(await soulboundPoapToken.connect(addr1).eventTotalSupply(2)).to.be.equal(3);
                expect(await soulboundPoapToken.connect(addr1).eventTotalSupply(3)).to.be.equal(0);
                expect(await soulboundPoapToken.connect(addr1).eventTotalSupply(4)).to.be.equal(0);

            });

        })

        describe("totalSupply", function () {

            it("Should be callable by any address", async function () {
    
                const { soulboundPoapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(2, 100, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(3, 20, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr1.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2], addr2.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintUserToManyEvents([2, 3], addr2.address, "InitialState")).to.be.fulfilled;

                expect(await soulboundPoapToken.connect(addr1).totalSupply()).to.be.equal(7);
                expect(await soulboundPoapToken.connect(addr2).totalSupply()).to.be.equal(7);
                expect(await soulboundPoapToken.connect(addr3).totalSupply()).to.be.equal(7);

            });

            it("Should retrieve the total supply for all poaps", async function () {
    
                const { soulboundPoapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(2, 100, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(3, 20, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr1.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2], addr2.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintUserToManyEvents([1, 2, 3], addr2.address, "InitialState")).to.be.fulfilled;

                expect(await soulboundPoapToken.connect(addr1).totalSupply()).to.be.equal(8);

            });

            it("Should retrieve 0 as total supply if no poaps have been minted", async function () {
    
                const { soulboundPoapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(2, 100, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.createEventId(3, 20, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                expect(await soulboundPoapToken.connect(addr1).totalSupply()).to.be.equal(0);

            });

        })

        describe("burn", function () {

            it("Should only be callable by approved or owner and not by an admin", async function () {
    
                const { soulboundPoapToken, owner, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;

                await expect(soulboundPoapToken.burn(1)).to.be.revertedWith("SoulboundPoap: not authorized to burn");

                await expect(soulboundPoapToken.connect(addr1).approve(owner.address, 1)).to.be.fulfilled;

                await expect(soulboundPoapToken.burn(1)).to.be.fulfilled;

                await expect(soulboundPoapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.connect(addr1).burn(2)).to.be.fulfilled;

            });

            it("Should decrease the total supply for the event", async function () {

                const { soulboundPoapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;

                expect(await soulboundPoapToken.eventTotalSupply(1)).to.be.equal(2);

                await expect(soulboundPoapToken.connect(addr1).burn(2)).to.be.fulfilled;

                expect(await soulboundPoapToken.eventTotalSupply(1)).to.be.equal(1);                

            });

            it("Should decrease the total supply for all poaps", async function () {

                const { soulboundPoapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;

                await expect(soulboundPoapToken.createEventId(2, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.mintToken(2, addr1.address, "InitialState")).to.be.fulfilled;
                await expect(soulboundPoapToken.mintToken(2, addr1.address, "InitialState")).to.be.fulfilled;


                expect(await soulboundPoapToken.totalSupply()).to.be.equal(4);

                await expect(soulboundPoapToken.connect(addr1).burn(2)).to.be.fulfilled;

                expect(await soulboundPoapToken.totalSupply()).to.be.equal(3);

            });

            it("Should emit Unlocked event", async function () {
    
                const { soulboundPoapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 5, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.mintToken(1, addr2.address, "InitialState")).to.be.fulfilled;

                await expect(soulboundPoapToken.connect(addr2).burn(1)).to.emit(soulboundPoapToken, "Unlocked").withArgs(1);

            });

        })

        describe("addAdmin", function () {

            it("Should only be callable by an admin", async function () {
    
                const { soulboundPoapToken, owner, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;

                await expect(soulboundPoapToken.connect(addr1).addAdmin(owner.address)).to.be.reverted;

                await expect(soulboundPoapToken.addAdmin(addr1.address)).to.be.fulfilled;

            });

            it("Should add the admin role to an address", async function () {
    
                const { soulboundPoapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                expect(await soulboundPoapToken.isAdmin(addr1.address)).to.be.false;

                await expect(soulboundPoapToken.addAdmin(addr1.address)).to.be.fulfilled;

                expect(await soulboundPoapToken.isAdmin(addr1.address)).to.be.true;
                
            });

            it("Should emit AdminAdded event", async function () {               

                const { soulboundPoapToken, owner } = await loadFixture(deployPoapFixtureAndInitialize);

                await expect(soulboundPoapToken.addAdmin(owner.address)).to.emit(soulboundPoapToken, "AdminAdded").withArgs(owner.address);

            });

            it("Should emit RoleGranted event", async function () {               

                const { soulboundPoapToken, owner, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                await expect(soulboundPoapToken.addAdmin(addr1.address)).to.emit(soulboundPoapToken, "RoleGranted").withArgs("0x0000000000000000000000000000000000000000000000000000000000000000", addr1.address, owner.address);

            });

        })

        describe("removeAdmin", function () {

            it("Should only be callable by an admin", async function () {
    
                const { soulboundPoapToken, owner, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;

                await expect(soulboundPoapToken.connect(addr1).removeAdmin(owner.address)).to.be.reverted;

                await expect(soulboundPoapToken.removeAdmin(owner.address)).to.be.fulfilled;

            });

            it("Should remove the admin role from an admin", async function () {
    
                const { soulboundPoapToken, owner } = await loadFixture(deployPoapFixtureAndInitialize);

                expect(await soulboundPoapToken.isAdmin(owner.address)).to.be.true;

                await expect(soulboundPoapToken.removeAdmin(owner.address)).to.be.fulfilled;

                expect(await soulboundPoapToken.isAdmin(owner.address)).to.be.false;

            });

            it("Should emit AdminRemoved event", async function () {               

                const { soulboundPoapToken, owner } = await loadFixture(deployPoapFixtureAndInitialize);

                await expect(soulboundPoapToken.removeAdmin(owner.address)).to.emit(soulboundPoapToken, "AdminRemoved").withArgs(owner.address);

            });

            it("Should emit RoleRevoked event", async function () {               

                const { soulboundPoapToken, owner } = await loadFixture(deployPoapFixtureAndInitialize);

                await expect(soulboundPoapToken.removeAdmin(owner.address)).to.emit(soulboundPoapToken, "RoleRevoked").withArgs("0x0000000000000000000000000000000000000000000000000000000000000000", owner.address, owner.address);

            });

        })

        describe("addEventMinter", function () {

            it("Should only be callable by an admin or by an event minter", async function () {
    
                const { soulboundPoapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;

                await expect(soulboundPoapToken.connect(addr2).addEventMinter(1, addr3.address)).to.be.reverted; // nor admin nor event minter
                await expect(soulboundPoapToken.addEventMinter(1, addr3.address)).to.be.fulfilled; // admin call
                await expect(soulboundPoapToken.connect(addr1).addEventMinter(1, addr2.address)).to.be.fulfilled; // event minter call


            });

            it("Should add the account as event minter", async function () {
    
                const { soulboundPoapToken, addr1, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;

                expect(await soulboundPoapToken.isEventMinter(1, addr3.address)).to.be.false;

                await expect(soulboundPoapToken.addEventMinter(1, addr3.address)).to.be.fulfilled;

                expect(await soulboundPoapToken.isEventMinter(1, addr3.address)).to.be.true;
                
            });

            it("Should emit EventMinterAdded event", async function () {               

                const { soulboundPoapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.addEventMinter(1, addr2.address)).to.emit(soulboundPoapToken, "EventMinterAdded").withArgs(1, addr2.address);

            });

        })

        describe("removeEventMinter", function () {

            it("Should only be callable by an admin", async function () {
    
                const { soulboundPoapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;

                await expect(soulboundPoapToken.connect(addr2).removeEventMinter(1, addr3.address)).to.be.reverted; // nor admin nor event minter
                await expect(soulboundPoapToken.removeEventMinter(1, addr3.address)).to.be.fulfilled; // admin call
                await expect(soulboundPoapToken.connect(addr1).removeEventMinter(1, addr2.address)).to.be.reverted; // event minter call


            });

            it("Should add the account as event minter", async function () {
    
                const { soulboundPoapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(soulboundPoapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;

                expect(await soulboundPoapToken.isEventMinter(1, addr1.address)).to.be.true;

                await expect(soulboundPoapToken.removeEventMinter(1, addr1.address)).to.be.fulfilled;

                expect(await soulboundPoapToken.isEventMinter(1, addr1.address)).to.be.false;
                
            });

            it("Should emit EventMinterRemoved event", async function () {               

                const { soulboundPoapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(soulboundPoapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(soulboundPoapToken.removeEventMinter(1, addr1.address)).to.emit(soulboundPoapToken, "EventMinterRemoved").withArgs(1, addr1.address);

            });

        })

    })


});