# X402 Stellar Facilitator Service

A facilitator service for the Stellar network, similar to Coinbase's X402 facilitator but designed specifically for Stellar transactions.

## Overview

This service implements the [x402 payment protocol](https://github.com/coinbase/x402) for the Stellar network. It provides three main endpoints for facilitating x402 payments:

- **`/verify`** - Verifies a payment according to x402 spec
- **`/settle`** - Settles a payment and submits it to the Stellar network
- **`/supported`** - Returns supported payment kinds (schemes, networks, versions)

## Features

- ✅ Facilitator x402 payment protocol implementation for Stellar
- ✅ Zod schema validation for all requests and responses
- ✅ Support for Stellar testnet and mainnet
- ✅ Exact payment scheme support
- ✅ TypeScript with strict type checking
- ✅ Express.js REST API
- ✅ CORS enabled
- ✅ Environment-based configuration
- ✅ pnpm for fast, efficient package management

## Prerequisites

- Node.js (v18 or higher recommended)
- pnpm (install with `npm install -g pnpm`)

## Installation

```bash
# Install dependencies
pnpm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

- `PORT` - Server port (default: 3000)
- `DEFAULT_NETWORK` - Default Stellar network (testnet or mainnet)
- `FACILITATOR_SECRET_KEY` - Optional facilitator account secret key

## Development

```bash
# Run in development mode with hot reload
pnpm dev

# Build TypeScript
pnpm build

# Run production build
pnpm start

# Type check
pnpm type-check
```

## API Endpoints

### GET /health

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "service": "stellar-facilitator"
}
```

### POST /verify

Verifies a payment according to the x402 spec. Validates the payment payload and payment requirements.

**Request Body:**

```json
{
  "paymentPayload": {
    "x402Version": 1,
    "scheme": "exact",
    "network": "stellar-testnet",
    "payload": {
      "signature": "dbbf359a03dcfa9117e85892fecb90971652a531b4db3e7965f1fc7e871f799ef594f3b86a62a3b5a5ae0bc21ccf077bfaf15948eb685e9ee527a5005596ca04",
      "invokeHostOpXDR": "AAAAAgAAAADKBZBfN0sKlKKXLqxlEPLp7Fz2a9XqwQKlBqcHPzQqaAAAAGQAAOzoAAAAAQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAA"
    }
  },
  "paymentRequirements": {
    "scheme": "exact",
    "network": "stellar-testnet",
    "resource": "https://example.com/api/resource",
    "description": "Payment for API access",
    "mimeType": "application/json",
    "maxTimeoutSeconds": 3600,
    "maxAmountRequired": "1000000",
    "payTo": "GCQH2A2MCCW4TU5HKRTP35J2X4V2ZUMTCU75MRULENCFIUIKS4PJ7HHJ",
    "asset": "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA"
  }
}
```

**Response (Success):**

```json
{
  "isValid": true,
  "payer": "GA42TVHEH5ZR2O3QB5WZ6JY2G6MCX326WC2O2CJC5UIRCUMDL5S4HPT3J"
}
```

**Response (Error):**

```json
{
  "isValid": false,
  "invalidReason": "invalid_payload"
}
```

**Possible Error Reasons:**

- `invalid_payload` - Request body doesn't match schema
- `invalid_x402_version` - Unsupported x402 version
- `unsupported_scheme` - Payment scheme not supported
- `invalid_network` - Network mismatch between payload and requirements
- `unexpected_verify_error` - Internal server error

### POST /settle

Settles a payment according to the x402 spec. Submits the transaction to the Stellar network.

**Request Body:**

```json
{
  "paymentPayload": {
    "x402Version": 1,
    "scheme": "exact",
    "network": "stellar-testnet",
    "payload": {
      "signature": "dbbf359a03dcfa9117e85892fecb90971652a531b4db3e7965f1fc7e871f799ef594f3b86a62a3b5a5ae0bc21ccf077bfaf15948eb685e9ee527a5005596ca04",
      "invokeHostOpXDR": "AAAAAgAAAAA5qdTkP3MdO3APbZ8nGjeYK+9esLTtCSLtERFRg19lwwABblIAFxG2AAAAAQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAGAAAAAAAAAABUEXNXsBymnaP1a0CUFhS308Cjc6DDlrFIgm6SEg7LwEAAAAIdHJhbnNmZXIAAAADAAAAEgAAAAAAAAAAOanU5D9zHTtwD22fJxo3mCvvXrC07Qki7RERUYNfZcMAAAASAAAAAAAAAACgfQNMEK3J06dUZv31Or8rrNGTFT/WRosjRFRRCpcenwAAAAoAAAAAAAAAAAAAAAAAAAAUAAAAAQAAAAAAAAAAAAAAAVBFzV7Acpp2j9WtAlBYUt9PAo3Ogw5axSIJukhIOy8BAAAACHRyYW5zZmVyAAAAAwAAABIAAAAAAAAAADmp1OQ/cx07cA9tnycaN5gr716wtO0JIu0REVGDX2XDAAAAEgAAAAAAAAAAoH0DTBCtydOnVGb99Tq/K6zRkxU/1kaLI0RUUQqXHp8AAAAKAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAABAAAAAAAAAAEAAAAGAAAAAVBFzV7Acpp2j9WtAlBYUt9PAo3Ogw5axSIJukhIOy8BAAAAFAAAAAEAAAACAAAAAQAAAAA5qdTkP3MdO3APbZ8nGjeYK+9esLTtCSLtERFRg19lwwAAAAFVU0RDAAAAAEI+fQXy7K+/7BkrIVo/G+lq7bjY5wJUq+NBPgIH3layAAAAAQAAAACgfQNMEK3J06dUZv31Or8rrNGTFT/WRosjRFRRCpcenwAAAAFVU0RDAAAAAEI+fQXy7K+/7BkrIVo/G+lq7bjY5wJUq+NBPgIH3layAAQTzQAAAOgAAADoAAAAAAABbYoAAAAA"
    }
  },
  "paymentRequirements": {
    "scheme": "exact",
    "network": "stellar-testnet",
    "resource": "https://example.com/api/resource",
    "description": "Payment for API access",
    "mimeType": "application/json",
    "maxTimeoutSeconds": 3600,
    "maxAmountRequired": "1000000",
    "payTo": "GCQH2A2MCCW4TU5HKRTP35J2X4V2ZUMTCU75MRULENCFIUIKS4PJ7HHJ",
    "asset": "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA" // USDC Contract
  }
}
```

**Response (Success):**

```json
{
  "success": true,
  "payer": "GA42TVHEH5ZR2O3QB5WZ6JY2G6MCX326WC2O2CJC5UIRCUMDL5S4HPT3",
  "transaction": "AAAAAgAAAADKBZBfN0sKlKKXLqxlEPLp7Fz2a9XqwQKlBqcHPzQqaAAAAGQAAOzoAAAAAQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAA",
  "network": "stellar-testnet"
}
```

**Response (Error):**

```json
{
  "success": false,
  "errorReason": "invalid_payload",
  "transaction": "",
  "network": "stellar-testnet"
}
```

**Possible Error Reasons:**

- `invalid_payload` - Request body doesn't match schema
- `invalid_x402_version` - Unsupported x402 version
- `unsupported_scheme` - Payment scheme not supported
- `invalid_network` - Network mismatch between payload and requirements
- `unexpected_settle_error` - Internal server error

### GET /supported

Returns information about supported payment kinds according to the x402 spec.

**Response:**

```json
{
  "kinds": [
    {
      "x402Version": 1,
      "scheme": "exact",
      "network": "stellar-testnet"
    }
  ]
}
```

## Usage Examples

### Verify a Payment

```bash
curl -X POST http://localhost:3000/verify \
  -H "Content-Type: application/json" \
  -d '{
  "paymentPayload": {
    "x402Version": 1,
    "scheme": "exact",
    "network": "stellar-testnet",
    "payload": {
      "signature": "dbbf359a03dcfa9117e85892fecb90971652a531b4db3e7965f1fc7e871f799ef594f3b86a62a3b5a5ae0bc21ccf077bfaf15948eb685e9ee527a5005596ca04",
      "invokeHostOpXDR": "AAAAAgAAAADKBZBfN0sKlKKXLqxlEPLp7Fz2a9XqwQKlBqcHPzQqaAAAAGQAAOzoAAAAAQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAA"
    }
  },
  "paymentRequirements": {
    "scheme": "exact",
    "network": "stellar-testnet",
    "resource": "https://example.com/api/resource",
    "description": "Payment for API access",
    "mimeType": "application/json",
    "maxTimeoutSeconds": 3600,
    "maxAmountRequired": "1000000",
    "payTo": "GCQH2A2MCCW4TU5HKRTP35J2X4V2ZUMTCU75MRULENCFIUIKS4PJ7HHJ",
    "asset": "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA"
  }
}'
```

### Settle a Payment

```bash
curl -X POST http://localhost:3000/settle \
  -H "Content-Type: application/json" \
  -d '{
  "paymentPayload": {
    "x402Version": 1,
    "scheme": "exact",
    "network": "stellar-testnet",
    "payload": {
      "signature": "dbbf359a03dcfa9117e85892fecb90971652a531b4db3e7965f1fc7e871f799ef594f3b86a62a3b5a5ae0bc21ccf077bfaf15948eb685e9ee527a5005596ca04",
      "invokeHostOpXDR": "AAAAAgAAAADKBZBfN0sKlKKXLqxlEPLp7Fz2a9XqwQKlBqcHPzQqaAAAAGQAAOzoAAAAAQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAA"
    }
  },
  "paymentRequirements": {
    "scheme": "exact",
    "network": "stellar-testnet",
    "resource": "https://example.com/api/resource",
    "description": "Payment for API access",
    "mimeType": "application/json",
    "maxTimeoutSeconds": 3600,
    "maxAmountRequired": "1000000",
    "payTo": "GCQH2A2MCCW4TU5HKRTP35J2X4V2ZUMTCU75MRULENCFIUIKS4PJ7HHJ",
    "asset": "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA"
  }
}'
```

### Get Supported Payment Kinds

```bash
curl http://localhost:3000/supported
```

## Architecture

- **`src/index.ts`** - Main Express server with x402 endpoint handlers
- **`src/stellar.ts`** - Stellar SDK utilities and helpers
- **`src/types.ts`** - TypeScript type definitions and Zod schemas for x402 spec

## Stellar Network

This service connects to Stellar's RPC:

- **Testnet**: https://soroban-testnet.stellar.org
- **Mainnet**: https://mainnet.sorobanrpc.com

## License

MIT
