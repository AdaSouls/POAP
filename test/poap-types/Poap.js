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
    const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
    const poapFactory = await ethers.getContractFactory("Poap");
    const poapToken = await poapFactory.deploy("Test Poap", "TPOAP", owner.address);
    await poapToken["initialize(string, address[])"]("https://ipfs.io/ipfs/QmQ8kV9JuhkiSt7Qp7HTsiyVUiaobFeTTyjK71q5k8e46w/", []);

    return { poapToken, owner, addr1, addr2, addr3, addr4 };
}

describe("Poap Contract", function () {

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

        describe("mintEventToManyUsers", function () {

            it("Should only be callable by an event minter (admin or organizer)", async function () {
    
                const { poapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled; // admin call

                await expect(poapToken.connect(addr1).mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled; // organizer call

                await expect(poapToken.connect(addr2).mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.reverted; // not admin nor organizer call

            });

            it("Should only be callable when contract is not paused", async function () {
    
                const { poapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled;

                await poapToken.pause();

                await expect(poapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.reverted;

                await poapToken.unpause();

                await expect(poapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled;

            });

            it("Should only mint tokens for previously created events (createEventId)", async function () {
    
                const { poapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled;

                await expect(poapToken.mintEventToManyUsers(2, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.revertedWith("Poap: event does not exist");

            });

            it("Should only mint tokens if mint expiration date is not met (or not set)", async function () {
    
                const { poapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;
                const latestPlusEightDays = await time.latest() + eightDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 0, 0, addr2.address)).to.be.fulfilled;

                await expect(poapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintEventToManyUsers(2, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled;

                await time.increaseTo(latestPlusEightDays);

                await expect(poapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.revertedWith("Poap: event mint has expired");
                await expect(poapToken.mintEventToManyUsers(2, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled;

            });

            it("Should only mint tokens if total supply < max supply", async function () {
    
                const { poapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 17, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.revertedWith("Poap: max supply reached for event");

            });

            it("Should assign the right token id to the token", async function () {
    
                const { poapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await poapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState");
                await poapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState");

                await expect(poapToken.createEventId(2, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await poapToken.mintEventToManyUsers(2, [addr2.address, addr3.address, addr4.address], "InitialState");
                await poapToken.mintEventToManyUsers(2, [addr2.address, addr3.address, addr4.address], "InitialState");

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
    
                const { poapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await poapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState");
                await poapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState");

                await expect(poapToken.createEventId(2, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await poapToken.mintEventToManyUsers(2, [addr2.address, addr3.address, addr4.address], "InitialState");
                await poapToken.mintEventToManyUsers(2, [addr2.address, addr3.address, addr4.address], "InitialState");

                expect(await poapToken.tokenEvent(1)).to.be.equal(1);
                expect(await poapToken.tokenEvent(2)).to.be.equal(1);
                expect(await poapToken.tokenEvent(3)).to.be.equal(1);
                expect(await poapToken.tokenEvent(4)).to.be.equal(1);
                expect(await poapToken.tokenEvent(5)).to.be.equal(1);
                expect(await poapToken.tokenEvent(6)).to.be.equal(1);

                expect(await poapToken.tokenEvent(7)).to.be.equal(2);
                expect(await poapToken.tokenEvent(8)).to.be.equal(2);
                expect(await poapToken.tokenEvent(9)).to.be.equal(2);
                expect(await poapToken.tokenEvent(10)).to.be.equal(2);
                expect(await poapToken.tokenEvent(11)).to.be.equal(2);
                expect(await poapToken.tokenEvent(12)).to.be.equal(2);

            });

            it("Should increase the token total supply for that event by 1", async function () {
    
                const { poapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                expect(await poapToken.eventTotalSupply(1)).to.be.equal(0);

                await expect(poapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled;

                expect(await poapToken.eventTotalSupply(1)).to.be.equal(3);

                await expect(poapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState")).to.be.fulfilled;

                expect(await poapToken.eventTotalSupply(1)).to.be.equal(6);

            });

            it("Should emit EventToken event", async function () {
    
                const { poapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 5, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintEventToManyUsers(1, [addr2.address, addr3.address, addr4.address], "InitialState"))
                    .to.emit(poapToken, "EventToken").withArgs(1, 1)
                    .to.emit(poapToken, "EventToken").withArgs(1, 2)
                    .to.emit(poapToken, "EventToken").withArgs(1, 3);

            });

        })

        describe("mintUserToManyEvents", function () {

            it("Should only be callable by an admin", async function () {
    
                const { poapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], addr2.address, "InitialState")).to.be.fulfilled; // admin call

                await expect(poapToken.connect(addr1).mintUserToManyEvents([1, 2, 3], addr3.address, "InitialState")).to.be.reverted; // organizer call

                await expect(poapToken.connect(addr2).mintUserToManyEvents([1, 2, 3], addr4.address, "InitialState")).to.be.reverted; // not admin nor organizer call

            });

            it("Should only be callable when contract is not paused", async function () {
    
                const { poapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], addr2.address, "InitialState")).to.be.fulfilled;

                await poapToken.pause();

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], addr3.address, "InitialState")).to.be.reverted;

                await poapToken.unpause();

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], addr4.address, "InitialState")).to.be.fulfilled;

            });

            it("Should only mint tokens for previously created events (createEventId)", async function () {
    
                const { poapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], addr2.address, "InitialState")).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3, 4], addr3.address, "InitialState")).to.be.revertedWith("Poap: event does not exist");

            });

            it("Should only mint tokens if mint expiration date is not met (or not set)", async function () {
    
                const { poapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;
                const latestPlusEightDays = await time.latest() + eightDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 0, 0, addr2.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 0, 0, addr2.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], addr2.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2, 3], addr3.address, "InitialState")).to.be.fulfilled;

                await time.increaseTo(latestPlusEightDays);

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], addr4.address, "InitialState")).to.be.revertedWith("Poap: event mint has expired");
                await expect(poapToken.mintUserToManyEvents([2, 3], addr2.address, "InitialState")).to.be.fulfilled;

            });

            it("Should only mint tokens if total supply < max supply", async function () {
    
                const { poapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 5, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], addr2.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2, 3], addr3.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2, 3], addr4.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2, 3], addr2.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2, 3], addr3.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2, 3], addr4.address, "InitialState")).to.be.revertedWith("Poap: max supply reached for event");

            });

            it("Should assign the right token id to the token", async function () {
    
                const { poapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await poapToken.mintUserToManyEvents([1, 2, 3], addr2.address, "InitialState");
                await poapToken.mintUserToManyEvents([1, 2, 3], addr3.address, "InitialState");

                await poapToken.mintUserToManyEvents([1, 2, 3], addr4.address, "InitialState");
                await poapToken.mintUserToManyEvents([1, 2, 3], addr2.address, "InitialState");

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
    
                const { poapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await poapToken.mintUserToManyEvents([1, 2, 3], addr2.address, "InitialState");
                await poapToken.mintUserToManyEvents([1, 2, 3], addr3.address, "InitialState");

                await poapToken.mintUserToManyEvents([1, 2, 3], addr4.address, "InitialState");
                await poapToken.mintUserToManyEvents([1, 2, 3], addr2.address, "InitialState");

                expect(await poapToken.tokenEvent(1)).to.be.equal(1);
                expect(await poapToken.tokenEvent(2)).to.be.equal(2);
                expect(await poapToken.tokenEvent(3)).to.be.equal(3);
                expect(await poapToken.tokenEvent(4)).to.be.equal(1);
                expect(await poapToken.tokenEvent(5)).to.be.equal(2);
                expect(await poapToken.tokenEvent(6)).to.be.equal(3);

                expect(await poapToken.tokenEvent(7)).to.be.equal(1);
                expect(await poapToken.tokenEvent(8)).to.be.equal(2);
                expect(await poapToken.tokenEvent(9)).to.be.equal(3);
                expect(await poapToken.tokenEvent(10)).to.be.equal(1);
                expect(await poapToken.tokenEvent(11)).to.be.equal(2);
                expect(await poapToken.tokenEvent(12)).to.be.equal(3);

            });

            it("Should increase the token total supply for that event by 1", async function () {
    
                const { poapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                expect(await poapToken.eventTotalSupply(1)).to.be.equal(0);
                expect(await poapToken.eventTotalSupply(2)).to.be.equal(0);
                expect(await poapToken.eventTotalSupply(3)).to.be.equal(0);

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], addr2.address, "InitialState")).to.be.fulfilled;

                expect(await poapToken.eventTotalSupply(1)).to.be.equal(1);
                expect(await poapToken.eventTotalSupply(2)).to.be.equal(1);
                expect(await poapToken.eventTotalSupply(3)).to.be.equal(1);

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], addr3.address, "InitialState")).to.be.fulfilled;

                expect(await poapToken.eventTotalSupply(1)).to.be.equal(2);
                expect(await poapToken.eventTotalSupply(2)).to.be.equal(2);
                expect(await poapToken.eventTotalSupply(3)).to.be.equal(2);

            });

            it("Should emit EventToken event", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 6, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], addr2.address, "InitialState"))
                    .to.emit(poapToken, "EventToken").withArgs(1, 1)
                    .to.emit(poapToken, "EventToken").withArgs(2, 2)
                    .to.emit(poapToken, "EventToken").withArgs(3, 3);

            });

        })

        describe("eventMaxSupply", function () {

            it("Should be callable by any address", async function () {
    
                const { poapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 100, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 20, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], addr1.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2], addr2.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([2, 3], addr2.address, "InitialState")).to.be.fulfilled;

                expect(await poapToken.connect(addr1).eventMaxSupply(1)).to.equal(BigInt(115792089237316195423570985008687907853269984665640564039457584007913129639935n));
                expect(await poapToken.connect(addr2).eventMaxSupply(2)).to.be.equal(100);
                expect(await poapToken.connect(addr3).eventMaxSupply(3)).to.be.equal(20);

            });

            it("Should retrieve the right max supply for an event", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 100, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 20, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], addr1.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2], addr2.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([2, 3], addr2.address, "InitialState")).to.be.fulfilled;

                expect(await poapToken.connect(addr1).eventMaxSupply(1)).to.equal(BigInt(115792089237316195423570985008687907853269984665640564039457584007913129639935n));
                expect(await poapToken.connect(addr1).eventMaxSupply(2)).to.be.equal(100);
                expect(await poapToken.connect(addr1).eventMaxSupply(3)).to.be.equal(20);

            });

            it("Should retrieve 0 as max supply for non existing events", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 100, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 20, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], addr1.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2], addr2.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([2, 3], addr2.address, "InitialState")).to.be.fulfilled;

                expect(await poapToken.connect(addr1).eventMaxSupply(1)).to.equal(BigInt(115792089237316195423570985008687907853269984665640564039457584007913129639935n));
                expect(await poapToken.connect(addr1).eventMaxSupply(2)).to.be.equal(100);
                expect(await poapToken.connect(addr1).eventMaxSupply(3)).to.be.equal(20);
                expect(await poapToken.connect(addr1).eventMaxSupply(4)).to.be.equal(0);

            });

        })

        describe("eventTotalSupply", function () {

            it("Should be callable by any address", async function () {
    
                const { poapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 100, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 20, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], addr1.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2], addr2.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([2, 3], addr2.address, "InitialState")).to.be.fulfilled;

                expect(await poapToken.connect(addr1).eventTotalSupply(1)).to.be.equal(2);
                expect(await poapToken.connect(addr2).eventTotalSupply(2)).to.be.equal(3);
                expect(await poapToken.connect(addr3).eventTotalSupply(3)).to.be.equal(2);

            });

            it("Should retrieve the right total supply for an event", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 100, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 20, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], addr1.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2], addr2.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([2, 3], addr2.address, "InitialState")).to.be.fulfilled;

                expect(await poapToken.connect(addr1).eventTotalSupply(1)).to.be.equal(2);
                expect(await poapToken.connect(addr1).eventTotalSupply(2)).to.be.equal(3);
                expect(await poapToken.connect(addr1).eventTotalSupply(3)).to.be.equal(2);

            });

            it("Should retrieve 0 as total supply for events that haven't yet minted any token (or don't exist)", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 100, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 20, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2], addr1.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2], addr2.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([2], addr2.address, "InitialState")).to.be.fulfilled;

                expect(await poapToken.connect(addr1).eventTotalSupply(1)).to.be.equal(2);
                expect(await poapToken.connect(addr1).eventTotalSupply(2)).to.be.equal(3);
                expect(await poapToken.connect(addr1).eventTotalSupply(3)).to.be.equal(0);
                expect(await poapToken.connect(addr1).eventTotalSupply(4)).to.be.equal(0);

            });

        })

        describe("totalSupply", function () {

            it("Should be callable by any address", async function () {
    
                const { poapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 100, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 20, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], addr1.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2], addr2.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([2, 3], addr2.address, "InitialState")).to.be.fulfilled;

                expect(await poapToken.connect(addr1).totalSupply()).to.be.equal(7);
                expect(await poapToken.connect(addr2).totalSupply()).to.be.equal(7);
                expect(await poapToken.connect(addr3).totalSupply()).to.be.equal(7);

            });

            it("Should retrieve the total supply for all poaps", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 100, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 20, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], addr1.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2], addr2.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2, 3], addr2.address, "InitialState")).to.be.fulfilled;

                expect(await poapToken.connect(addr1).totalSupply()).to.be.equal(8);

            });

            it("Should retrieve 0 as total supply if no poaps have been minted", async function () {
    
                const { poapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 100, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 20, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                expect(await poapToken.connect(addr1).totalSupply()).to.be.equal(0);

            });

        })

        describe("burn", function () {

            it("Should only be callable by approved or owner and not by an admin", async function () {
    
                const { poapToken, owner, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;

                await expect(poapToken.burn(1)).to.be.revertedWith("Poap: not authorized to burn");

                await expect(poapToken.connect(addr1).approve(owner.address, 1)).to.be.fulfilled;

                await expect(poapToken.burn(1)).to.be.fulfilled;

                await expect(poapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.connect(addr1).burn(2)).to.be.fulfilled;

            });

            it("Should decrease the total supply for the event", async function () {

                const { poapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;

                expect(await poapToken.eventTotalSupply(1)).to.be.equal(2);

                await expect(poapToken.connect(addr1).burn(2)).to.be.fulfilled;

                expect(await poapToken.eventTotalSupply(1)).to.be.equal(1);                

            });

            it("Should decrease the total supply for all poaps", async function () {

                const { poapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;

                await expect(poapToken.createEventId(2, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(2, addr1.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.mintToken(2, addr1.address, "InitialState")).to.be.fulfilled;


                expect(await poapToken.totalSupply()).to.be.equal(4);

                await expect(poapToken.connect(addr1).burn(2)).to.be.fulfilled;

                expect(await poapToken.totalSupply()).to.be.equal(3);

            });

        })

        describe("addAdmin", function () {

            it("Should only be callable by an admin", async function () {
    
                const { poapToken, owner, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;

                await expect(poapToken.connect(addr1).addAdmin(owner.address)).to.be.reverted;

                await expect(poapToken.addAdmin(addr1.address)).to.be.fulfilled;

            });

            it("Should add the admin role to an address", async function () {
    
                const { poapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                expect(await poapToken.isAdmin(addr1.address)).to.be.false;

                await expect(poapToken.addAdmin(addr1.address)).to.be.fulfilled;

                expect(await poapToken.isAdmin(addr1.address)).to.be.true;
                
            });

            it("Should emit AdminAdded event", async function () {               

                const { poapToken, owner } = await loadFixture(deployPoapFixtureAndInitialize);

                await expect(poapToken.addAdmin(owner.address)).to.emit(poapToken, "AdminAdded").withArgs(owner.address);

            });

            it("Should emit RoleGranted event", async function () {               

                const { poapToken, owner, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                await expect(poapToken.addAdmin(addr1.address)).to.emit(poapToken, "RoleGranted").withArgs("0x0000000000000000000000000000000000000000000000000000000000000000", addr1.address, owner.address);

            });

        })

        describe("removeAdmin", function () {

            it("Should only be callable by an admin", async function () {
    
                const { poapToken, owner, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;

                await expect(poapToken.connect(addr1).removeAdmin(owner.address)).to.be.reverted;

                await expect(poapToken.removeAdmin(owner.address)).to.be.fulfilled;

            });

            it("Should remove the admin role from an admin", async function () {
    
                const { poapToken, owner } = await loadFixture(deployPoapFixtureAndInitialize);

                expect(await poapToken.isAdmin(owner.address)).to.be.true;

                await expect(poapToken.removeAdmin(owner.address)).to.be.fulfilled;

                expect(await poapToken.isAdmin(owner.address)).to.be.false;

            });

            it("Should emit AdminRemoved event", async function () {               

                const { poapToken, owner } = await loadFixture(deployPoapFixtureAndInitialize);

                await expect(poapToken.removeAdmin(owner.address)).to.emit(poapToken, "AdminRemoved").withArgs(owner.address);

            });

            it("Should emit RoleRevoked event", async function () {               

                const { poapToken, owner } = await loadFixture(deployPoapFixtureAndInitialize);

                await expect(poapToken.removeAdmin(owner.address)).to.emit(poapToken, "RoleRevoked").withArgs("0x0000000000000000000000000000000000000000000000000000000000000000", owner.address, owner.address);

            });

        })

        describe("addEventMinter", function () {

            it("Should only be callable by an admin or by an event minter", async function () {
    
                const { poapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;

                await expect(poapToken.connect(addr2).addEventMinter(1, addr3.address)).to.be.reverted; // nor admin nor event minter
                await expect(poapToken.addEventMinter(1, addr3.address)).to.be.fulfilled; // admin call
                await expect(poapToken.connect(addr1).addEventMinter(1, addr2.address)).to.be.fulfilled; // event minter call


            });

            it("Should add the account as event minter", async function () {
    
                const { poapToken, addr1, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;

                expect(await poapToken.isEventMinter(1, addr3.address)).to.be.false;

                await expect(poapToken.addEventMinter(1, addr3.address)).to.be.fulfilled;

                expect(await poapToken.isEventMinter(1, addr3.address)).to.be.true;
                
            });

            it("Should emit EventMinterAdded event", async function () {               

                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.addEventMinter(1, addr2.address)).to.emit(poapToken, "EventMinterAdded").withArgs(1, addr2.address);

            });

        })

        describe("removeEventMinter", function () {

            it("Should only be callable by an admin", async function () {
    
                const { poapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;

                await expect(poapToken.connect(addr2).removeEventMinter(1, addr3.address)).to.be.reverted; // nor admin nor event minter
                await expect(poapToken.removeEventMinter(1, addr3.address)).to.be.fulfilled; // admin call
                await expect(poapToken.connect(addr1).removeEventMinter(1, addr2.address)).to.be.reverted; // event minter call


            });

            it("Should add the account as event minter", async function () {
    
                const { poapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;

                expect(await poapToken.isEventMinter(1, addr1.address)).to.be.true;

                await expect(poapToken.removeEventMinter(1, addr1.address)).to.be.fulfilled;

                expect(await poapToken.isEventMinter(1, addr1.address)).to.be.false;
                
            });

            it("Should emit EventMinterRemoved event", async function () {               

                const { poapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.removeEventMinter(1, addr1.address)).to.emit(poapToken, "EventMinterRemoved").withArgs(1, addr1.address);

            });

        })

        // TODO: getFreezeTime
        describe("freeze", function () {

            it("Should only be callable by approved or owner or by an admin", async function () {
    
                const { poapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;

                await expect(poapToken.setFreezeDuration(120)).to.be.fulfilled;

                await expect(poapToken.freeze(1)).to.be.fulfilled;
                expect(await poapToken.isFrozen(1)).to.be.true;

                await expect(poapToken.mintToken(1, addr2.address, "InitialState")).to.be.fulfilled;

                await expect(poapToken.connect(addr2).freeze(2)).to.be.fulfilled;
                expect(await poapToken.isFrozen(2)).to.be.true;

                await expect(poapToken.mintToken(1, addr3.address, "InitialState")).to.be.fulfilled;

                await expect(poapToken.connect(addr2).freeze(3)).to.be.revertedWith("Poap: not authorized to freeze");
                expect(await poapToken.isFrozen(3)).to.be.false;

                await expect(poapToken.connect(addr3).approve(addr2.address, 3)).to.be.fulfilled;

                await expect(poapToken.connect(addr2).freeze(3)).to.be.fulfilled;
                expect(await poapToken.isFrozen(3)).to.be.true;

            });

            it("Should only be callable when contract is not paused", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);
                
                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr2.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.setFreezeDuration(120)).to.be.fulfilled;

                await poapToken.pause();

                await expect(poapToken.freeze(1)).to.be.reverted;
                expect(await poapToken.isFrozen(1)).to.be.false;

                await poapToken.unpause();

                await expect(poapToken.freeze(1)).to.be.fulfilled;
                expect(await poapToken.isFrozen(1)).to.be.true;

            });

            it("Should only be callable when token is not frozen", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);
                
                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr2.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.setFreezeDuration(120)).to.be.fulfilled;

                await expect(poapToken.freeze(1)).to.be.fulfilled;
                expect(await poapToken.isFrozen(1)).to.be.true;

                await expect(poapToken.freeze(1)).to.be.revertedWith("Poap: token is frozen");

            });

            it("Should emit Frozen event", async function () {               

                const { poapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.setFreezeDuration(120)).to.be.fulfilled;

                await expect(poapToken.freeze(1)).to.emit(poapToken, "Frozen").withArgs(1);;

            });

        })

        describe("unfreeze", function () {

            it("Should only be callable by an admin", async function () {
    
                const { poapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.setFreezeDuration(120)).to.be.fulfilled;
                await expect(poapToken.freeze(1)).to.be.fulfilled;
                expect(await poapToken.isFrozen(1)).to.be.true;

                await expect(poapToken.connect(addr1).approve(addr2.address, 1)).to.be.fulfilled;
                await expect(poapToken.connect(addr2).unfreeze(1)).to.be.reverted;
                expect(await poapToken.isFrozen(1)).to.be.true;

                await expect(poapToken.connect(addr1).unfreeze(1)).to.be.reverted;
                expect(await poapToken.isFrozen(1)).to.be.true;

                await expect(poapToken.unfreeze(1)).to.be.fulfilled;
                expect(await poapToken.isFrozen(1)).to.be.false;

            });

            it("Should only be callable when contract is not paused", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);
                
                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr2.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.setFreezeDuration(120)).to.be.fulfilled;
                await expect(poapToken.freeze(1)).to.be.fulfilled;
                expect(await poapToken.isFrozen(1)).to.be.true;

                await poapToken.pause();

                await expect(poapToken.unfreeze(1)).to.be.reverted;
                expect(await poapToken.isFrozen(1)).to.be.true;

                await poapToken.unpause();

                await expect(poapToken.unfreeze(1)).to.be.fulfilled;
                expect(await poapToken.isFrozen(1)).to.be.false;

            });

            it("Should only be callable when token is frozen", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);
                
                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr2.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.setFreezeDuration(120)).to.be.fulfilled;

                await expect(poapToken.unfreeze(1)).to.be.revertedWith("Poap: token is not frozen");

                await expect(poapToken.freeze(1)).to.be.fulfilled;
                expect(await poapToken.isFrozen(1)).to.be.true;

                await expect(poapToken.unfreeze(1)).to.be.fulfilled;

            });

            it("Should emit Unfrozen event", async function () {               

                const { poapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, addr1.address, "InitialState")).to.be.fulfilled;
                await expect(poapToken.setFreezeDuration(120)).to.be.fulfilled;

                await expect(poapToken.freeze(1)).to.be.fulfilled;
                expect(await poapToken.isFrozen(1)).to.be.true;
                await expect(poapToken.unfreeze(1)).to.emit(poapToken, "Unfrozen").withArgs(1);;

            });

        })

    })


});