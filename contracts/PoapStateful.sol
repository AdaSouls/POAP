// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@paima/evm-contracts/contracts/AnnotatedMintNft.sol";
import "./PoapRoles.sol";
import "./PoapPausable.sol";


// Desired Features
// - Add Event
// - Add Event Organizer
// - Mint token for an event
// - Batch Mint
// - Burn Tokens (only admin?)
// - Pause contract (only admin)
// - ERC721 full interface (base, metadata, enumerable)

contract PoapStateful is Initializable, ERC721Enumerable, AnnotatedMintNft, PoapRoles, PoapPausable {
    event EventToken(uint256 eventId, uint256 tokenId);

    // Base token URI
    string private ___baseURI;

    // Last Used id (used to generate new ids)
    uint256 private lastId;

    // EventId for each token
    mapping(uint256 => uint256) private _tokenEvent;

    bytes4 private constant INTERFACE_ID_ERC721_METADATA = 0x5b5e139f;

    constructor(string memory name_, string memory symbol_, uint256 supply_, address owner_) AnnotatedMintNft(name_, symbol_, supply_, owner_) {}

    function initialize(string memory __baseURI, address[] memory admins)
    public initializer
    {

        PoapRoles.initialize(_msgSender());
        PoapPausable.initialize();

        // Add the requested admins
        for (uint256 i = 0; i < admins.length; ++i) {
            _addAdmin(admins[i]);
        }

        //setBaseURI(__baseURI);
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
    function tokenDetailsOfOwnerByIndex(address owner, uint256 index) public view returns (uint256 tokenId, uint256 eventId) {
        tokenId = tokenOfOwnerByIndex(owner, index);
        eventId = tokenEvent(tokenId);
    }

    /* 
     * @dev Gets the token uri
     * @return string representing the token uri
     */
    function tokenURI(uint256 tokenId) override(AnnotatedMintNft, ERC721) public view returns (string memory) {
        uint eventId = _tokenEvent[tokenId];
        return _strConcat(___baseURI, _uint2str(eventId), "/", _uint2str(tokenId), "");
    }

    function approve(address to, uint256 tokenId) override(ERC721, IERC721) public whenNotPaused {
        super.approve(to, tokenId);
    }

    function setApprovalForAll(address to, bool approved) override(ERC721, IERC721) public whenNotPaused {
        super.setApprovalForAll(to, approved);
    }

    function transferFrom(address from, address to, uint256 tokenId) override(ERC721, IERC721) public whenNotPaused {
        super.transferFrom(from, to, tokenId);
    }

    /*
     * @dev Function to mint tokens
     * @param eventId EventId for the new token
     * @param to The address that will receive the minted tokens.
     * @return A boolean that indicates if the operation was successful.
     */
    function mintToken(uint256 eventId, address to)
    public whenNotPaused onlyEventMinter(eventId) returns (bool)
    {
        lastId += 1;
        return _mintToken(eventId, lastId, to);
    }

    /*
     * @dev Function to mint tokens with a specific id
     * @param eventId EventId for the new token
     * @param tokenId TokenId for the new token
     * @param to The address that will receive the minted tokens.
     * @return A boolean that indicates if the operation was successful.
     */
    function mintToken(uint256 eventId, uint256 tokenId, address to)
    public whenNotPaused onlyEventMinter(eventId) returns (bool)
    {
        return _mintToken(eventId, tokenId, to);
    }


    /*
     * @dev Function to mint tokens
     * @param eventId EventId for the new token
     * @param to The address that will receive the minted tokens.
     * @return A boolean that indicates if the operation was successful.
     */
    function mintEventToManyUsers(uint256 eventId, address[] memory to)
    public whenNotPaused onlyEventMinter(eventId) returns (bool)
    {
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
    function mintUserToManyEvents(uint256[] memory eventIds, address to)
    public whenNotPaused onlyAdmin() returns (bool)
    {
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
        require(_msgSender() == ownerOf(tokenId) || isAdmin(_msgSender()));
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
    function _mintToken(uint256 eventId, uint256 tokenId, address to) internal returns (bool) {
        // TODO Verify that the token receiver ('to') do not have already a token for the event ('eventId')
        _mint(to, tokenId);
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
    function _uint2str(uint _i) internal pure returns (string memory _uintAsString) {
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
            bstr[k--] = bytes1(uint8(48 + _i % 10));
            _i /= 10;
        }
        return string(bstr);
    }

    /*
     * @dev Function to concat strings
     * Taken from https://github.com/oraclize/ethereum-api/blob/master/oraclizeAPI_0.5.sol
     */
    function _strConcat(string memory _a, string memory _b, string memory _c, string memory _d, string memory _e)
    internal pure returns (string memory _concatenatedString)
    {
        bytes memory _ba = bytes(_a);
        bytes memory _bb = bytes(_b);
        bytes memory _bc = bytes(_c);
        bytes memory _bd = bytes(_d);
        bytes memory _be = bytes(_e);
        string memory abcde = new string(_ba.length + _bb.length + _bc.length + _bd.length + _be.length);
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
    
    // The following functions are overrides required by Solidity.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AnnotatedMintNft, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 firstTokenId, uint256 amount) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, firstTokenId, amount);
    }

    function _baseURI() internal view virtual override(ERC721, AnnotatedMintNft) returns (string memory) {
        return ___baseURI;
    }

    function totalSupply() public view virtual override(ERC721Enumerable, AnnotatedMintNft) returns (uint256) {
        return super.totalSupply();
    }

}
