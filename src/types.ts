/**
 * Type definitions for the Stellar Facilitator Service
 * Also imports x402 Spec
 * https://github.com/coinbase/x402/blob/main/typescript/packages/x402/src/types/verify/x402Specs.ts
 */

import { StrKey } from "@stellar/stellar-sdk";
import { z } from "zod";

export const Base64EncodedRegex = /^[A-Za-z0-9+/]*={0,2}$/;

export interface SupportedResponse {
  networks: string[];
  operations: string[];
  assets?: string[];
  version: string;
}

export interface TransactionInfo {
  hash: string;
  status: string;
  sourceAccount: string;
  operations: any[];
  createdAt: string;
}

export const NetworkSchema = z.enum([
  "abstract",
  "abstract-testnet",
  "base-sepolia",
  "base",
  "avalanche-fuji",
  "avalanche",
  "iotex",
  "solana-devnet",
  "solana",
  "sei",
  "sei-testnet",
  "polygon",
  "polygon-amoy",
  "peaq",
  "story",
  "skale-base-sepolia",
  "stellar-testnet",
  "stellar-mainnet",
]);

// Enums
export const schemes = ["exact"] as const;
export const x402Versions = [1] as const;
export const ErrorReasons = [
  "invalid_network",
  "invalid_payload",
  "invalid_payment_requirements",
  "invalid_scheme",
  "invalid_payment",
  "payment_expired",
  "unsupported_scheme",
  "invalid_x402_version",
  "invalid_transaction_state",
  "invalid_x402_version",
  "unsupported_scheme",
  "unexpected_settle_error",
  "unexpected_verify_error",
] as const;

// Refiners
const isInteger: (value: string) => boolean = (value) =>
  Number.isInteger(Number(value)) && Number(value) >= 0;
const isValidStellarEd25519PublicKey = (value: string): boolean =>
  StrKey.isValidEd25519PublicKey(value);
const isValidStellarContractAddress = (value: string): boolean =>
  StrKey.isValidContract(value);
export const HexSignatureRegex = /^[0-9a-fA-F]{128}$/;

// x402PaymentRequirements
export const StellarAddress = z
  .string()
  .refine(isValidStellarEd25519PublicKey)
  .or(z.string().refine(isValidStellarContractAddress));

/* For the Server Side */
export const PaymentRequirementsSchemaExtra = z.object({
  transactionSourceAccount: StellarAddress,
  networkPassphrase: NetworkSchema,
  muxAccountId: z.string().optional(),
  maxLedger: z.number().int().optional(),
  canSponsor: z.boolean().optional(),
});

export const PaymentRequirementsSchema = z.object({
  scheme: z.enum(schemes),
  network: NetworkSchema,
  resource: z.string().url(),
  description: z.string(),
  mimeType: z.string(),
  maxTimeoutSeconds: z.number().int(),
  maxAmountRequired: z.string().refine(isInteger),
  payTo: StellarAddress,
  asset: StellarAddress,
  extra: PaymentRequirementsSchemaExtra.optional(),
});

export type PaymentRequirements = z.infer<typeof PaymentRequirementsSchema>;
/* For the Server Side End */

/* X-Payment Header Payload */
export const ExactStellarPayloadAuthorizationSchema = z.object({
  signature: z
    .string()
    .regex(
      HexSignatureRegex,
      "Signature must be a 128-character hexadecimal string (Ed25519 signature)"
    ),

  invokeHostOpXDR: z.string().regex(Base64EncodedRegex),
});
export type ExactStellarPayloadAuthorization = z.infer<
  typeof ExactStellarPayloadAuthorizationSchema
>;

// x402PaymentPayload
export const PaymentPayloadSchema = z.object({
  x402Version: z.number().refine((val) => x402Versions.includes(val as 1)),
  scheme: z.enum(schemes),
  network: NetworkSchema,
  payload: ExactStellarPayloadAuthorizationSchema,
});
export type PaymentPayload = z.infer<typeof PaymentPayloadSchema>;
export type UnsignedPaymentPayload = Omit<PaymentPayload, "payload"> & {
  payload: Omit<ExactStellarPayloadAuthorization, "signature"> & {
    signature: undefined;
  };
};

// x402 Resource Server Response
export const x402ResponseSchema = z.object({
  x402Version: z.number().refine((val) => x402Versions.includes(val as 1)),
  error: z.enum(ErrorReasons).optional(),
  accepts: z.array(PaymentPayloadSchema).optional(),
  payer: StellarAddress.optional(),
});
export type x402Response = z.infer<typeof x402ResponseSchema>;

// x402RequestStructure
const HTTPVerbsSchema = z.enum([
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "OPTIONS",
  "HEAD",
]);
export type HTTPVerbs = z.infer<typeof HTTPVerbsSchema>;

export const HTTPRequestStructureSchema = z.object({
  type: z.literal("http"),
  method: HTTPVerbsSchema,
  queryParams: z.record(z.string(), z.string()).optional(),
  bodyType: z
    .enum(["json", "form-data", "multipart-form-data", "text", "binary"])
    .optional(),
  bodyFields: z.record(z.string(), z.any()).optional(),
  headerFields: z.record(z.string(), z.any()).optional(),
});

export const RequestStructureSchema = z.discriminatedUnion("type", [
  HTTPRequestStructureSchema,
]);

export type HTTPRequestStructure = z.infer<typeof HTTPRequestStructureSchema>;

export type RequestStructure = z.infer<typeof RequestStructureSchema>;

// x402SettleRequest
export const SettleRequestSchema = z.object({
  paymentPayload: PaymentPayloadSchema,
  paymentRequirements: PaymentRequirementsSchema,
});
export type SettleRequest = z.infer<typeof SettleRequestSchema>;

// x402VerifyRequest
export const VerifyRequestSchema = z.object({
  paymentPayload: PaymentPayloadSchema,
  paymentRequirements: PaymentRequirementsSchema,
});
export type VerifyRequest = z.infer<typeof VerifyRequestSchema>;

// x402VerifyResponse
export const VerifyResponseSchema = z.object({
  isValid: z.boolean(),
  invalidReason: z.enum(ErrorReasons).optional(),
  payer: StellarAddress.optional(),
});
export type VerifyResponse = z.infer<typeof VerifyResponseSchema>;

// x402SettleResponse
export const SettleResponseSchema = z.object({
  success: z.boolean(),
  errorReason: z.enum(ErrorReasons).optional(),
  payer: StellarAddress.optional(),
  transaction: z.string().regex(Base64EncodedRegex),
  network: NetworkSchema,
});
export type SettleResponse = z.infer<typeof SettleResponseSchema>;

// x402SupportedPaymentKind
export const SupportedPaymentKindSchema = z.object({
  x402Version: z.number().refine((val) => x402Versions.includes(val as 1)),
  scheme: z.enum(schemes),
  network: NetworkSchema,
  extra: z.record(z.any()).optional(),
});
export type SupportedPaymentKind = z.infer<typeof SupportedPaymentKindSchema>;

// x402SupportedPaymentKindsResponse
export const SupportedPaymentKindsResponseSchema = z.object({
  kinds: z.array(SupportedPaymentKindSchema),
});
export type SupportedPaymentKindsResponse = z.infer<
  typeof SupportedPaymentKindsResponseSchema
>;
