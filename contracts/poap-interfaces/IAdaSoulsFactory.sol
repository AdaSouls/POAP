// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity 0.8.24;

/// @title The interface for the AdaSouls POAP Factory
/// @notice The AdaSouls POAP Factory facilitates creation of AdaSouls POAPs and control over the protocol fees
interface IAdaSoulsPoapFactory {
    /// @notice Emitted when the owner of the factory is changed
    /// @param oldOwner The owner before the owner was changed
    /// @param newOwner The owner after the owner was changed
    event OwnerChanged(address indexed oldOwner, address indexed newOwner);

    /// @notice Emitted when a POAP collection is created
    /// @param name Name of the POAP collection created
    /// @param symbol Symbol of the POAP collection created
    /// @param supply Max supply of the POAP collection created
    /// @param typeOfPoap Type of POAP created / 1 = Normal / 2 = Soulbound / 3 = Consensual Soulbound
    /// @param poap The address of the created POAP
    event PoapCreated(
        string name,
        string symbol,
        uint256 supply,
        uint256 typeOfPoap,
        address poap
    );

    /// @notice Emitted when a new fee amount is set for POAP creation via the factory
    /// @param fee The fee set
    event FeeAmountSet(uint24 indexed fee);

    /// @notice Returns the current owner of the factory
    /// @dev Can be changed by the current owner via setOwner
    /// @return The address of the factory owner
    function owner() external view returns (address);

    /// @notice Creates a POAP for the given name, symbol, supply and type
    /// @param name Name for the POAP collection to be created
    /// @param symbol Given symbol for the POAP collection to be created
    /// @param supply Max supply of the POAP collection to be created (0 for uncapped supply)
    /// @param typeOfPoap Type of POAP to be created / 1 = Normal / 2 = Soulbound / 3 = Consensual Soulbound
    /// @return poap The address of the newly created POAP collection
    function createPoap(
        string memory name,
        string memory symbol,
        uint256 supply,
        uint256 typeOfPoap
    ) external returns (address poap);

    /// @notice Updates the owner of the factory
    /// @dev Must be called by the current owner
    /// @param _owner The new owner of the factory
    function setOwner(address _owner) external;

    /// @notice Enables a fee amount for every POAP creation
    /// @dev Fee amounts may never be removed once enabled
    /// @param fee The fee amount to set
    function setFeeAmount(uint24 fee) external;
}
