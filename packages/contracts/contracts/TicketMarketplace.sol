// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface IEventTicket {
    function eventId() external view returns (uint256);
    function originalPrice() external view returns (uint256);
    function eventEndTime() external view returns (uint256);
    function isCheckedIn(uint256 tokenId) external view returns (bool);
    function organizer() external view returns (address);
}

/**
 * @title TicketMarketplace
 * @dev Secondary marketplace for ticket resales with organizer royalties
 */
contract TicketMarketplace is ReentrancyGuard, Ownable, Pausable {
    using Counters for Counters.Counter;
    
    struct Listing {
        uint256 id;
        address seller;
        address nft;
        uint256 tokenId;
        uint256 eventId;
        uint128 price;
        uint128 originalPrice;
        bool active;
        uint256 listedAt;
    }

    // Platform fee in basis points (1% = 100)
    uint16 public constant PLATFORM_FEE_BPS = 250; // 2.5%
    uint16 public constant MAX_ROYALTY_BPS = 1000; // 10% max
    uint16 public constant MAX_PRICE_MULTIPLIER = 200; // 2x original price

    Counters.Counter private _listingIdCounter;
    
    // Listing ID => Listing
    mapping(uint256 => Listing) public listings;
    // NFT => Token ID => Listing ID (for quick lookup)
    mapping(address => mapping(uint256 => uint256)) private _tokenToListingId;
    // User => Listing IDs
    mapping(address => uint256[]) private _userListings;
    // Event ID => Royalty in basis points
    mapping(uint256 => uint16) public eventRoyalties;
    // User => ETH balance
    mapping(address => uint256) public proceeds;

    address public feeRecipient;
    bool public enforcePriceCeiling;

    event TicketListed(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nft,
        uint256 tokenId,
        uint256 eventId,
        uint128 price
    );
    
    event TicketSold(
        uint256 indexed listingId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        uint256 platformFee,
        uint256 royaltyFee
    );
    
    event ListingCancelled(uint256 indexed listingId);
    event PriceUpdated(uint256 indexed listingId, uint128 oldPrice, uint128 newPrice);
    event RoyaltyUpdated(uint256 indexed eventId, uint16 royaltyBps);
    event ProceedsWithdrawn(address indexed user, uint256 amount);
    event PriceCeilingToggled(bool enabled);

    constructor(address _feeRecipient) Ownable(msg.sender) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
        enforcePriceCeiling = true;
        _pause(); // Start paused until initialized
    }

    function initialize() external onlyOwner {
        _unpause();
    }

    function togglePause() external onlyOwner {
        if (paused()) {
            _unpause();
        } else {
            _pause();
        }
    }

    function togglePriceCeiling() external onlyOwner {
        enforcePriceCeiling = !enforcePriceCeiling;
        emit PriceCeilingToggled(enforcePriceCeiling);
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    function setEventRoyalty(uint256 eventId, uint16 royaltyBps) external onlyOwner {
        require(royaltyBps <= MAX_ROYALTY_BPS, "Royalty too high");
        eventRoyalties[eventId] = royaltyBps;
        emit RoyaltyUpdated(eventId, royaltyBps);
    }

    function listTicket(
        address nft,
        uint256 tokenId,
        uint128 price
    ) external nonReentrant whenNotPaused {
        require(price > 0, "Price must be > 0");
        
        IERC721 token = IERC721(nft);
        require(token.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(
            token.getApproved(tokenId) == address(this) || 
            token.isApprovedForAll(msg.sender, address(this)),
            "Not approved"
        );

        // Check if already listed
        require(_tokenToListingId[nft][tokenId] == 0, "Already listed");

        // Get event details
        IEventTicket ticket = IEventTicket(nft);
        uint256 eventId = ticket.eventId();
        uint128 originalPrice = ticket.originalPrice();
        
        // Validate listing conditions
        require(block.timestamp < ticket.eventEndTime(), "Event has ended");
        require(!ticket.isCheckedIn(tokenId), "Ticket already checked in");
        
        // Enforce price ceiling (if enabled)
        if (enforcePriceCeiling) {
            uint256 maxPrice = (uint256(originalPrice) * MAX_PRICE_MULTIPLIER) / 100;
            require(price <= maxPrice, "Price exceeds maximum allowed");
        }

        // Create new listing
        _listingIdCounter.increment();
        uint256 listingId = _listingIdCounter.current();
        
        listings[listingId] = Listing({
            id: listingId,
            seller: msg.sender,
            nft: nft,
            tokenId: tokenId,
            eventId: eventId,
            price: price,
            originalPrice: originalPrice,
            active: true,
            listedAt: block.timestamp
        });
        
        _tokenToListingId[nft][tokenId] = listingId;
        _userListings[msg.sender].push(listingId);
        
        // Transfer NFT to marketplace (escrow)
        token.safeTransferFrom(msg.sender, address(this), tokenId);
        
        emit TicketListed(listingId, msg.sender, nft, tokenId, eventId, price);
    }

    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not seller");
        
        _cancelListing(listingId, listing);
    }
    
    function _cancelListing(uint256 listingId, Listing storage listing) internal {
        // Transfer NFT back to seller
        IERC721(listing.nft).safeTransferFrom(address(this), listing.seller, listing.tokenId);
        
        // Clean up storage
        delete _tokenToListingId[listing.nft][listing.tokenId];
        delete listings[listingId];
        
        emit ListingCancelled(listingId);
    }

    function buyTicket(uint256 listingId) external payable nonReentrant whenNotPaused {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(msg.value == listing.price, "Incorrect payment amount");
        
        IEventTicket ticket = IEventTicket(listing.nft);
        require(block.timestamp < ticket.eventEndTime(), "Event has ended");
        
        // Calculate fees
        uint256 platformFee = (msg.value * PLATFORM_FEE_BPS) / 10000;
        uint256 royaltyFee = 0;
        uint256 sellerAmount = msg.value - platformFee;
        
        // Calculate organizer royalty if set
        uint16 royaltyBps = eventRoyalties[listing.eventId];
        if (royaltyBps > 0) {
            royaltyFee = (msg.value * royaltyBps) / 10000;
            sellerAmount -= royaltyFee;
            address organizer = ticket.organizer();
            proceeds[organizer] += royaltyFee;
        }
        
        // Update balances
        proceeds[feeRecipient] += platformFee;
        proceeds[listing.seller] += sellerAmount;
        
        // Transfer NFT to buyer
        IERC721(listing.nft).safeTransferFrom(address(this), msg.sender, listing.tokenId);
        
        // Clean up
        delete _tokenToListingId[listing.nft][listing.tokenId];
        listing.active = false;
        
        emit TicketSold(
            listingId,
            listing.seller,
            msg.sender,
            listing.price,
            platformFee,
            royaltyFee
        );
    }
    
    function updatePrice(uint256 listingId, uint128 newPrice) external nonReentrant {
        require(newPrice > 0, "Price must be > 0");
        
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not seller");
        
        // Enforce price ceiling (if enabled)
        if (enforcePriceCeiling) {
            uint256 maxPrice = (uint256(listing.originalPrice) * MAX_PRICE_MULTIPLIER) / 100;
            require(newPrice <= maxPrice, "Price exceeds maximum allowed");
        }
        
        uint128 oldPrice = listing.price;
        listing.price = newPrice;
        
        emit PriceUpdated(listingId, oldPrice, newPrice);
    }
    
    function withdrawProceeds() external nonReentrant {
        uint256 amount = proceeds[msg.sender];
        require(amount > 0, "No proceeds to withdraw");
        
        proceeds[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit ProceedsWithdrawn(msg.sender, amount);
    }
    
    function getUserListings(address user) external view returns (uint256[] memory) {
        return _userListings[user];
    }
    
    function getActiveListings() external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // First pass: count active listings
        for (uint256 i = 1; i <= _listingIdCounter.current(); i++) {
            if (listings[i].active) {
                count++;
            }
        }
        
        // Second pass: collect active listing IDs
        uint256[] memory activeListings = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= _listingIdCounter.current(); i++) {
            if (listings[i].active) {
                activeListings[index] = i;
                index++;
            }
        }
        
        return activeListings;
    }
    
    function getListingDetails(uint256 listingId) external view returns (
        address seller,
        address nft,
        uint256 tokenId,
        uint256 eventId,
        uint128 price,
        uint128 originalPrice,
        uint256 listedAt
    ) {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        
        return (
            listing.seller,
            listing.nft,
            listing.tokenId,
            listing.eventId,
            listing.price,
            listing.originalPrice,
            listing.listedAt
        );
    }
    
    // Required to receive NFTs
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
        emit Purchased(nft, tokenId, msg.sender, l.price, fee);
    }

    function makeOffer(address nft, uint256 tokenId) external payable nonReentrant {
        require(msg.value > 0, "no value");
        Offer storage current = bestOffers[nft][tokenId];
        if (current.amount > 0) {
            require(msg.value > current.amount, "low offer");
            _refund(current.offerer, current.amount);
        }
        bestOffers[nft][tokenId] = Offer({offerer: msg.sender, amount: uint128(msg.value)});
        emit OfferMade(nft, tokenId, msg.sender, uint128(msg.value));
    }

    function cancelOffer(address nft, uint256 tokenId) external nonReentrant {
        Offer storage current = bestOffers[nft][tokenId];
        require(current.offerer == msg.sender, "not offerer");
        uint128 amount = current.amount;
        delete bestOffers[nft][tokenId];
        _refund(msg.sender, amount);
        emit OfferCanceled(nft, tokenId, msg.sender, amount);
    }

    function acceptOffer(address nft, uint256 tokenId) external nonReentrant {
        IERC721 token = IERC721(nft);
        require(token.ownerOf(tokenId) == msg.sender, "not owner");
        require(
            token.getApproved(tokenId) == address(this) || token.isApprovedForAll(msg.sender, address(this)),
            "not approved"
        );

        Offer storage current = bestOffers[nft][tokenId];
        require(current.amount > 0, "no offer");
        address buyer = current.offerer;
        uint256 amount = current.amount;
        delete bestOffers[nft][tokenId];
        delete listings[nft][tokenId];

        uint256 fee = (amount * feeBps) / 10000;
        uint256 sellerAmount = amount - fee;
        proceeds[feeRecipient] += fee;
        proceeds[msg.sender] += sellerAmount;

        token.safeTransferFrom(msg.sender, buyer, tokenId);
        emit OfferAccepted(nft, tokenId, msg.sender, buyer, uint128(amount), fee);
    }

    function withdrawProceeds() external nonReentrant {
        uint256 amount = proceeds[msg.sender];
        require(amount > 0, "no proceeds");
        proceeds[msg.sender] = 0;
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "withdraw failed");
        emit ProceedsWithdrawn(msg.sender, amount);
    }

    function _refund(address to, uint128 amount) internal {
        if (amount == 0) return;
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "refund failed");
    }
}
