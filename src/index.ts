/**
 * Stellar Facilitator Service
 * Similar to Coinbase X402 facilitator but for Stellar network
 */

import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  VerifyRequest,
  VerifyResponse,
  SettleRequest,
  SettleResponse,
  VerifyRequestSchema,
  SettleRequestSchema,
  SupportedPaymentKindsResponse,
} from "./types";

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Health check endpoint
 */
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "stellar-facilitator" });
});

/**
 * /verify endpoint
 * Verifies a payment according to x402 spec
 * Expects: { paymentPayload, paymentRequirements }
 * Returns: { isValid, invalidReason?, payer? }
 */
app.post("/verify", async (req: Request, res: Response) => {
  try {
    // Validate request body against schema
    const validationResult = VerifyRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
      console.error("Validation failed:", JSON.stringify(validationResult.error.issues, null, 2));
      return res.status(400).json({
        isValid: false,
        invalidReason: "invalid_payload",
        details: validationResult.error.issues, // Include validation details for debugging
      } as VerifyResponse);
    }

    const { paymentPayload, paymentRequirements }: VerifyRequest =
      validationResult.data;

    // Validate x402Version
    if (paymentPayload.x402Version !== 1) {
      return res.status(400).json({
        isValid: false,
        invalidReason: "invalid_x402_version",
      } as VerifyResponse);
    }

    // Validate scheme
    if (paymentPayload.scheme !== "exact") {
      return res.status(400).json({
        isValid: false,
        invalidReason: "unsupported_scheme",
      } as VerifyResponse);
    }

    // Validate network match
    if (paymentPayload.network !== paymentRequirements.network) {
      return res.status(400).json({
        isValid: false,
        invalidReason: "invalid_network",
      } as VerifyResponse);
    }

    // TODO: Verify the actual Stellar transaction using paymentPayload.payload
    // For now, return a basic valid response
    return res.json({
      isValid: true,
      payer: paymentRequirements.payTo, // This should be extracted from the transaction
    } as VerifyResponse);
  } catch (error: any) {
    return res.status(500).json({
      isValid: false,
      invalidReason: "unexpected_verify_error",
    } as VerifyResponse);
  }
});

/**
 * /settle endpoint
 * Settles a payment according to x402 spec
 * Expects: { paymentPayload, paymentRequirements }
 * Returns: { success, errorReason?, payer?, transaction, network }
 */
app.post("/settle", async (req: Request, res: Response) => {
  try {
    // Validate request body against schema
    const validationResult = SettleRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        errorReason: "invalid_payload",
        transaction: "",
        network: "stellar-testnet",
      } as SettleResponse);
    }

    const { paymentPayload, paymentRequirements }: SettleRequest =
      validationResult.data;

    // Validate x402Version
    if (paymentPayload.x402Version !== 1) {
      return res.status(400).json({
        success: false,
        errorReason: "invalid_x402_version",
        transaction: "",
        network: paymentPayload.network,
      } as SettleResponse);
    }

    // Validate scheme
    if (paymentPayload.scheme !== "exact") {
      return res.status(400).json({
        success: false,
        errorReason: "unsupported_scheme",
        transaction: "",
        network: paymentPayload.network,
      } as SettleResponse);
    }

    // Validate network match
    if (paymentPayload.network !== paymentRequirements.network) {
      return res.status(400).json({
        success: false,
        errorReason: "invalid_network",
        transaction: "",
        network: paymentPayload.network,
      } as SettleResponse);
    }

    // TODO: Submit the transaction to Stellar network using paymentPayload.payload
    // For now, return a mock successful response
    return res.json({
      success: true,
      payer: paymentRequirements.payTo, // This should be extracted from the transaction
      transaction: paymentPayload.payload.invokeHostOpXDR, // Return the transaction XDR
      network: paymentPayload.network,
    } as SettleResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      errorReason: "unexpected_settle_error",
      transaction: "",
      network: "stellar-testnet",
    } as SettleResponse);
  }
});

/**
 * /supported endpoint
 * Returns information about supported payment kinds according to x402 spec
 */
app.get("/supported", (_req: Request, res: Response) => {
  try {
    const response: SupportedPaymentKindsResponse = {
      kinds: [
        {
          x402Version: 1,
          scheme: "exact",
          network: "stellar-testnet",
        },
      ],
    };

    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Stellar Facilitator Service running on port ${PORT}`);
  console.log(`📡 Endpoints available:`);
  console.log(`   GET  /health`);
  console.log(`   POST /verify`);
  console.log(`   POST /settle`);
  console.log(`   GET  /supported`);
});

export default app;
