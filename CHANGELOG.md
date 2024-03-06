# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.5.0] - 2024-03-06

### Added

- hardhat.config.js
- Changelog.md
- contracts/PoapSoulbound.sol
- test/Poap.js

### Removed

- truffle.config.js
- play.js
- contracts/XPoap.sol

### Changed

- Converted from Truffle to Hardhat project
- Updated Solidity version from v0.5.0 to v0.8.24 in smart contracts
- Updated Open Zeppelin Contract's to version 4 (Paima Engine does not support version 5 yet)
- Added Minimal Soulbound extension
- Added `AnnotatedMintNft` support for stateful tokens

### Pending

- Prepare tests for all smart contracts
- Prepare smart contracts deployment scripts
- Deploy all smart contracts in Milkomeda C1 Cardano
- Prepare Smart Contracts Deployment report