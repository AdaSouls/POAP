// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.24;

import "../poap-interfaces/IAdaSoulsFactory.sol";

import "./AdaSoulsPoapDeployer.sol";
import "./NoDelegateCall.sol";

import "../poap-types/Poap.sol";
import "../poap-types/SoulboundPoap.sol";
import "../poap-types/ConsensualSoulboundPoap.sol";

/// @title Canonical Uniswap V3 factory
/// @notice Deploys Uniswap V3 pools and manages ownership and control over pool protocol fees
contract AdaSoulsPoapFactory is
    IAdaSoulsPoapFactory,
    AdaSoulsPoapDeployer,
    NoDelegateCall
{
    /// @inheritdoc IAdaSoulsPoapFactory
    address public override owner;

    //mapping(uint24 => int24) public override feeAmountTickSpacing;

    constructor() {
        owner = msg.sender;
        emit OwnerChanged(address(0), msg.sender);

        //setFeeAmount(500);
        emit FeeAmountSet(500);
    }

    /// @inheritdoc IAdaSoulsPoapFactory
    function createPoap(
        string memory name,
        string memory symbol,
        uint256 supply,
        uint256 typeOfPoap
    ) external override noDelegateCall returns (address poap) {
        //require(tokenA != tokenB);
        /*         (address token0, address token1) = tokenA < tokenB
            ? (tokenA, tokenB)
            : (tokenB, tokenA);
        require(token0 != address(0)); */
        //int24 tickSpacing = feeAmountTickSpacing[fee];
        //require(tickSpacing != 0);
        //require(getPool[token0][token1][fee] == address(0));
        poap = deploy(address(this), name, symbol, supply, typeOfPoap);
        //getPool[token0][token1][fee] = pool;
        // populate mapping in the reverse direction, deliberate choice to avoid the cost of comparing addresses
        //getPool[token1][token0][fee] = pool;
        emit PoapCreated(name, symbol, supply, typeOfPoap, poap);
    }

    /// @inheritdoc IAdaSoulsPoapFactory
    function setOwner(address _owner) external override {
        require(msg.sender == owner);
        emit OwnerChanged(owner, _owner);
        owner = _owner;
    }

    /// @inheritdoc IAdaSoulsPoapFactory
    function setFeeAmount(uint24 fee) public override {
        require(msg.sender == owner);
        require(fee < 1000000);
        // tick spacing is capped at 16384 to prevent the situation where tickSpacing is so large that
        // TickBitmap#nextInitializedTickWithinOneWord overflows int24 container from a valid tick
        // 16384 ticks represents a >5x price change with ticks of 1 bips
        //require(tickSpacing > 0 && tickSpacing < 16384);
        //require(feeAmountTickSpacing[fee] == 0);

        //feeAmountTickSpacing[fee] = tickSpacing;
        emit FeeAmountSet(fee);
    }
}
