// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.24;

import "../poap-interfaces/IAdaSoulsPoapDeployer.sol";

import "../poap-types/Poap.sol";

contract AdaSoulsPoapDeployer is IAdaSoulsPoapDeployer {
    struct Parameters {
        address factory;
        string name;
        string symbol;
        uint256 supply;
        uint256 typeOfPoap;
    }

    /// @inheritdoc IAdaSoulsPoapDeployer
    Parameters public override parameters;

    /// @dev Deploys a pool with the given parameters by transiently setting the parameters storage slot and then
    /// clearing it after deploying the pool.
    /// @param factory The contract address of the Uniswap V3 factory
    /// @param name The first token of the pool by address sort order
    /// @param symbol The second token of the pool by address sort order
    /// @param supply The fee collected upon every swap in the pool, denominated in hundredths of a bip
    /// @param typeOfPoap The spacing between usable ticks
    function deploy(
        address factory,
        string memory name,
        string memory symbol,
        uint256 supply,
        uint256 typeOfPoap
    ) internal returns (address poap) {
        parameters = Parameters({
            factory: factory,
            name: name,
            symbol: symbol,
            supply: supply,
            typeOfPoap: typeOfPoap
        });
        poap = address(
            new AdaSoulsPoapDeployer{
                salt: keccak256(abi.encode(name, symbol, supply, typeOfPoap))
            }()
        );
        delete parameters;
    }
}
