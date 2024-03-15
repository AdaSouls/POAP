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
    ERC721,
    ERC721Enumerable,
    PoapRoles,
    PoapPausable,
    PoapStateful,
    IPoapSoulbound,
    IPoapConsensual
{
    // Events
    event EventToken(uint256 indexed eventId, uint256 tokenId);
    event Frozen(uint256 id);
    event Unfrozen(uint256 id);

    // Base token URI
    string private ___baseURI;

    // Last Used id (used to generate new ids)
    uint256 private lastId;

    // EventId for each token
    mapping(uint256 => uint256) private _tokenEvent;

    bytes4 private constant INTERFACE_ID_ERC721_METADATA = 0x5b5e139f;

    // Frozen time for each token in seconds
    mapping(uint256 => uint256) private _tokenFrozen;

    // Frozen time for a token
    uint256 public freezeDuration;

    // Locked tokens
    mapping(uint256 => bool) private _isLocked;

    // Burn policy for a token
    mapping(uint256 => BurnAuth) private _burnAuth;

    // Token issuers
    mapping(uint256 => address) private _tokenIssuers;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 supply_,
        address owner_
    ) PoapStateful(name_, symbol_, supply_, owner_) {}

    function initialize(
        string memory __baseURI,
        address[] memory admins
    ) public initializer onlyOwner {
        PoapRoles.initialize(_msgSender());
        PoapPausable.initialize();

        // Add the requested admins
        for (uint256 i = 0; i < admins.length; ++i) {
            _addAdmin(admins[i]);
        }

        ___baseURI = __baseURI;

        // register the supported interfaces to conform to ERC721 via ERC165
        supportsInterface(INTERFACE_ID_ERC721_METADATA);
    }

    function tokenEvent(uint256 tokenId) public view returns (uint256) {
        return _tokenEvent[tokenId];
    }

    /*
     ** @dev Gets the token ID at a given index of the tokens list of the requested owner
     ** @param owner address owning the tokens list to be accessed
     ** @param index uint256 representing the index to be accessed of the requested tokens list
     ** @return uint256 token ID at the given index of the tokens list owned by the requested address
     */
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
            _strConcat(
                ___baseURI,
                _uint2str(eventId),
                "/",
                _uint2str(tokenId),
                ""
            );
    }

    function setBaseURI(
        string memory baseURI
    ) public override onlyAdmin whenNotPaused {
        ___baseURI = baseURI;
    }

    function setLastId(uint256 newLastId) public onlyAdmin whenNotPaused {
        require(
            lastId < newLastId,
            "ConsensualSoulboundPoap: lastId must be greater than newLastId"
        );
        lastId = newLastId;
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
     */
    /*     function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override(ERC721, IERC721) whenNotPaused whenNotFrozen(tokenId) {
        require(
            !locked(tokenId),
            "ConsensualSoulboundPoap: soulbound is locked to transfer"
        );
        super.safeTransferFrom(from, to, tokenId);
    } */

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
    ) public override(ERC721, IERC721) whenNotPaused whenNotFrozen(tokenId) {
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

    function issue(
        uint256 eventId,
        address to,
        uint256 tokenId,
        bool isLocked,
        BurnAuth burnAuthority
    ) public whenNotPaused onlyEventMinter(eventId) {
        // check that the token id is not already used
        require(ownerOf(tokenId) == address(0));

        //_safeMint(to, tokenId);
        mintToken(eventId, to);

        // remember is the token is locked
        _isLocked[tokenId] = isLocked;

        // remember the `burnAuth` for this token
        _burnAuth[tokenId] = burnAuthority;

        // remember the issuer and owner of the token
        _tokenIssuers[tokenId] = _msgSender();

        emit Issued(_msgSender(), to, tokenId, burnAuthority);
    }

    /*
     * @dev Function to mint tokens
     * @param eventId EventId for the new token
     * @param to The address that will receive the minted tokens.
     * @return A boolean that indicates if the operation was successful.
     */
    function mintToken(
        uint256 eventId,
        address to
    ) internal whenNotPaused onlyEventMinter(eventId) returns (bool) {
        lastId += 1;
        return _mintToken(eventId, lastId, to);
    }

    /*
     * @dev Function to mint tokens
     * @param eventId EventId for the new token
     * @param to The address that will receive the minted tokens.
     * @return A boolean that indicates if the operation was successful.
     */
    function mintEventToManyUsers(
        uint256 eventId,
        address[] memory to
    ) public whenNotPaused onlyEventMinter(eventId) returns (bool) {
        for (uint256 i = 0; i < to.length; ++i) {
            _mintToken(eventId, lastId + 1 + i, to[i]);
        }
        lastId += to.length;
        return true;
    }

    /*
     * @dev Function to mint tokens
     * @param eventIds EventIds to assing to user
     * @param to The address that will receive the minted tokens.
     * @return A boolean that indicates if the operation was successful.
     */
    function mintUserToManyEvents(
        uint256[] memory eventIds,
        address to
    ) public whenNotPaused onlyAdmin returns (bool) {
        for (uint256 i = 0; i < eventIds.length; ++i) {
            _mintToken(eventIds[i], lastId + 1 + i, to);
        }
        lastId += eventIds.length;
        return true;
    }

    /*
     * @dev Burns a specific ERC721 token.
     * @param tokenId uint256 id of the ERC721 token to be burned.
     */
    function burn(uint256 tokenId) public override {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId) || isAdmin(_msgSender()),
            "ConsensualSoulboundPoap: not authorized to burn"
        );

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

        delete _tokenEvent[tokenId];
    }

    /*
     * @dev Function to mint tokens
     * @param eventId EventId for the new token
     * @param tokenId The token id to mint.
     * @param to The address that will receive the minted tokens.
     * @return A boolean that indicates if the operation was successful.
     */
    function _mintToken(
        uint256 eventId,
        uint256 tokenId,
        address to
    ) internal returns (bool) {
        // TODO Verify that the token receiver ('to') do not have already a token for the event ('eventId')
        _mint(to, tokenId);
        _isLocked[tokenId] = true;
        emit Locked(tokenId);
        _tokenEvent[tokenId] = eventId;
        emit EventToken(eventId, tokenId);
        return true;
    }

    function removeAdmin(address account) public onlyAdmin {
        _removeAdmin(account);
    }

    /*
     * @dev Function to convert uint to string
     * Taken from https://github.com/oraclize/ethereum-api/blob/master/oraclizeAPI_0.5.sol
     */
    function _uint2str(
        uint _i
    ) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (_i != 0) {
            bstr[k--] = bytes1(uint8(48 + (_i % 10)));
            _i /= 10;
        }
        return string(bstr);
    }

    /*
     * @dev Function to concat strings
     * Taken from https://github.com/oraclize/ethereum-api/blob/master/oraclizeAPI_0.5.sol
     */
    function _strConcat(
        string memory _a,
        string memory _b,
        string memory _c,
        string memory _d,
        string memory _e
    ) internal pure returns (string memory _concatenatedString) {
        bytes memory _ba = bytes(_a);
        bytes memory _bb = bytes(_b);
        bytes memory _bc = bytes(_c);
        bytes memory _bd = bytes(_d);
        bytes memory _be = bytes(_e);
        string memory abcde = new string(
            _ba.length + _bb.length + _bc.length + _bd.length + _be.length
        );
        bytes memory babcde = bytes(abcde);
        uint k = 0;
        uint i = 0;
        for (i = 0; i < _ba.length; i++) {
            babcde[k++] = _ba[i];
        }
        for (i = 0; i < _bb.length; i++) {
            babcde[k++] = _bb[i];
        }
        for (i = 0; i < _bc.length; i++) {
            babcde[k++] = _bc[i];
        }
        for (i = 0; i < _bd.length; i++) {
            babcde[k++] = _bd[i];
        }
        for (i = 0; i < _be.length; i++) {
            babcde[k++] = _be[i];
        }
        return string(babcde);
    }

    /*
     * @dev Gets the freeze time for the token
     * @param tokenId ( uint256 ) The token id to freeze.
     * @return uint256 representing the token freeze time
     */
    function getFreezeTime(uint256 tokenId) public view returns (uint256) {
        return _tokenFrozen[tokenId];
    }

    /*
     * @dev Gets the token freeze status
     * @param tokenId ( uint256 ) The token id to freeze.
     * @return bool representing the token freeze status
     */
    function isFrozen(uint256 tokenId) external view returns (bool) {
        return _tokenFrozen[tokenId] >= block.timestamp;
    }

    /*
     * @dev Modifier to make a function callable only when the toke is not frozen.
     * @param tokenId ( uint256 ) The token id to check.
     */
    modifier whenNotFrozen(uint256 tokenId) {
        require(
            !this.isFrozen(tokenId),
            "ConsensualSoulboundPoap: soulbound token is frozen"
        );
        _;
    }

    /*
     * @dev Modifier to make a function callable only when the token is frozen.
     * @param tokenId ( uint256 ) The token id to check.
     */
    modifier whenFrozen(uint256 tokenId) {
        require(
            this.isFrozen(tokenId),
            "ConsensualSoulboundPoap: soulbound token is frozen"
        );
        _;
    }

    /*
     * @dev Called by the owner to set the time a token can be frozen.
     * Requires
     * - The msg sender to be the admin
     * - The contract does not have to be paused
     * @param time ( uint256 ) Time that the token will be frozen.
     */
    function setFreezeDuration(uint256 time) public onlyAdmin whenNotPaused {
        freezeDuration = time * 1 seconds;
    }

    /*
     * @dev Freeze a specific ERC721 token.
     * Requires
     * - The msg sender to be the admin, owner, approved, or operator
     * - The contract does not have to be paused
     * - The token does not have to be frozen
     * @param tokenId ( uint256 ) Id of the ERC721 token to be frozen.
     */
    function freeze(
        uint256 tokenId
    ) public whenNotPaused whenNotFrozen(tokenId) {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId) || isAdmin(_msgSender()),
            "ConsensualSoulboundPoap: not authorize to freeze"
        );
        _freeze(tokenId);
    }

    /*
     * @dev Unfreeze a specific ERC721 token.
     * Requires
     * - The msg sender to be the admin
     * - The contract does not have to be paused
     * - The token must be frozen
     * @param tokenId ( uint256 ) Id of the ERC721 token to be unfrozen.
     */
    function unfreeze(
        uint256 tokenId
    ) public onlyAdmin whenNotPaused whenFrozen(tokenId) {
        _unfreeze(tokenId);
    }

    /*
     * @dev Internal function to freeze a specific token
     * @param tokenId ( uint256 ) Id of the token being frozen by the msg.sender
     */
    function _freeze(uint256 tokenId) internal {
        _tokenFrozen[tokenId] = block.timestamp + freezeDuration;
        emit Frozen(tokenId);
    }

    /*
     * @dev Internal function to freeze a specific token
     * @param tokenId ( uint256 ) Id of the token being frozen by the msg.sender
     */
    function _unfreeze(uint256 tokenId) internal {
        delete _tokenFrozen[tokenId];
        emit Unfrozen(tokenId);
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
        override(ERC721, ERC721Enumerable, AccessControl, PoapStateful)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /*     function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 amount
    ) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, firstTokenId, amount);
    } */

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
