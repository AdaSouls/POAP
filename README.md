
# AdaSouls POAP

[AdaSouls POAP](https://AdaSouls.io) is a fork of the [Proof of Attendance Protocol](https://poap.xyz/) (POAP) that adds Soulbound and Stateful capabilities to its badges.

[Soulbound Tokens](https://deliverypdf.ssrn.com/delivery.php?ID=231116021119088068031090117103064121018062034043090044011064091076101007106088114104029123096099014032005001116003118013081096037012043042080122112114064095064117102042013042095102024092097004087103002112027064092027095011120078005087097126067100011113&EXT=pdf&INDEX=TRUE) were introduced by Vitalik Buterin in May 2022 and we believe that they should, in most cases, be attached to their original recipient at all times.

On the other hand, [Stateful NFTs](https://docs.paimastudios.com/home/smart-contracts/evm/deploy-stateful-nft) are a key part of the [Paima Engine](https://docs.paimastudios.com/) and they give us the ability to update the state of our tokens, so that they can reflect multiple event attendance in only one token, without the need of minting extra NFTs, saving both time and money.

AdaSouls POAP is a [Project Catalyst Fund11 Funded Project](https://projectcatalyst.io/funds/11/cardano-open-developers/poap-in-cardano) and it is live in the [Milkomeda C1 Cardano Network](https://docs.milkomeda.com/home/intro-c1) with the idea to offer interoperability with Cardano Mainnet.

## Soulbound Extension

The formal Soulbound Token Standards that we have consider to build our smart contracts are:

- [ERC-5192: Minimal Soulbound NFTs](https://eips.ethereum.org/EIPS/eip-5192)
- [ERC-5484: Consensual Soulbound Tokens](https://eips.ethereum.org/EIPS/eip-5484)
- [ERC-6239: Semantic Soulbound Tokens](https://eips.ethereum.org/EIPS/eip-6239)
- [ERC-5114: Soulbound Badge](https://eips.ethereum.org/EIPS/eip-5114)
- [ERC-4973: Account-bound Tokens](https://eips.ethereum.org/EIPS/eip-4973)

## Stateful NFTs

As we said, for State Management on our POAPs we use Paima Engine, particularly the [`AnnotatedMintNft`](https://docs.paimastudios.com/home/libraries/evm-contracts/solidity/generated-docs#annotatedmintnft) smart contract. 

## Automated Tests
To test our smart contracts we will use [Hardhat](https://hardhat.org/) framework and [Mocha](https://mochajs.org/) libraries.

To execute the tests run:

```
npx hardhat test
```

## Get Started

1. Install dependencies:

    ```
    nvm use 20.9.0
    npm install
    ```

## 🧾 POAP Types

Our smart contract suite supports **four types of POAPs**, each with its own minting and transfer behavior:

| Type                        | Description                                                                 | Transferable | Requires Admin to Mint |
|-----------------------------|-----------------------------------------------------------------------------|--------------|-------------------------|
| `Public POAP`              | Anyone can mint, great for open events                                      | ✅            | ❌                      |
| `Restricted POAP` (Default)| Only event organizers can mint on behalf of users                          | ✅            | ✅                      |
| `Soulbound POAP`           | Non-transferable token, attached to wallet forever                         | ❌            | ✅                      |
| `Consensual Soulbound POAP`| Soulbound token with revocation protection. Cannot be burned arbitrarily   | ❌            | ✅                      |

These types are implemented as separate smart contracts inheriting common functionality, promoting modularity and maintainability.

## 🧠 Contract: Public POAP

The `PoapPublic` contract is a fully featured, stateful ERC721 NFT implementation for issuing POAPs (Proof of Attendance Protocol) with support for issuers, event organizers, and role-based minting. It extends multiple features to handle minting rules, batch operations, transfer restrictions, and metadata handling.

### ✅ Features
- ✅ ERC721 standard with Metadata & Enumerable extensions
- ✅ Issuers and Event Organizers: Hierarchical structure with issuers managing multiple events
- ✅ Stateful logic via `PoapStatefulPublic`
- ✅ Pausing support via `PoapPausablePublic`
- ✅ Minting by event and issuer
- ✅ Mint expiration and max supply enforcement per event
- ✅ Batch minting to many users or across multiple events
- ✅ Role-based access control for admins and organizers
- ✅ Token freezing/unfreezing logic with transfer restrictions
- ✅ Dynamic token URI generation using event and token ID

### ⚙️ Functions
- `initialize(baseURI, admins[])`: Initializes contract state and admin list
- `createEventId(issuerId, eventId, maxSupply, expiration, organizer)`: Create new events with rules
- `mintToken(issuerId, eventId, to)`: Mint a POAP token to a single address
- `mintEventToManyUsers(issuerId, eventId, to[])`: Batch mint POAPs for a single event
- `mintUserToManyEvents(issuerIds[], eventIds[], to)`: Mint POAPs to a user across several events
- `burn(tokenId)`: Burn your own POAP token
- `pause() / unpause()`: Admin functions to pause all interactions
- `tokenEvent(tokenId)`: Get the event ID for a given token
- `tokenDetailsOfOwnerByIndex(owner, index)`: Get token ID and event ID for an owner's token at index
- `getEventMaxSupply(eventId)`: Get event’s max mintable supply
- `getEventTotalSupply(eventId)`: Get number of tokens already minted for an event
- `getEventMintExpiration(eventId)`: Get expiration timestamp for minting
- `getIssuerEventList(issuerId)`: Get all event IDs for a specific issuer
- `getFreezeTime(tokenId)`: Get freeze time in seconds for a token
- `isFrozen(tokenId)`: Check if a token is currently frozen
- `removeAdmin(account)`: Remove an admin from the contract

## 🧠 Contract: Standard POAP

The standard `Poap` contract implements the following:

### ✅ Features
- ✅ ERC721, Metadata & Enumerable extensions
- ✅ Admin roles and event organizers
- ✅ Stateful logic via `PoapStateful`
- ✅ Pausing support via `PoapPausable`
- ✅ Minting by event
- ✅ Mint expiration and max supply controls
- ✅ Batch minting to many users or across multiple events
- ✅ Role-based access to admin and minters
- ✅ Freezing/unfreezing logic for token transfers

### ⚙️ Functions
- `createEventId(issuerId, eventId, maxSupply, expiration, organizer)`: Define new events with metadata and minting rules
- `mintToken(issuerId, eventId, to)`: Mint a token to a user
- `mintEventToManyUsers(issuerId, eventId, to[])`: Batch mint POAPs for a single event
- `mintUserToManyEvents(issuerIds[], eventIds[], to)`: Batch mint POAPs across multiple events
- `burn(tokenId)`: Allows users to burn their own tokens
- `pause()` / `unpause()`: Admin control to stop all interactions
- `tokenEvent(tokenId)`: Get the event ID for a specific token
  
## 🧠 Contract: Soulbound POAP

The `SoulboundPoap` contract represents a non-transferable POAP (Proof of Attendance Protocol) token system designed for immutable identity-linked recognition. These tokens are soulbound, meaning they are permanently tied to the recipient's wallet and cannot be transferred. This smart contract also supports per-event supply caps, expiration, access roles, and more.

### ✅ Features
- ✅ ERC721 + Metadata + Enumerable extensions: Fully compliant with ERC721, includes metadata and enumerable capabilities.
- ✅ Admin roles and event organizers: Uses role-based access via PoapRoles to control admins and event-level minters.
- ✅ Stateful logic via PoapStateful: Tracks event-to-token relationships and supports modular minting.
- ✅ Pausing support via PoapPausable: Admins can pause all interactions with the contract.
- ✅ Minting by event: Events can be created with their own rules (max supply, expiration, and organizer).
- ✅ Mint expiration and max supply controls: Each event enforces optional mint deadlines and token limits.
- ✅ Batch minting to many users or across multiple events: Supports minting many POAPs for one event or many events for one user.
- ✅ Role-based access to admins and event-specific minters: Only authorized roles can manage or mint tokens.
- ✅ Soulbound (non-transferable) by default: Tokens are locked and cannot be transferred unless explicitly unlocked.
- ✅ Token freezing/unfreezing logic: Prevents transfer unless locked(tokenId) returns false (enforced at transfer).

### ⚙️ Functions
- `createEventId(eventId, maxSupply, mintExpiration, eventOrganizer`: Defines a new event with its own mint cap, expiration, and organizer address. Can only be called by admins.
- `mintToken(eventId, to)`: Mints one soulbound POAP for the specified event and user. Can only be called by the event’s organizer.
- `mintEventToManyUsers(eventId, to[])`: Mints POAPs for a single event to multiple users in one transaction.
- `mintUserToManyEvents(eventIds[], to)`: Mints one POAP for each event in the list to the same user.
- `burn(tokenId)`: Allows the token owner (or an approved address) to burn their token. Unlocks the token before burning.
- `pause() / unpause()`: Allows admins to globally pause/unpause the contract for safety or maintenance.
- `tokenEvent(tokenId)`: Returns the event ID associated with a specific token.
- `tokenDetailsOfOwnerByIndex(owner, index)`: Returns both token ID and event ID for a user's token at a given index.
- `eventMaxSupply(eventId)`: View the max number of tokens allowed for an event.
- `eventTotalSupply(eventId)`: View the total number of tokens minted for an event so far.
- `locked(tokenId)`: Check whether a specific token is soulbound (i.e., non-transferable).
- `setBaseURI(baseURI)`: Admin-only function to set the base URI used for metadata construction.
- `removeAdmin(account)`: Removes an address from the list of admins.

## 🧠 Contract: Consensual Soulbound POAP

The `ConsensualSoulboundPoap` contract extends a stateful, ERC721-compliant NFT with consensual soulbound features and advanced minting controls.

### ✅ Features
- ✅ ERC721, Metadata & Enumerable extensions
- ✅ Admin roles and event organizers
- ✅ Stateful logic via PoapStateful
- ✅ Pausing support via PoapPausable
- ✅ Minting by event with expiration and supply limits
- ✅ Batch minting to many users or across multiple events
- ✅ Soulbound tokens with consensual transfer locks
- ✅ Token-specific burn policy (`BurnAuth`)
- ✅ Role-based access to admin and event minters
- ✅ Token-event relationship tracking
- ✅ Customizable baseURI for metadata
- ✅ Burn support with policy enforcement
- ✅ Safe transfers restricted by soulbound lock

### ⚙️ Functions
- `createEventId(eventId, maxSupply, mintExpiration, eventOrganizer)`: Define new events with max supply, expiration, and organizer
- `issue(eventId, to, isLocked)`: Mint a token with soulbound and burn policy options
- `issueEventToManyUsers(eventId, to[], isLocked, burnAuthority)`: Batch mint tokens for a single event
- `issueUserToManyEvents(eventIds[], to, isLocked, burnAuthority)`: Batch mint tokens across multiple events
- `burn(tokenId)`: Burn tokens based on per-token burn policy
- `pause() / unpause()`: Admin control to pause/unpause all interactions
- `locked(tokenId)`: Check if a token is soulbound (locked)
- `burnAuth(tokenId)`: View the burn policy of a specific token
- `tokenEvent(tokenId)`: Get the event ID associated with a token
- `tokenDetailsOfOwnerByIndex(owner, index)`: Retrieve both token ID and event ID by index
- `setBaseURI(baseURI)`: Update the metadata base URI (admin only)
- `removeAdmin(account)`: Remove an existing admin address

