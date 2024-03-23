// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract PoapRoles is Initializable, AccessControl {
    bytes32 public constant EVENT_MINTER_ROLE = keccak256("EVENT_MINTER_ROLE");

    event AdminAdded(address indexed account);
    event AdminRemoved(address indexed account);
    event EventMinterAdded(uint256 indexed eventId, address indexed account);
    event EventMinterRemoved(uint256 indexed eventId, address indexed account);

    mapping(uint256 => mapping(address => bool)) private _eventMinters;

    function initialize(address sender) public onlyInitializing {
        if (!isAdmin(sender)) {
            _addAdmin(sender);
        }
    }

    modifier onlyAdmin() {
        require(isAdmin(_msgSender()));
        _;
    }

    modifier onlyEventMinter(uint256 eventId) {
        require(isEventMinter(eventId, _msgSender()));
        _;
    }

    function isAdmin(address account) public view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, account);
    }

    function isEventMinter(
        uint256 eventId,
        address account
    ) public view returns (bool) {
        return isAdmin(account) || _eventMinters[eventId][account];
    }

    function addEventMinter(
        uint256 eventId,
        address account
    ) public onlyEventMinter(eventId) {
        _addEventMinter(eventId, account);
    }

    function addAdmin(address account) public onlyAdmin {
        _addAdmin(account);
    }

    function renounceEventMinter(uint256 eventId) public {
        _removeEventMinter(eventId, _msgSender());
    }

    function renounceAdmin() public {
        _removeAdmin(_msgSender());
    }

    function removeEventMinter(
        uint256 eventId,
        address account
    ) public onlyAdmin {
        _removeEventMinter(eventId, account);
    }

    function _addEventMinter(uint256 eventId, address account) internal {
        _eventMinters[eventId][account] = true;
        emit EventMinterAdded(eventId, account);
    }

    function _addAdmin(address account) internal {
        grantRole(DEFAULT_ADMIN_ROLE, account);
        emit AdminAdded(account);
    }

    function _removeEventMinter(uint256 eventId, address account) internal {
        _eventMinters[eventId][account] = false;
        emit EventMinterRemoved(eventId, account);
    }

    function _removeAdmin(address account) internal {
        revokeRole(DEFAULT_ADMIN_ROLE, account);
        emit AdminRemoved(account);
    }

}
