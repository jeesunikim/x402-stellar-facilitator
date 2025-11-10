# X402 Stellar Facilitator Service

A facilitator service for the Stellar network, similar to Coinbase's X402 facilitator but designed specifically for Stellar transactions.

## Overview

This service implements the [x402 payment protocol](https://github.com/coinbase/x402) for the Stellar network. It provides three main endpoints for facilitating x402 payments:

- **`/verify`** - Verifies a payment according to x402 spec
- **`/settle`** - Settles a payment and submits it to the Stellar network
- **`/supported`** - Returns supported payment kinds (schemes, networks, versions)

## Features

- ✅ Full x402 payment protocol Facilitator implementation for Stellar
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
      "signature": "MEUCIQD5VqPHD9x/xj5vGfLSGJHN8lMZBF7wQ8YH/KpX2qG4wIgYEKFJ3c8vL5tQy7rN2pM4sH6fT9jW3nB1kC5xE8A=",
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
    "payTo": "GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG",
    "asset": "GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG"
  }
}
```

**Response (Success):**

```json
{
  "isValid": true,
  "payer": "GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG"
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
      "signature": "MEUCIQD5VqPHD9x/xj5vGfLSGJHN8lMZBF7wQ8YH/KpX2qG4wIgYEKFJ3c8vL5tQy7rN2pM4sH6fT9jW3nB1kC5xE8A=",
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
    "payTo": "GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG",
    "asset": "GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG"
  }
}
```

**Response (Success):**

```json
{
  "success": true,
  "payer": "GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG",
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
      "signature": "MEUCIQD5VqPHD9x/xj5vGfLSGJHN8lMZBF7wQ8YH/KpX2qG4wIgYEKFJ3c8vL5tQy7rN2pM4sH6fT9jW3nB1kC5xE8A=",
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
    "payTo": "GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG",
    "asset": "GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG"
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
      "signature": "MEUCIQD5VqPHD9x/xj5vGfLSGJHN8lMZBF7wQ8YH/KpX2qG4wIgYEKFJ3c8vL5tQy7rN2pM4sH6fT9jW3nB1kC5xE8A=",
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
    "payTo": "GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG",
    "asset": "GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG"
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
