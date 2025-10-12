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
    const poapFactory = await ethers.getContractFactory("PoapPublic");
    const poapToken = await poapFactory.deploy("Test Poap", "TPOAP", owner.address);

    return { poapToken, owner, addr1, addr2 };
}

async function deployPoapFixtureAndInitialize() {
    const [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7, addr8, addr9, addr10, addr11, addr12] = await ethers.getSigners();
    const poapFactory = await ethers.getContractFactory("PoapPublic");
    const poapToken = await poapFactory.deploy("Test Poap", "TPOAP", owner.address);
    await poapToken["initialize(string, address[])"]("https://ipfs.io/ipfs/QmQ8kV9JuhkiSt7Qp7HTsiyVUiaobFeTTyjK71q5k8e46w/", []);

    return { poapToken, owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7, addr8, addr9, addr10, addr11, addr12 };
}

describe("Public Poap Contract", function () {

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

        it("Should assign the right owner", async function () {
    
            const { poapToken, owner } = await loadFixture(deployPoapFixture);
    
            const poapOwner = await poapToken.owner();
            expect(poapOwner).to.equal(owner.address);
        });
    })

    describe("Initialize", function () {

        it("Should only be called once", async function () {

            const { poapToken } = await loadFixture(deployPoapFixtureAndInitialize);
            
            await expect(poapToken["initialize(string, address[])"]("https://ipfs.io/ipfs/QmQ8kV9JuhkiSt7Qp7HTsiyVUiaobFeTTyjK71q5k8e46w/", [])).to.be.revertedWithCustomError(poapToken, "InvalidInitialization");
        });

        it("Should set the right admin", async function () {

            const { poapToken, owner } = await loadFixture(deployPoapFixtureAndInitialize);
            
            const poapIsAdmin = await poapToken.isAdmin(owner.address);
            expect(poapIsAdmin).to.equal(true);
        });

        it("Should set extra admins if specified", async function () {

            const { poapToken, owner, addr1, addr2 } = await loadFixture(deployPoapFixture);
            
            await poapToken["initialize(string, address[])"]("https://ipfs.io/ipfs/QmQ8kV9JuhkiSt7Qp7HTsiyVUiaobFeTTyjK71q5k8e46w/", [addr1.address, addr2.address]);

            const poapIsAdmin1 = await poapToken.isAdmin(owner.address);
            const poapIsAdmin2 = await poapToken.isAdmin(owner.address);
            const poapIsAdmin3 = await poapToken.isAdmin(owner.address);

            expect(poapIsAdmin1).to.equal(true);
            expect(poapIsAdmin2).to.equal(true);
            expect(poapIsAdmin3).to.equal(true);
        });

        it("Should set pause status to false", async function () {

            const { poapToken } = await loadFixture(deployPoapFixtureAndInitialize);
            
            const poapPaused = await poapToken.paused();
            expect(poapPaused).to.equal(false);
        });

        it("Should only be callable by the owner", async function () {
    
            const { poapToken, addr1 } = await loadFixture(deployPoapFixture);

            await expect(poapToken.connect(addr1)["initialize(string, address[])"]("https://ipfs.io/ipfs/QmQ8kV9JuhkiSt7Qp7HTsiyVUiaobFeTTyjK71q5k8e46w/", [])).to.be.revertedWithCustomError(poapToken, "AccessControlUnauthorizedAccount");
            
            await expect(poapToken["initialize(string, address[])"]("https://ipfs.io/ipfs/QmQ8kV9JuhkiSt7Qp7HTsiyVUiaobFeTTyjK71q5k8e46w/", [])).to.be.fulfilled;

        });

        it("Should support erc165 interface", async function () {
    
            const { poapToken } = await loadFixture(deployPoapFixtureAndInitialize);

            const poapInterface = await poapToken.supportsInterface("0x01ffc9a7");
            
            expect(poapInterface).to.be.true;

        });

        it("Should support paima minting interface", async function () {
    
            const { poapToken } = await loadFixture(deployPoapFixtureAndInitialize);

            const poapInterface = await poapToken.supportsInterface("0xd0def521");
            
            expect(poapInterface).to.be.true;

        });


    })

    describe("Functions", function () {

        describe("createEventId", function () {

            it("Can be callable by anyone for testing purposes", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                await expect(poapToken.connect(addr1).createEventId(0, 0, 100, 0, addr2.address)).to.be.fulfilled;
                
                await expect(poapToken.createEventId(1, 1, 100, 0, addr2.address)).to.be.fulfilled;
    
            });

            it("Should only be callable when contract is not paused", async function () {
    
                const { poapToken, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);
                
                await poapToken.pause();

                await expect(poapToken.createEventId(1, 1, 100, 0, addr2.address)).to.be.reverted;
                
                await poapToken.unpause();

                await expect(poapToken.createEventId(1, 1, 100, 0, addr2.address)).to.be.fulfilled;
    
            });

            it("Should not allow the creation of events with same id", async function () {
    
                const { poapToken, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                await expect(poapToken.createEventId(1, 1, 100, 0, addr2.address)).to.be.fulfilled;

                await expect(poapToken.createEventId(1, 1, 100, 0, addr2.address)).to.be.revertedWith("PoapPublic: event already created");

            });

            it("Should not allow the creation of events with mint expiration date less than 3 days from now", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                const latest = await time.latest();

                await expect(poapToken.createEventId(1, 1, 100, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.createEventId(2, 0, 100, latest, addr2.address)).to.be.revertedWith("PoapPublic: mint expiration must be higher than current timestamp plus 3 days");

            });

            it("Should allow the creation of events with mint expiration date 3 days from now", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 100, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.createEventId(2, 1, 100, latestPlusSevenDays, addr2.address)).to.be.fulfilled;

            });

            it("Should allow the creation of events with no mint expiration date", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                await expect(poapToken.createEventId(1, 0, 100, 0, addr1.address)).to.be.fulfilled;

                await expect(poapToken.createEventId(2, 1, 100, 0, addr2.address)).to.be.fulfilled;

            });

            it("Should allow the creation of events with limited supply of tokens", async function () {
    
                const { poapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                await expect(poapToken.createEventId(1, 1, 10, 0, addr1.address)).to.be.fulfilled;

                const maxSupply = await poapToken.eventMaxSupply(1);

                expect(maxSupply).to.equal(10);
    
            });

            it("Should allow the creation of events with unlimited supply of tokens", async function () {
    
                const { poapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 1, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                const maxSupply = await poapToken.eventMaxSupply(1);

                expect(maxSupply).to.equal(BigInt(115792089237316195423570985008687907853269984665640564039457584007913129639935n));
    
            });

        })

        describe("mintToken", function () {

            it("Should be callable by anyone for testing purposes", async function () {
    
                const { poapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                await expect(poapToken.createEventId(1, 0, 100, 0, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintToken(1, 0, addr2.address)).to.be.fulfilled; // admin call

                await expect(poapToken.connect(addr1).mintToken(1, 0, addr1.address)).to.be.fulfilled; // organiser call

                await expect(poapToken.connect(addr2).mintToken(1, 0, addr3.address)).to.be.fulfilled; // attendee call

                await expect(poapToken.connect(addr3).mintToken(1, 0, addr4.address)).to.be.fulfilled; // public call

            });

            it("Should only be callable when contract is not paused", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintToken(1, 0, addr1.address)).to.be.fulfilled;

                await poapToken.pause();

                await expect(poapToken.mintToken(1, 0, addr2.address)).to.be.reverted;

                await poapToken.unpause();

                await expect(poapToken.mintToken(1, 0, addr2.address)).to.be.fulfilled;

            });

            it("Should only mint tokens for previously created events (createEventId)", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintToken(1, 0, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintToken(1, 1, addr2.address)).to.be.revertedWith("PoapPublic: event does not exist");

            });

            it("Should only mint tokens if mint expiration date is not met (or not set)", async function () {
    
                const { poapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;
                const latestPlusEightDays = await time.latest() + eightDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 1, 10, 0, addr2.address)).to.be.fulfilled;

                await expect(poapToken.mintToken(1, 0, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(2, 1, addr2.address)).to.be.fulfilled;

                await time.increaseTo(latestPlusEightDays);

                await expect(poapToken.mintToken(1, 0, addr3.address)).to.be.revertedWith("PoapPublic: event mint has expired");
                await expect(poapToken.mintToken(2, 1, addr3.address)).to.be.fulfilled;

            });

            it("Should only mint tokens if total supply < max supply", async function () {
    
                const { poapToken, addr1, addr2, addr3, addr4, addr5 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 5, 4, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintToken(1, 5, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, 5, addr2.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, 5, addr3.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, 5, addr4.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, 5, addr5.address)).to.be.revertedWith("PoapPublic: max supply reached for event");

            });

            it("Should assign the right token id to the token", async function () {
                const { poapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);
                
                const latestPlusSevenDays = await time.latest() + sevenDays;
                
                await expect(poapToken.createEventId(1, 5, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                
                // Get token IDs from events
                const mintTx1 = await poapToken.mintToken(1, 5, addr1.address);
                const receipt1 = await mintTx1.wait();
                const tokenId1 = receipt1.logs.find(log => log.fragment.name === 'TokenMinted').args[2];
                
                const mintTx2 = await poapToken.mintToken(1, 5, addr2.address);
                const receipt2 = await mintTx2.wait();
                const tokenId2 = receipt2.logs.find(log => log.fragment.name === 'TokenMinted').args[2];
                
                await expect(poapToken.createEventId(2, 6, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                
                const mintTx3 = await poapToken.mintToken(2, 6, addr3.address);
                const receipt3 = await mintTx3.wait();
                const tokenId3 = receipt3.logs.find(log => log.fragment.name === 'TokenMinted').args[2];
                
                const mintTx4 = await poapToken.mintToken(2, 6, addr4.address);
                const receipt4 = await mintTx4.wait();
                const tokenId4 = receipt4.logs.find(log => log.fragment.name === 'TokenMinted').args[2];
                
                // Now you can test the actual token IDs
                expect(tokenId1).to.equal(1);
                expect(tokenId2).to.equal(2);
                expect(tokenId3).to.equal(3);
                expect(tokenId4).to.equal(4);
            });

            it("Should assign the right event id to the token", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 5, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await poapToken.mintToken(1, 5, addr1.address);
                await poapToken.mintToken(1, 5, addr2.address);

                await expect(poapToken.createEventId(2, 6, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await poapToken.mintToken(2, 6, addr1.address);
                await poapToken.mintToken(2, 6, addr2.address);

                expect(await poapToken.tokenEvent(1)).to.be.equal(5);
                expect(await poapToken.tokenEvent(2)).to.be.equal(5);
                expect(await poapToken.tokenEvent(3)).to.be.equal(6);
                expect(await poapToken.tokenEvent(4)).to.be.equal(6);

            });

            it("Should increase the token total supply for that event by 1", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 5, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                expect(await poapToken.eventTotalSupply(5)).to.be.equal(0);

                await expect(poapToken.mintToken(1, 5, addr1.address)).to.be.fulfilled;

                expect(await poapToken.eventTotalSupply(5)).to.be.equal(1);

                await expect(poapToken.mintToken(1, 5, addr2.address)).to.be.fulfilled;

                expect(await poapToken.eventTotalSupply(5)).to.be.equal(2);

            });

            it("Should emit TokenMinted event", async function () {
    
                const { poapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 5, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintToken(1, 5, addr1.address)).to.emit(poapToken, "TokenMinted").withArgs(1, 5, 1);

            });


        })

        describe("mintEventToManyUsers", function () {

            it("Should be callable by everyone for testing purposes", async function () {
    
                const { poapToken, addr1, addr2, addr3, addr4, addr5, addr6, addr7, addr8, addr9, addr10, addr11, addr12 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 20, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintEventToManyUsers(1, 0, [addr1.address, addr2.address, addr3.address])).to.be.fulfilled; // admin call

                await expect(poapToken.connect(addr1).mintEventToManyUsers(1, 0, [addr4.address, addr5.address, addr6.address])).to.be.fulfilled; // organizer call

                await expect(poapToken.connect(addr2).mintEventToManyUsers(1, 0, [addr7.address, addr8.address, addr9.address])).to.be.fulfilled; // attendee call

                await expect(poapToken.connect(addr10).mintEventToManyUsers(1, 0, [addr11.address, addr12.address])).to.be.fulfilled; // public call

            });

            it("Should only be callable when contract is not paused", async function () {
    
                const { poapToken, addr1, addr2, addr3, addr4, addr5 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintEventToManyUsers(1, 0, [addr1.address, addr2.address, addr3.address])).to.be.fulfilled;

                await poapToken.pause();

                await expect(poapToken.mintEventToManyUsers(1, 0, [addr4.address, addr5.address])).to.be.reverted;

                await poapToken.unpause();

                await expect(poapToken.mintEventToManyUsers(1, 0, [addr4.address, addr5.address])).to.be.fulfilled;

            });

            it("Should only mint tokens for previously created events (createEventId)", async function () {
    
                const { poapToken, addr1, addr2, addr3, addr4, addr5 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintEventToManyUsers(1, 0, [addr1.address, addr2.address, addr3.address])).to.be.fulfilled;

                await expect(poapToken.mintEventToManyUsers(1, 1, [addr4.address, addr5.address])).to.be.revertedWith("PoapPublic: event does not exist");

            });

            it("Should only mint tokens if mint expiration date is not met (or not set)", async function () {
    
                const { poapToken, addr1, addr2, addr3, addr4, addr5, addr6, addr7, addr8, addr9, addr10, addr11, addr12 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;
                const latestPlusEightDays = await time.latest() + eightDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 1, 10, 0, addr2.address)).to.be.fulfilled;

                await expect(poapToken.mintEventToManyUsers(1, 0, [addr1.address, addr2.address, addr3.address])).to.be.fulfilled;
                await expect(poapToken.mintEventToManyUsers(2, 1, [addr4.address, addr5.address, addr6.address])).to.be.fulfilled;

                await time.increaseTo(latestPlusEightDays);

                await expect(poapToken.mintEventToManyUsers(1, 0, [addr7.address, addr8.address, addr9.address])).to.be.revertedWith("PoapPublic: event mint has expired");
                await expect(poapToken.mintEventToManyUsers(2, 1, [addr10.address, addr11.address, addr12.address])).to.be.fulfilled;

            });

            it("Should only mint tokens if total supply < max supply", async function () {
    
                const { poapToken, addr1, addr2, addr3, addr4, addr5, addr6, addr7, addr8, addr9, addr10, addr11, addr12 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 17, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintEventToManyUsers(1, 17, [addr1.address, addr2.address, addr3.address])).to.be.fulfilled;
                await expect(poapToken.mintEventToManyUsers(1, 17, [addr4.address, addr5.address, addr6.address])).to.be.fulfilled;
                await expect(poapToken.mintEventToManyUsers(1, 17, [addr7.address, addr8.address, addr9.address])).to.be.fulfilled;
                await expect(poapToken.mintEventToManyUsers(1, 17, [addr10.address, addr11.address, addr12.address])).to.be.revertedWith("PoapPublic: max supply reached for event");

            });

            it("Should increase the token total supply for that event by 1", async function () {
    
                const { poapToken, addr1, addr2, addr3, addr4, addr5 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 6, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                expect(await poapToken.eventTotalSupply(6)).to.be.equal(0);

                await expect(poapToken.mintEventToManyUsers(1, 6, [addr1.address, addr2.address, addr3.address])).to.be.fulfilled;

                expect(await poapToken.eventTotalSupply(6)).to.be.equal(3);

                await expect(poapToken.mintEventToManyUsers(1, 6, [addr4.address, addr5.address])).to.be.fulfilled;

                expect(await poapToken.eventTotalSupply(6)).to.be.equal(5);

            });

            it("Should emit TokenMinted event", async function () {
    
                const { poapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 5, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintEventToManyUsers(1, 5, [addr1.address, addr2.address, addr3.address]))
                    .to.emit(poapToken, "TokenMinted").withArgs(1, 5, 1)
                    .to.emit(poapToken, "TokenMinted").withArgs(1, 5, 2)
                    .to.emit(poapToken, "TokenMinted").withArgs(1, 5, 3);

            });

        })

        describe("mintUserToManyEvents", function () {

            it("Should be callable by everyone for testing purposes", async function () {
    
                const { poapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 1, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 2, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], [0, 1, 2], addr1.address)).to.be.fulfilled; // admin call

                await expect(poapToken.connect(addr1).mintUserToManyEvents([1, 2, 3], [0, 1, 2], addr2.address)).to.be.fulfilled; // organiser call

                await expect(poapToken.connect(addr2).mintUserToManyEvents([1, 2, 3], [0, 1, 2], addr3.address)).to.be.fulfilled; // attendee call

                await expect(poapToken.connect(addr4).mintUserToManyEvents([1, 2, 3], [0, 1, 2], addr4.address)).to.be.fulfilled; // public call

            });

            it("Should only be callable when contract is not paused", async function () {
    
                const { poapToken, addr1, addr2, addr3, addr4 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 1, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 2, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], [0, 1, 2], addr2.address)).to.be.fulfilled;

                await poapToken.pause();

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], [0, 1, 2], addr3.address)).to.be.reverted;

                await poapToken.unpause();

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], [0, 1, 2], addr4.address)).to.be.fulfilled;

            });

            it("Should only mint tokens for previously created events (createEventId)", async function () {
    
                const { poapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 1, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 2, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], [0, 1, 2], addr2.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], [0, 1, 3], addr3.address)).to.be.revertedWith("PoapPublic: event does not exist");

            });

            it("Should only mint tokens if mint expiration date is not met (or not set)", async function () {
    
                const { poapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;
                const latestPlusEightDays = await time.latest() + eightDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 1, 10, 0, addr2.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 2, 10, 0, addr2.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], [0, 1, 2], addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2, 3], [0, 1, 2], addr2.address)).to.be.fulfilled;

                await time.increaseTo(latestPlusEightDays);

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], [0, 1, 2], addr3.address)).to.be.revertedWith("PoapPublic: event mint has expired");
                await expect(poapToken.mintUserToManyEvents([2, 3], [1, 2], addr3.address)).to.be.fulfilled;

            });

            it("Should only mint tokens if total supply < max supply", async function () {
    
                const { poapToken, addr1, addr2, addr3, addr4, addr5, addr6 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 6, 5, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 7, 5, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 8, 5, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], [6, 7, 8], addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2, 3], [6, 7, 8], addr2.address)).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2, 3], [6, 7, 8], addr3.address)).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2, 3], [6, 7, 8], addr4.address)).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2, 3], [6, 7, 8], addr5.address)).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2, 3], [6, 7, 8], addr6.address)).to.be.revertedWith("PoapPublic: max supply reached for event");

            });

            it("Should increase the token total supply for that event by 1", async function () {
    
                const { poapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 6, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 7, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 8, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                expect(await poapToken.eventTotalSupply(6)).to.be.equal(0);
                expect(await poapToken.eventTotalSupply(7)).to.be.equal(0);
                expect(await poapToken.eventTotalSupply(8)).to.be.equal(0);

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], [6, 7, 8], addr1.address)).to.be.fulfilled;

                expect(await poapToken.eventTotalSupply(6)).to.be.equal(1);
                expect(await poapToken.eventTotalSupply(7)).to.be.equal(1);
                expect(await poapToken.eventTotalSupply(8)).to.be.equal(1);

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], [6, 7, 8], addr2.address)).to.be.fulfilled;

                expect(await poapToken.eventTotalSupply(6)).to.be.equal(2);
                expect(await poapToken.eventTotalSupply(7)).to.be.equal(2);
                expect(await poapToken.eventTotalSupply(8)).to.be.equal(2);

            });

            it("Should emit TokenMinted event", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 6, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 7, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 8, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], [6, 7, 8], addr2.address))
                    .to.emit(poapToken, "TokenMinted").withArgs(1, 6, 1)
                    .to.emit(poapToken, "TokenMinted").withArgs(2, 7, 2)
                    .to.emit(poapToken, "TokenMinted").withArgs(3, 8, 3);

            });

        })

        describe("eventMaxSupply", function () {

            it("Should be callable by everyone for testing purposes", async function () {
    
                const { poapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 100, 100, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 20, 20, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], [0, 100, 20], addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2], [0, 100], addr2.address)).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([2, 3], [0, 100], addr3.address)).to.be.fulfilled;

                expect(await poapToken.connect(addr1).eventMaxSupply(0)).to.equal(BigInt(115792089237316195423570985008687907853269984665640564039457584007913129639935n));
                expect(await poapToken.connect(addr2).eventMaxSupply(100)).to.be.equal(100);
                expect(await poapToken.connect(addr3).eventMaxSupply(20)).to.be.equal(20);

            });

            it("Should retrieve the right max supply for an event", async function () {
    
                const { poapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 100, 100, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 20, 20, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], [0, 100, 20], addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2], [0, 100], addr2.address)).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([2, 3], [100, 20], addr3.address)).to.be.fulfilled;

                expect(await poapToken.connect(addr1).eventMaxSupply(0)).to.equal(BigInt(115792089237316195423570985008687907853269984665640564039457584007913129639935n));
                expect(await poapToken.connect(addr1).eventMaxSupply(100)).to.be.equal(100);
                expect(await poapToken.connect(addr1).eventMaxSupply(20)).to.be.equal(20);

            });

            it("Should retrieve 0 as max supply for non existing events", async function () {
    
                const { poapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 0, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 100, 100, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 20, 20, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], [0, 100, 20], addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2], [0, 100],  addr2.address)).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([2, 3], [100, 20], addr3.address)).to.be.fulfilled;

                expect(await poapToken.connect(addr1).eventMaxSupply(0)).to.equal(BigInt(115792089237316195423570985008687907853269984665640564039457584007913129639935n));
                expect(await poapToken.connect(addr1).eventMaxSupply(100)).to.be.equal(100);
                expect(await poapToken.connect(addr1).eventMaxSupply(20)).to.be.equal(20);
                expect(await poapToken.connect(addr1).eventMaxSupply(4)).to.be.equal(0);

            });

        })

        describe("eventTotalSupply", function () {

            it("Should be callable by everyone for testing purposes", async function () {
    
                const { poapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 100, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 20, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], [0, 100, 20], addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2], [0, 100], addr2.address)).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([2, 3], [100, 20], addr3.address)).to.be.fulfilled;

                expect(await poapToken.connect(addr1).eventTotalSupply(0)).to.be.equal(2);
                expect(await poapToken.connect(addr2).eventTotalSupply(100)).to.be.equal(3);
                expect(await poapToken.connect(addr3).eventTotalSupply(20)).to.be.equal(2);

            });

            it("Should retrieve the right total supply for an event", async function () {
    
                const { poapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 100, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 20, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], [0, 100, 20], addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2], [0, 100], addr2.address)).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([2, 3], [100, 20], addr3.address)).to.be.fulfilled;

                expect(await poapToken.connect(addr1).eventTotalSupply(0)).to.be.equal(2);
                expect(await poapToken.connect(addr1).eventTotalSupply(100)).to.be.equal(3);
                expect(await poapToken.connect(addr1).eventTotalSupply(20)).to.be.equal(2);

            });

            it("Should retrieve 0 as total supply for events that haven't yet minted any token (or don't exist)", async function () {
    
                const { poapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 100, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 20, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2], [0, 100], addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2], [0, 100], addr2.address)).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([2], [100], addr3.address)).to.be.fulfilled;

                expect(await poapToken.connect(addr1).eventTotalSupply(0)).to.be.equal(2);
                expect(await poapToken.connect(addr1).eventTotalSupply(100)).to.be.equal(3);
                expect(await poapToken.connect(addr1).eventTotalSupply(20)).to.be.equal(0);
                expect(await poapToken.connect(addr1).eventTotalSupply(21)).to.be.equal(0);

            });

        })

        describe("totalSupply", function () {

            it("Should be callable by everyone for testing purposes", async function () {
    
                const { poapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 100, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 20, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], [0, 100, 20], addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2], [0, 100], addr2.address)).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([2, 3], [100, 20], addr3.address)).to.be.fulfilled;

                expect(await poapToken.connect(addr1).totalSupply()).to.be.equal(7);
                expect(await poapToken.connect(addr2).totalSupply()).to.be.equal(7);
                expect(await poapToken.connect(addr3).totalSupply()).to.be.equal(7);

            });

            it("Should retrieve the total supply for all poaps", async function () {
    
                const { poapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 100, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 20, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.mintUserToManyEvents([1, 2, 3], [0, 100, 20], addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2], [0, 100], addr2.address)).to.be.fulfilled;
                await expect(poapToken.mintUserToManyEvents([1, 2, 3], [0, 100, 20], addr3.address)).to.be.fulfilled;

                expect(await poapToken.connect(addr1).totalSupply()).to.be.equal(8);

            });

            it("Should retrieve 0 as total supply if no poaps have been minted", async function () {
    
                const { poapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(2, 100, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.createEventId(3, 20, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                expect(await poapToken.connect(addr1).totalSupply()).to.be.equal(0);

            });

        })

        describe("burn", function () {

            it("Should only be callable by approved or owner and not by an admin", async function () {
    
                const { poapToken, owner, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, 0, addr1.address)).to.be.fulfilled;

                await expect(poapToken.burn(1)).to.be.revertedWith("PoapPublic: not authorized to burn");

                await expect(poapToken.connect(addr1).approve(owner.address, 1)).to.be.fulfilled;

                await expect(poapToken.burn(1)).to.be.fulfilled;

                await expect(poapToken.mintToken(1, 0, addr2.address)).to.be.fulfilled;
                await expect(poapToken.connect(addr2).burn(2)).to.be.fulfilled;

            });

            it("Should decrease the total supply for the event", async function () {

                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, 0, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, 0, addr2.address)).to.be.fulfilled;

                expect(await poapToken.eventTotalSupply(0)).to.be.equal(2);

                await expect(poapToken.connect(addr1).burn(1)).to.be.fulfilled;

                expect(await poapToken.eventTotalSupply(0)).to.be.equal(1);                

            });

            it("Should decrease the total supply for all poaps", async function () {

                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, 0, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, 0, addr2.address)).to.be.fulfilled;

                await expect(poapToken.createEventId(2, 1, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(2, 1, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(2, 1, addr2.address)).to.be.fulfilled;


                expect(await poapToken.totalSupply()).to.be.equal(4);

                await expect(poapToken.connect(addr1).burn(3)).to.be.fulfilled;

                expect(await poapToken.totalSupply()).to.be.equal(3);

            });

        })

        describe("addAdmin", function () {

            it("Should only be callable by an admin", async function () {
    
                const { poapToken, owner, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, 0, addr1.address)).to.be.fulfilled;

                await expect(poapToken.connect(addr1).addAdmin(addr1.address)).to.be.reverted;

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

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, 0, addr1.address)).to.be.fulfilled;

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

            it("Should be callable by everyone for testing purposes", async function () {
    
                const { poapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, 0, addr1.address)).to.be.fulfilled;

                await expect(poapToken.connect(addr2).addEventMinter(0, addr3.address)).to.be.fulfilled; // nor admin nor event minter
                await expect(poapToken.addEventMinter(0, addr1.address)).to.be.fulfilled; // admin call
                await expect(poapToken.connect(addr1).addEventMinter(0, addr2.address)).to.be.fulfilled; // event minter call


            });

            it("Should add the account as event minter", async function () {
    
                const { poapToken, addr1, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, 0, addr1.address)).to.be.fulfilled;

                expect(await poapToken.isEventMinter(0, addr3.address)).to.be.false;

                await expect(poapToken.addEventMinter(0, addr3.address)).to.be.fulfilled;

                expect(await poapToken.isEventMinter(0, addr3.address)).to.be.true;
                
            });

            it("Should emit EventMinterAdded event", async function () {               

                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.addEventMinter(1, addr2.address)).to.emit(poapToken, "EventMinterAdded").withArgs(1, addr2.address);

            });

        })

        describe("removeEventMinter", function () {

            it("Should only be callable by an admin", async function () {
    
                const { poapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, 0, addr1.address)).to.be.fulfilled;

                await expect(poapToken.connect(addr2).removeEventMinter(0, addr3.address)).to.be.reverted; // nor admin nor event minter
                await expect(poapToken.removeEventMinter(0, addr3.address)).to.be.fulfilled; // admin call
                await expect(poapToken.connect(addr1).removeEventMinter(0, addr2.address)).to.be.reverted; // event minter call


            });

            it("Should remove the account as event minter", async function () {
    
                const { poapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, 0, addr1.address)).to.be.fulfilled;

                await expect(poapToken.addEventMinter(0, addr1.address)).to.be.fulfilled;
                expect(await poapToken.isEventMinter(0, addr1.address)).to.be.true;

                await expect(poapToken.removeEventMinter(0, addr1.address)).to.be.fulfilled;

                expect(await poapToken.isEventMinter(0, addr1.address)).to.be.false;
                
            });

            it("Should emit EventMinterRemoved event", async function () {               

                const { poapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;

                await expect(poapToken.removeEventMinter(1, addr1.address)).to.emit(poapToken, "EventMinterRemoved").withArgs(1, addr1.address);

            });

        })

        describe("freeze", function () {

            it("Should only be callable by approved or owner or by an admin", async function () {
    
                const { poapToken, addr1, addr2, addr3 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, 0, addr1.address)).to.be.fulfilled;

                await expect(poapToken.setFreezeDuration(120)).to.be.fulfilled;

                await expect(poapToken.freeze(1)).to.be.fulfilled;
                expect(await poapToken.isFrozen(1)).to.be.true;

                await expect(poapToken.mintToken(1, 0, addr2.address)).to.be.fulfilled;

                await expect(poapToken.connect(addr2).freeze(2)).to.be.fulfilled;
                expect(await poapToken.isFrozen(2)).to.be.true;

                await expect(poapToken.mintToken(1, 0, addr3.address)).to.be.fulfilled;

                await expect(poapToken.connect(addr2).freeze(3)).to.be.revertedWith("PoapPublic: not authorized to freeze");
                expect(await poapToken.isFrozen(3)).to.be.false;

                await expect(poapToken.connect(addr3).approve(addr2.address, 3)).to.be.fulfilled;

                await expect(poapToken.connect(addr2).freeze(3)).to.be.fulfilled;
                expect(await poapToken.isFrozen(3)).to.be.true;

            });

            it("Should only be callable when contract is not paused", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);
                
                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr2.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, 0, addr1.address)).to.be.fulfilled;
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

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr2.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, 0, addr1.address)).to.be.fulfilled;
                await expect(poapToken.setFreezeDuration(120)).to.be.fulfilled;

                await expect(poapToken.freeze(1)).to.be.fulfilled;
                expect(await poapToken.isFrozen(1)).to.be.true;

                await expect(poapToken.freeze(1)).to.be.revertedWith("PoapPublic: token is frozen");

            });

            it("Should emit TokenFrozen event", async function () {               

                const { poapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, 0, addr1.address)).to.be.fulfilled;
                await expect(poapToken.setFreezeDuration(120)).to.be.fulfilled;

                await expect(poapToken.freeze(1)).to.emit(poapToken, "TokenFrozen").withArgs(1);;

            });

        })

        describe("unfreeze", function () {

            it("Should only be callable by an admin", async function () {
    
                const { poapToken, addr1, addr2 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, 0, addr1.address)).to.be.fulfilled;
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

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr2.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, 0, addr1.address)).to.be.fulfilled;
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

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr2.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, 0, addr1.address)).to.be.fulfilled;
                await expect(poapToken.setFreezeDuration(120)).to.be.fulfilled;

                await expect(poapToken.unfreeze(1)).to.be.revertedWith("PoapPublic: token is not frozen");

                await expect(poapToken.freeze(1)).to.be.fulfilled;
                expect(await poapToken.isFrozen(1)).to.be.true;

                await expect(poapToken.unfreeze(1)).to.be.fulfilled;

            });

            it("Should emit TokenUnfrozen event", async function () {               

                const { poapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, 0, addr1.address)).to.be.fulfilled;
                await expect(poapToken.setFreezeDuration(120)).to.be.fulfilled;

                await expect(poapToken.freeze(1)).to.be.fulfilled;
                expect(await poapToken.isFrozen(1)).to.be.true;
                await expect(poapToken.unfreeze(1)).to.emit(poapToken, "TokenUnfrozen").withArgs(1);;

            });

        })

        describe("getFreezeTime", function () {

            it("Should retrieve the frozen time of a frozen token", async function () {
     
                const { poapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, 0, addr1.address)).to.be.fulfilled;
                await expect(poapToken.setFreezeDuration(120)).to.be.fulfilled;
                await expect(poapToken.freeze(1)).to.be.fulfilled;
                expect(await poapToken.isFrozen(1)).to.be.true;

                const timestamp = await time.latest();
                const freezeDuration = await poapToken.freezeDuration();
                const tokenFreezeTime = await poapToken.getFreezeTime(1);

                expect(BigInt(tokenFreezeTime) === BigInt(timestamp) + BigInt(freezeDuration)).to.be.true;

            });

            it("Should retrieve 0 as the frozen time of an unfrozen token", async function () {
     
                const { poapToken, addr1 } = await loadFixture(deployPoapFixtureAndInitialize);

                const latestPlusSevenDays = await time.latest() + sevenDays;

                await expect(poapToken.createEventId(1, 0, 10, latestPlusSevenDays, addr1.address)).to.be.fulfilled;
                await expect(poapToken.mintToken(1, 0, addr1.address)).to.be.fulfilled;
                await expect(poapToken.setFreezeDuration(120)).to.be.fulfilled;
                expect(await poapToken.isFrozen(1)).to.be.false;

                const tokenFreezeTime = await poapToken.getFreezeTime(1);
                expect(tokenFreezeTime === BigInt(0)).to.be.true;

            });

        })

    })


});