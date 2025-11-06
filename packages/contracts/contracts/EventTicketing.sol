// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title EventTicketing
 * @dev Event ticketing system with NFT tickets and waitlist functionality
 * Optimized for Base L2 deployment
 */
contract EventTicketing is ERC721, ERC721URIStorage, AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;

    bytes32 public constant ORGANIZER_ROLE = keccak256("ORGANIZER_ROLE");

    Counters.Counter private _eventIdCounter;
    Counters.Counter private _ticketIdCounter;

    struct Event {
        uint256 id;
        address organizer;
        string metadataURI; // IPFS URI with multi-language event metadata
        uint256 startTime;
        uint256 endTime;
        uint256 ticketPrice;
        uint256 maxTickets;
        uint256 ticketsSold;
        bool active;
        bool cancelled;
        uint256 createdAt;
    }

    struct Ticket {
        uint256 ticketId;
        uint256 eventId;
        address owner;
        bool used;
        uint256 purchaseTime;
    }

    struct WaitlistEntry {
        address user;
        uint256 joinedAt;
        bool notified;
    }

    // Events
    event EventCreated(
        uint256 indexed eventId,
        address indexed organizer,
        string metadataURI,
        uint256 ticketPrice,
        uint256 maxTickets
    );

    event TicketPurchased(
        uint256 indexed ticketId,
        uint256 indexed eventId,
        address indexed buyer,
        uint256 price
    );

    event TicketRefunded(
        uint256 indexed ticketId,
        uint256 indexed eventId,
        address indexed owner,
        uint256 amount
    );

    event EventCancelled(uint256 indexed eventId);

    event WaitlistJoined(
        uint256 indexed eventId,
        address indexed user,
        uint256 position
    );

    event WaitlistLeft(
        uint256 indexed eventId,
        address indexed user
    );

    event WaitlistNotified(
        uint256 indexed eventId,
        address indexed user,
        uint256 ticketsAvailable
    );

    // Mappings
    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;
    mapping(uint256 => WaitlistEntry[]) public eventWaitlists;
    mapping(uint256 => mapping(address => uint256)) public waitlistPositions; // eventId => user => position (1-indexed, 0 means not in waitlist)
    mapping(uint256 => mapping(address => bool)) public hasTicket; // eventId => user => hasTicket
    mapping(address => uint256[]) public userTickets;
    mapping(address => uint256[]) public organizerEvents;

    constructor() ERC721("EventTicket", "ETKT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORGANIZER_ROLE, msg.sender);
    }

    // ============ Event Management Functions ============

    /**
     * @dev Create a new event
     * @param metadataURI IPFS URI containing multi-language event metadata
     * @param startTime Event start timestamp
     * @param endTime Event end timestamp
     * @param ticketPrice Price per ticket in wei
     * @param maxTickets Maximum number of tickets available
     */
    function createEvent(
        string memory metadataURI,
        uint256 startTime,
        uint256 endTime,
        uint256 ticketPrice,
        uint256 maxTickets
    ) external onlyRole(ORGANIZER_ROLE) returns (uint256) {
        require(startTime > block.timestamp, "Start time must be in future");
        require(endTime > startTime, "End time must be after start time");
        require(maxTickets > 0, "Must have at least one ticket");

        uint256 eventId = _eventIdCounter.current();
        _eventIdCounter.increment();

        events[eventId] = Event({
            id: eventId,
            organizer: msg.sender,
            metadataURI: metadataURI,
            startTime: startTime,
            endTime: endTime,
            ticketPrice: ticketPrice,
            maxTickets: maxTickets,
            ticketsSold: 0,
            active: true,
            cancelled: false,
            createdAt: block.timestamp
        });

        organizerEvents[msg.sender].push(eventId);

        emit EventCreated(eventId, msg.sender, metadataURI, ticketPrice, maxTickets);

        return eventId;
    }

    /**
     * @dev Cancel an event and refund all tickets
     * @param eventId The ID of the event to cancel
     */
    function cancelEvent(uint256 eventId) external nonReentrant {
        Event storage eventData = events[eventId];
        require(eventData.organizer == msg.sender, "Only organizer can cancel");
        require(!eventData.cancelled, "Event already cancelled");
        require(eventData.active, "Event not active");

        eventData.cancelled = true;
        eventData.active = false;

        emit EventCancelled(eventId);
    }

    // ============ Ticket Purchase Functions ============

    /**
     * @dev Purchase a ticket for an event
     * @param eventId The ID of the event
     */
    function purchaseTicket(uint256 eventId)
        external
        payable
        nonReentrant
        returns (uint256)
    {
        Event storage eventData = events[eventId];

        require(eventData.active, "Event not active");
        require(!eventData.cancelled, "Event cancelled");
        require(block.timestamp < eventData.startTime, "Event already started");
        require(eventData.ticketsSold < eventData.maxTickets, "Event sold out");
        require(!hasTicket[eventId][msg.sender], "Already has ticket");
        require(msg.value >= eventData.ticketPrice, "Insufficient payment");

        uint256 ticketId = _ticketIdCounter.current();
        _ticketIdCounter.increment();

        // Mint NFT ticket
        _safeMint(msg.sender, ticketId);
        _setTokenURI(ticketId, eventData.metadataURI);

        // Store ticket data
        tickets[ticketId] = Ticket({
            ticketId: ticketId,
            eventId: eventId,
            owner: msg.sender,
            used: false,
            purchaseTime: block.timestamp
        });

        eventData.ticketsSold++;
        hasTicket[eventId][msg.sender] = true;
        userTickets[msg.sender].push(ticketId);

        // Remove from waitlist if user was on it
        _removeFromWaitlist(eventId, msg.sender);

        // Transfer payment to organizer
        payable(eventData.organizer).transfer(msg.value);

        emit TicketPurchased(ticketId, eventId, msg.sender, msg.value);

        return ticketId;
    }

    /**
     * @dev Refund a ticket before the event starts
     * @param ticketId The ID of the ticket to refund
     */
    function refundTicket(uint256 ticketId) external nonReentrant {
        require(_exists(ticketId), "Ticket does not exist");

        Ticket storage ticket = tickets[ticketId];
        Event storage eventData = events[ticket.eventId];

        require(ownerOf(ticketId) == msg.sender, "Not ticket owner");
        require(!ticket.used, "Ticket already used");
        require(!eventData.cancelled, "Event cancelled");
        require(block.timestamp < eventData.startTime, "Event already started");

        uint256 refundAmount = eventData.ticketPrice;

        // Burn the NFT
        _burn(ticketId);

        // Update state
        eventData.ticketsSold--;
        hasTicket[ticket.eventId][msg.sender] = false;
        ticket.used = true;

        // Refund payment
        payable(msg.sender).transfer(refundAmount);

        emit TicketRefunded(ticketId, ticket.eventId, msg.sender, refundAmount);

        // Notify waitlist if tickets now available
        _notifyWaitlist(ticket.eventId);
    }

    // ============ Waitlist Functions ============

    /**
     * @dev Join the waitlist for a sold-out event
     * @param eventId The ID of the event
     */
    function joinWaitlist(uint256 eventId) external {
        Event storage eventData = events[eventId];

        require(eventData.active, "Event not active");
        require(!eventData.cancelled, "Event cancelled");
        require(block.timestamp < eventData.startTime, "Event already started");
        require(!hasTicket[eventId][msg.sender], "Already has ticket");
        require(waitlistPositions[eventId][msg.sender] == 0, "Already in waitlist");

        WaitlistEntry memory entry = WaitlistEntry({
            user: msg.sender,
            joinedAt: block.timestamp,
            notified: false
        });

        eventWaitlists[eventId].push(entry);
        waitlistPositions[eventId][msg.sender] = eventWaitlists[eventId].length;

        emit WaitlistJoined(eventId, msg.sender, eventWaitlists[eventId].length);
    }

    /**
     * @dev Leave the waitlist for an event
     * @param eventId The ID of the event
     */
    function leaveWaitlist(uint256 eventId) external {
        require(waitlistPositions[eventId][msg.sender] > 0, "Not in waitlist");

        _removeFromWaitlist(eventId, msg.sender);

        emit WaitlistLeft(eventId, msg.sender);
    }

    /**
     * @dev Internal function to remove user from waitlist
     * @param eventId The ID of the event
     * @param user The address of the user
     */
    function _removeFromWaitlist(uint256 eventId, address user) internal {
        uint256 position = waitlistPositions[eventId][user];
        if (position == 0) return; // Not in waitlist

        WaitlistEntry[] storage waitlist = eventWaitlists[eventId];
        uint256 lastIndex = waitlist.length - 1;
        uint256 removeIndex = position - 1; // Convert to 0-indexed

        // Swap with last element
        if (removeIndex != lastIndex) {
            WaitlistEntry memory lastEntry = waitlist[lastIndex];
            waitlist[removeIndex] = lastEntry;
            waitlistPositions[eventId][lastEntry.user] = position;
        }

        // Remove last element
        waitlist.pop();
        delete waitlistPositions[eventId][user];
    }

    /**
     * @dev Internal function to notify waitlist when tickets become available
     * @param eventId The ID of the event
     */
    function _notifyWaitlist(uint256 eventId) internal {
        Event storage eventData = events[eventId];
        WaitlistEntry[] storage waitlist = eventWaitlists[eventId];

        uint256 ticketsAvailable = eventData.maxTickets - eventData.ticketsSold;
        if (ticketsAvailable == 0 || waitlist.length == 0) return;

        // Notify up to the number of tickets available
        uint256 toNotify = ticketsAvailable < waitlist.length ? ticketsAvailable : waitlist.length;

        for (uint256 i = 0; i < toNotify; i++) {
            if (!waitlist[i].notified) {
                waitlist[i].notified = true;
                emit WaitlistNotified(eventId, waitlist[i].user, ticketsAvailable);
            }
        }
    }

    // ============ View Functions ============

    /**
     * @dev Get waitlist position for a user
     * @param eventId The ID of the event
     * @param user The address of the user
     * @return position The position in the waitlist (1-indexed, 0 if not in waitlist)
     */
    function getWaitlistPosition(uint256 eventId, address user)
        external
        view
        returns (uint256)
    {
        return waitlistPositions[eventId][user];
    }

    /**
     * @dev Get total number of people in waitlist
     * @param eventId The ID of the event
     * @return count The number of people in the waitlist
     */
    function getWaitlistCount(uint256 eventId) external view returns (uint256) {
        return eventWaitlists[eventId].length;
    }

    /**
     * @dev Get waitlist entries for an event
     * @param eventId The ID of the event
     * @return entries Array of waitlist entries
     */
    function getWaitlist(uint256 eventId)
        external
        view
        returns (WaitlistEntry[] memory)
    {
        return eventWaitlists[eventId];
    }

    /**
     * @dev Check if event is sold out
     * @param eventId The ID of the event
     * @return bool True if sold out
     */
    function isSoldOut(uint256 eventId) external view returns (bool) {
        Event storage eventData = events[eventId];
        return eventData.ticketsSold >= eventData.maxTickets;
    }

    /**
     * @dev Get number of tickets available
     * @param eventId The ID of the event
     * @return uint256 Number of tickets still available
     */
    function getAvailableTickets(uint256 eventId) external view returns (uint256) {
        Event storage eventData = events[eventId];
        return eventData.maxTickets - eventData.ticketsSold;
    }

    /**
     * @dev Get all tickets owned by a user
     * @param user The address of the user
     * @return uint256[] Array of ticket IDs
     */
    function getUserTickets(address user) external view returns (uint256[] memory) {
        return userTickets[user];
    }

    /**
     * @dev Get all events created by an organizer
     * @param organizer The address of the organizer
     * @return uint256[] Array of event IDs
     */
    function getOrganizerEvents(address organizer)
        external
        view
        returns (uint256[] memory)
    {
        return organizerEvents[organizer];
    }

    /**
     * @dev Get event details
     * @param eventId The ID of the event
     * @return Event struct
     */
    function getEvent(uint256 eventId) external view returns (Event memory) {
        return events[eventId];
    }

    /**
     * @dev Get ticket details
     * @param ticketId The ID of the ticket
     * @return Ticket struct
     */
    function getTicket(uint256 ticketId) external view returns (Ticket memory) {
        return tickets[ticketId];
    }

    // ============ Admin Functions ============

    /**
     * @dev Grant organizer role to an address
     * @param account The address to grant the role to
     */
    function grantOrganizerRole(address account)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        grantRole(ORGANIZER_ROLE, account);
    }

    /**
     * @dev Revoke organizer role from an address
     * @param account The address to revoke the role from
     */
    function revokeOrganizerRole(address account)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        revokeRole(ORGANIZER_ROLE, account);
    }

    // ============ Required Overrides ============

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
