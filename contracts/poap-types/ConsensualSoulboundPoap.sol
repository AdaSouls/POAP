// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {PoapStateful} from "../poap-extensions/PoapStateful.sol";
import {PoapRoles, AccessControl} from "../poap-extensions/PoapRoles.sol";
import {PoapPausable} from "../poap-extensions/PoapPausable.sol";
import {IPoapSoulbound} from "../poap-interfaces/IPoapSoulbound.sol";
import {IPoapConsensual} from "../poap-interfaces/IPoapConsensual.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

// Desired Features
// - Add Event
// - Add Event Organizer
// - Mint token for an event
// - Batch Mint
// - Burn Tokens
// - Pause contract (only admin)
// - ERC721 full interface (base, metadata, enumerable)
// - Soulbound token
// - Consensual Soulbound token
// - Stateful token

contract ConsensualSoulboundPoap is
    Initializable,
    ERC721Enumerable,
    PoapRoles,
    PoapPausable,
    PoapStateful,
    IPoapSoulbound,
    IPoapConsensual
{
    // Events
    event EventToken(uint256 indexed eventId, uint256 tokenId);

    // Base token URI
    string private ___baseURI;

    // Total supply for each EventId
    mapping(uint256 => uint256) private _eventTotalSupply;

    // Max supply for each EventId
    mapping(uint256 => uint256) private _eventMaxSupply;

    // Mint expiration timestamp for each EventId
    mapping(uint256 => uint256) private _eventMintExpiration;

    // EventId for each token
    mapping(uint256 => uint256) private _tokenEvent;

    bytes4 private constant INTERFACE_ID_ERC721_METADATA = 0x5b5e139f;

    // Locked tokens
    mapping(uint256 => bool) private _isLocked;

    // Burn policy for a token
    mapping(uint256 => BurnAuth) private _burnAuth;

    // Token issuers
    mapping(uint256 => address) private _tokenIssuers;

    constructor(
        string memory name_,
        string memory symbol_,
        address owner_
    ) PoapStateful(name_, symbol_, owner_) {
        _grantRole(DEFAULT_ADMIN_ROLE, owner_);
    }

    function initialize(
        string memory __baseURI,
        address[] memory admins
    ) public initializer {
        PoapRoles.initialize(_msgSender());
        PoapPausable.initialize();

        // Add the requested admins
        for (uint256 i = 0; i < admins.length; ++i) {
            _addAdmin(admins[i]);
        }

        setBaseURI(__baseURI);
    }

    /// @dev Gets the event ID for a given token ID.
    /// @param tokenId Token ID.
    function tokenEvent(uint256 tokenId) public view returns (uint256) {
        return _tokenEvent[tokenId];
    }

    /// @dev Gets the token ID at a given index of the tokens list of the requested owner
    /// @param owner address owning the tokens list to be accessed
    /// @param index uint256 representing the index to be accessed of the requested tokens list
    /// @return tokenId token ID at the given index of the tokens list owned by the requested address
    /// @return eventId token ID at the given index of the tokens list owned by the requested address
    function tokenDetailsOfOwnerByIndex(
        address owner,
        uint256 index
    ) public view returns (uint256 tokenId, uint256 eventId) {
        tokenId = tokenOfOwnerByIndex(owner, index);
        eventId = tokenEvent(tokenId);
    }

    /*
     * @dev Gets the token uri
     * @return string representing the token uri
     */
    function tokenURI(
        uint256 tokenId
    ) public view override(PoapStateful, ERC721) returns (string memory) {
        uint eventId = _tokenEvent[tokenId];
        return
            string.concat(
                ___baseURI,
                Strings.toString(eventId),
                "/",
                Strings.toString(tokenId),
                ""
            );
    }

    function setBaseURI(
        string memory baseURI
    ) public override onlyAdmin whenNotPaused {
        ___baseURI = baseURI;
    }

    function approve(
        address to,
        uint256 tokenId
    ) public override(ERC721, IERC721) whenNotPaused {
        super.approve(to, tokenId);
    }

    function setApprovalForAll(
        address to,
        bool approved
    ) public override(ERC721, IERC721) whenNotPaused {
        super.setApprovalForAll(to, approved);
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override(ERC721, IERC721) whenNotPaused {
        require(
            !locked(tokenId),
            "ConsensualSoulboundPoap: soulbound is locked to transfer"
        );
        super.transferFrom(from, to, tokenId);
    }

    /*
     * @dev Safely transfers the ownership of a given token ID to another address (Implements ERC71)
     * Wrapper for function extended from ERC721 (  https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol )
     * Requires
     * - The msg sender to be the owner, approved, or operator
     * - The contract does not have to be paused
     * - The token to be transferred must not be frozen.
     * @param from ( address ) The address of the current owner of the token
     * @param to ( address ) The address to receive the ownership of the given token ID
     * @param tokenId ( uint256 ) ID of the token to be transferred
     * @param _data ( bytes ) Data to send along with a safe transfer check
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public override(ERC721, IERC721) whenNotPaused {
        require(
            !locked(tokenId),
            "ConsensualSoulboundPoap: soulbound is locked to transfer"
        );
        super.safeTransferFrom(from, to, tokenId, _data);
    }

    /*
     * @dev Returns whether the given spender can transfer a given token ID
     * @param spender address of the spender to query
     * @param tokenId uint256 ID of the token to be transferred
     * @return bool whether the msg.sender is approved for the given token ID,
     * is an operator of the owner, or is the owner of the token
     */
    function _isApprovedOrOwner(
        address spender,
        uint256 tokenId
    ) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner ||
            getApproved(tokenId) == spender ||
            isApprovedForAll(owner, spender));
    }

    /*
     * @dev Function to create events with a max supply
     * @param eventId EventId for the new token
     * @param to The address that will receive the minted tokens.
     * @return A boolean that indicates if the operation was successful.
     */
    function createEventId(
        uint256 eventId,
        uint256 maxSupply,
        uint256 mintExpiration,
        address eventOrganizer
    ) public whenNotPaused onlyAdmin returns (bool) {
        require(_eventMaxSupply[eventId] == 0, "ConsensualSoulboundPoap: event already created");
        if (mintExpiration > 0) {
            require(mintExpiration > block.timestamp + 3 days, "ConsensualSoulboundPoap: mint expiration must be higher than current timestamp plus 3 days");
        }
        if (maxSupply == 0) {
            _eventMaxSupply[eventId] = type(uint256).max;
        } else {
            _eventMaxSupply[eventId] = maxSupply;
        }
        _eventMintExpiration[eventId] = mintExpiration;
        addEventMinter(eventId, eventOrganizer);
        PoapStateful.setMinter(eventOrganizer);
        return true;
    }

    function issue(
        uint256 eventId,
        address to,
        string calldata initialData,
        bool isLocked,
        BurnAuth burnAuthority
    ) public whenNotPaused onlyEventMinter(eventId) returns (uint256) {
        require(_eventMaxSupply[eventId] != 0, "ConsensualSoulboundPoap: event does not exist");
        if (_eventMintExpiration[eventId] > 0) {
            require(_eventMintExpiration[eventId] >= block.timestamp, "ConsensualSoulboundPoap: event mint has expired");
        }
        require(
            _eventTotalSupply[eventId] < _eventMaxSupply[eventId],
            "ConsensualSoulboundPoap: max supply reached for event"
        );
        uint256 tokenId = PoapStateful.mint(to, initialData);

        // remember if the token is locked
        _isLocked[tokenId] = isLocked;

        if (isLocked) {
            emit Locked(tokenId);
        }

        // remember the `burnAuth` for this token
        _burnAuth[tokenId] = burnAuthority;

        // remember the issuer and owner of the token
        _tokenIssuers[tokenId] = _msgSender();

        emit Issued(_msgSender(), to, tokenId, burnAuthority);
        _tokenEvent[tokenId] = eventId;
        _eventTotalSupply[eventId]++;
        emit EventToken(eventId, tokenId);
        return tokenId;
    }

    /*
     * @dev Function to mint tokens
     * @param eventId EventId for the new token
     * @param to The address that will receive the minted tokens.
     * @return A boolean that indicates if the operation was successful.
     */
    function issueEventToManyUsers(
        uint256 eventId,
        address[] memory to,
        string calldata initialData,
        bool isLocked,
        BurnAuth burnAuthority
    ) public whenNotPaused onlyEventMinter(eventId) returns (bool) {
        for (uint256 i = 0; i < to.length; ++i) {
            issue(eventId, to[i], initialData, isLocked, burnAuthority);
        }
        return true;
    }

    /*
     * @dev Function to mint tokens
     * @param eventIds EventIds to assing to user
     * @param to The address that will receive the minted tokens.
     * @return A boolean that indicates if the operation was successful.
     */
    function issueUserToManyEvents(
        uint256[] memory eventIds,
        address to,
        string calldata initialData,
        bool isLocked,
        BurnAuth burnAuthority
    ) public whenNotPaused onlyAdmin returns (bool) {
        for (uint256 i = 0; i < eventIds.length; ++i) {
            issue(eventIds[i], to, initialData, isLocked, burnAuthority);
        }
        return true;
    }

    function eventMaxSupply(uint256 eventId) public view returns (uint256) {
        return _eventMaxSupply[eventId];
    }

    function eventTotalSupply(uint256 eventId) public view returns (uint256) {
        return _eventTotalSupply[eventId];
    }

    /*
     * @dev Burns a specific ERC721 token.
     * @param tokenId uint256 id of the ERC721 token to be burned.
     */
    function burn(uint256 tokenId) public override {
        address issuer = _tokenIssuers[tokenId];
        address owner = ownerOf(tokenId);
        BurnAuth burnAuthority = _burnAuth[tokenId];

        // Check burn policy
        require(
            (burnAuthority == BurnAuth.Both &&
                (_msgSender() == issuer || _msgSender() == owner)) ||
                (burnAuthority == BurnAuth.IssuerOnly &&
                    _msgSender() == issuer) ||
                (burnAuthority == BurnAuth.OwnerOnly && _msgSender() == owner),
            "ConsensualSoulboundToken: burn policy does not allow this burn"
        );

        // Unlock soulbound token before burn
        _isLocked[tokenId] = false;
        emit Unlocked(tokenId);
        __burn(tokenId);
    }

    /*
     * @dev Internal function to burn a specific token
     * Reverts if the token does not exist
     *
     * @param owner owner of the token to burn
     * @param tokenId uint256 ID of the token being burned by the _msgSender()
     */
    function __burn(uint256 tokenId) internal {
        delete _tokenIssuers[tokenId];
        delete _isLocked[tokenId];
        delete _burnAuth[tokenId];
        super._burn(tokenId);

        uint256 eventId = _tokenEvent[tokenId];
        _eventTotalSupply[eventId]--;
        _totalSupply--;
        delete _tokenEvent[tokenId];
    }

    function removeAdmin(address account) public onlyAdmin {
        _removeAdmin(account);
    }

    function locked(uint256 tokenId) public view returns (bool) {
        require(
            _ownerOf(tokenId) != address(0),
            "ConsensualSoulboundPoap: soulbound token does not exist"
        );
        return _isLocked[tokenId];
    }

    function burnAuth(uint256 tokenId) external view returns (BurnAuth) {
        return _burnAuth[tokenId];
    }

    // The following functions are overrides required by Solidity.
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        pure
        override(ERC721Enumerable, AccessControl, PoapStateful)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function totalSupply()
        public
        view
        virtual
        override(ERC721Enumerable, PoapStateful)
        returns (uint256)
    {
        return super.totalSupply();
    }

    /// @dev Returns the `baseURI` of this NFT.
    function _baseURI()
        internal
        view
        virtual
        override(PoapStateful, ERC721)
        returns (string memory)
    {
        return super._baseURI();
    }
}
