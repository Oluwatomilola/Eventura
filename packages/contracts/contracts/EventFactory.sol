// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title EventFactory
 * @dev Factory contract for creating and managing events with multi-language support
 * Implements Base-compatible event creation with IPFS metadata storage
 */
contract EventFactory is AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ORGANIZER_ROLE = keccak256("ORGANIZER_ROLE");
    bytes32 public constant TICKETING_ROLE = keccak256("TICKETING_ROLE");

    Counters.Counter private _eventIdCounter;

    struct Event {
        uint256 id;
        address organizer;
        string metadataURI; // IPFS URI containing multi-language metadata
        uint256 startTime;
        uint256 endTime;
        uint256 ticketPrice;
        uint256 maxTickets;
        uint256 ticketsSold;
        bool active;
        uint256 createdAt;
    }

    // Mapping from event ID to Event
    mapping(uint256 => Event) public events;

    // Mapping from organizer to their event IDs
    mapping(address => uint256[]) public organizerEvents;

    // Events
    event EventCreated(
        uint256 indexed eventId,
        address indexed organizer,
        string metadataURI,
        uint256 startTime,
        uint256 endTime,
        uint256 ticketPrice,
        uint256 maxTickets
    );

    event EventUpdated(
        uint256 indexed eventId,
        string metadataURI
    );

    event EventStatusChanged(
        uint256 indexed eventId,
        bool active
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORGANIZER_ROLE, msg.sender);
        _grantRole(TICKETING_ROLE, msg.sender);
    }

    /**
     * @dev Grant organizer role to an address
     * @param organizer Address to grant organizer role
     */
    function grantOrganizerRole(address organizer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ORGANIZER_ROLE, organizer);
    }

    /**
     * @dev Create a new event with multi-language metadata stored on IPFS
     * @param metadataURI IPFS URI containing event metadata with translations
     * @param startTime Event start timestamp
     * @param endTime Event end timestamp
     * @param ticketPrice Price per ticket in wei
     * @param maxTickets Maximum number of tickets available
     * @return eventId The ID of the created event
     */
    function createEvent(
        string memory metadataURI,
        uint256 startTime,
        uint256 endTime,
        uint256 ticketPrice,
        uint256 maxTickets
    ) external onlyRole(ORGANIZER_ROLE) returns (uint256) {
        require(bytes(metadataURI).length > 0, "Metadata URI cannot be empty");
        require(startTime > block.timestamp, "Start time must be in the future");
        require(endTime > startTime, "End time must be after start time");
        require(maxTickets > 0, "Max tickets must be greater than 0");

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
            createdAt: block.timestamp
        });

        organizerEvents[msg.sender].push(eventId);

        emit EventCreated(
            eventId,
            msg.sender,
            metadataURI,
            startTime,
            endTime,
            ticketPrice,
            maxTickets
        );

        return eventId;
    }

    /**
     * @dev Update event metadata URI (for adding/updating translations)
     * @param eventId ID of the event to update
     * @param newMetadataURI New IPFS URI containing updated metadata
     */
    function updateEventMetadata(
        uint256 eventId,
        string memory newMetadataURI
    ) external {
        Event storage eventData = events[eventId];
        require(eventData.organizer == msg.sender, "Only organizer can update metadata");
        require(bytes(newMetadataURI).length > 0, "Metadata URI cannot be empty");

        eventData.metadataURI = newMetadataURI;

        emit EventUpdated(eventId, newMetadataURI);
    }

    /**
     * @dev Toggle event active status
     * @param eventId ID of the event
     * @param active New active status
     */
    function setEventStatus(uint256 eventId, bool active) external {
        Event storage eventData = events[eventId];
        require(eventData.organizer == msg.sender, "Only organizer can change status");

        eventData.active = active;

        emit EventStatusChanged(eventId, active);
    }

    /**
     * @dev Get event details
     * @param eventId ID of the event
     * @return Event data
     */
    function getEvent(uint256 eventId) external view returns (Event memory) {
        return events[eventId];
    }

    /**
     * @dev Get all events created by an organizer
     * @param organizer Address of the organizer
     * @return Array of event IDs
     */
    function getOrganizerEvents(address organizer) external view returns (uint256[] memory) {
        return organizerEvents[organizer];
    }

    /**
     * @dev Get total number of events created
     * @return Total event count
     */
    function getTotalEvents() external view returns (uint256) {
        return _eventIdCounter.current();
    }

    /**
     * @dev Increment tickets sold (to be called by ticketing contract)
     * @param eventId ID of the event
     * @param amount Number of tickets sold
     */
    function incrementTicketsSold(uint256 eventId, uint256 amount) external onlyRole(TICKETING_ROLE) {
        Event storage eventData = events[eventId];
        require(eventData.ticketsSold + amount <= eventData.maxTickets, "Exceeds max tickets");
        eventData.ticketsSold += amount;
    }
}
