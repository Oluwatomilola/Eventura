# API Reference

This document provides detailed information about the Eventura API endpoints, request/response formats, and usage examples.

## Base URL

```
https://api.eventura.io/v1
```

## Authentication

All API requests require authentication using a JWT token in the `Authorization` header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Rate Limiting

- **Rate Limit**: 100 requests per minute per IP address
- **Response Headers**:
  - `X-RateLimit-Limit`: Maximum number of requests allowed
  - `X-RateLimit-Remaining`: Remaining number of requests
  - `X-RateLimit-Reset`: Time when the rate limit resets (UTC timestamp)

## Endpoints

### Authentication

#### `POST /auth/login`

Authenticate a user and get an access token.

**Request Body:**
```json
{
  "walletAddress": "0x...",
  "signature": "0x...",
  "message": "Sign in to Eventura..."
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "walletAddress": "0x...",
    "username": "user123",
    "createdAt": "2023-01-01T00:00:00Z"
  }
}
```

### Events

#### `GET /events`

Get a list of events with optional filtering and pagination.

**Query Parameters:**
- `page` (number, optional, default: 1) - Page number
- `limit` (number, optional, default: 20) - Items per page
- `category` (string, optional) - Filter by category
- `upcoming` (boolean, optional) - Show only upcoming events
- `organizer` (string, optional) - Filter by organizer wallet address

**Response:**
```json
{
  "data": [
    {
      "id": "event_123",
      "title": "Blockchain Conference 2023",
      "description": "Annual blockchain conference...",
      "imageUrl": "https://ipfs.io/ipfs/...",
      "startDate": "2023-12-15T09:00:00Z",
      "endDate": "2023-12-16T18:00:00Z",
      "location": "Virtual",
      "organizer": "0x...",
      "ticketPrice": "0.1",
      "maxTickets": 1000,
      "ticketsSold": 250,
      "category": "conference",
      "createdAt": "2023-10-01T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

#### `POST /events`

Create a new event. Requires authentication.

**Request Body:**
```json
{
  "title": "My Awesome Event",
  "description": "This is a description of my event...",
  "startDate": "2024-01-15T10:00:00Z",
  "endDate": "2024-01-15T18:00:00Z",
  "location": "Virtual",
  "ticketPrice": "0.05",
  "maxTickets": 500,
  "category": "workshop",
  "imageFile": "<base64-encoded-image>"
}
```

**Response:**
```json
{
  "id": "event_456",
  "title": "My Awesome Event",
  "contractAddress": "0x...",
  "transactionHash": "0x...",
  "createdAt": "2023-11-18T12:00:00Z"
}
```

### Tickets

#### `GET /tickets`

Get tickets owned by the authenticated user.

**Response:**
```json
{
  "data": [
    {
      "id": "ticket_123",
      "eventId": "event_123",
      "tokenId": 42,
      "contractAddress": "0x...",
      "owner": "0x...",
      "imageUrl": "https://ipfs.io/ipfs/...",
      "name": "Blockchain Conference 2023 #42",
      "eventTitle": "Blockchain Conference 2023",
      "eventDate": "2023-12-15T09:00:00Z",
      "isUsed": false,
      "createdAt": "2023-11-01T14:30:00Z"
    }
  ]
}
```

#### `POST /tickets/transfer`

Transfer a ticket to another wallet address.

**Request Body:**
```json
{
  "ticketId": "ticket_123",
  "toAddress": "0x..."
}
```

**Response:**
```json
{
  "transactionHash": "0x...",
  "status": "pending"
}
```

### Marketplace

#### `GET /marketplace/listings`

Get active ticket listings.

**Query Parameters:**
- `eventId` (string, optional) - Filter by event
- `minPrice` (number, optional) - Minimum price in ETH
- `maxPrice` (number, optional) - Maximum price in ETH
- `sort` (string, optional) - Sort field (price, createdAt)
- `order` (string, optional) - Sort order (asc, desc)

**Response:**
```json
{
  "data": [
    {
      "id": "listing_123",
      "ticketId": "ticket_123",
      "seller": "0x...",
      "price": "0.15",
      "createdAt": "2023-11-15T10:00:00Z",
      "ticket": {
        "id": "ticket_123",
        "eventId": "event_123",
        "eventTitle": "Blockchain Conference 2023",
        "imageUrl": "https://ipfs.io/ipfs/..."
      }
    }
  ]
}
```

#### `POST /marketplace/list`

List a ticket for sale.

**Request Body:**
```json
{
  "ticketId": "ticket_123",
  "price": "0.15"
}
```

**Response:**
```json
{
  "id": "listing_123",
  "transactionHash": "0x...",
  "status": "pending"
}
```

## WebSocket API

### `wss://api.eventura.io/ws`

Subscribe to real-time updates for events and tickets.

**Events:**
- `ticket.purchased`
- `ticket.transferred`
- `event.created`
- `listing.created`
- `listing.sold`

**Example Subscription:**
```json
{
  "event": "subscribe",
  "channel": "ticket.purchased",
  "data": {
    "eventId": "event_123"
  }
}
```

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## Versioning

API versioning is done through the URL path:

```
https://api.eventura.io/v1/...
```

## Support

For API support, please contact support@eventura.io or visit our [Discord](https://discord.gg/eventura).
