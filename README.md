
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
- `createEventId(...)`: Define new events with metadata and minting rules
- `mintToken(...)`: Mint a token to a user
- `mintEventToManyUsers(...)`: Batch mint POAPs for a single event
- `mintUserToManyEvents(...)`: Batch mint POAPs across multiple events
- `burn(...)`: Allows users to burn their own tokens
- `pause()` / `unpause()`: Admin control to stop all interactions
- `tokenEvent(tokenId)`: Get the event ID for a specific token