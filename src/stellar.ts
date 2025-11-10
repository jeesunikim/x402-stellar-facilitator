/**
 * Stellar network utilities and helpers
 */

import {
  rpc as StellarRpc,
  TransactionBuilder,
  Networks,
} from "@stellar/stellar-sdk";

export function getStellarRpcServer(
  network: "testnet" | "mainnet" = "testnet"
): StellarRpc.Server {
  if (network === "mainnet") {
    return new StellarRpc.Server("https://horizon.stellar.org");
  }
  return new StellarRpc.Server("https://horizon-testnet.stellar.org");
}

export async function verifyTransaction(
  transactionHash: string,
  network: "testnet" | "mainnet" = "testnet"
): Promise<{ verified: boolean; transaction?: any; error?: string }> {
  try {
    const server = getStellarRpcServer(network);
    const transaction = await server.getTransaction(transactionHash);

    return {
      verified: true,
      transaction: transaction,
    };
  } catch (error: any) {
    return {
      verified: false,
      error: error.message || "Transaction not found or invalid",
    };
  }
}

export async function validateTransaction(
  transactionXdr: string,
  network: "testnet" | "mainnet" = "testnet"
): Promise<{ valid: boolean; error?: string }> {
  try {
    const passphrase = getNetworkPassphrase(network);
    const transaction = TransactionBuilder.fromXDR(transactionXdr, passphrase);
    const signatures = transaction.signatures;

    console.log("[validateTransaction] signatures", signatures);

    // Check if transaction has at least one signature
    if (signatures.length === 0) {
      return {
        valid: false,
        error: "Transaction has no signatures",
      };
    }

    return {
      valid: true,
    };
  } catch (error: any) {
    return {
      valid: false,
      error: error.message || "Failed to validate transaction",
    };
  }
}

export async function sendTransaction(
  transactionXdr: string,
  network: "testnet" | "mainnet" = "testnet"
): Promise<{ success: boolean; hash?: string; error?: string }> {
  try {
    const server = getStellarRpcServer(network);
    const passphrase = getNetworkPassphrase(network);
    const transaction = TransactionBuilder.fromXDR(transactionXdr, passphrase);

    const result = await server.sendTransaction(transaction);

    return {
      success: true,
      hash: result.hash,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to submit transaction",
    };
  }
}

/**
 * Submits a transaction to the Stellar network
 * Validates the transaction XDR before submitting
 * @param transactionXdr - Base64-encoded XDR transaction
 * @param network - Network to submit to (testnet or mainnet)
 * @returns Object with success status, transaction hash, and optional error
 */
export async function submitTransaction(
  transactionXdr: string,
  network: "testnet" | "mainnet" = "testnet"
): Promise<{
  success: boolean;
  hash?: string;
  transactionXdr?: string;
  error?: string;
  errorCode?: string;
}> {
  try {
    // Validate transaction XDR format
    const validation = await validateTransaction(transactionXdr, network);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || "Invalid transaction",
        errorCode: "invalid_transaction",
      };
    }

    // Submit transaction to network
    const result = await sendTransaction(transactionXdr, network);

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to submit transaction",
        errorCode: "submission_failed",
      };
    }

    return {
      success: true,
      hash: result.hash,
      transactionXdr: transactionXdr,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Unexpected error during transaction submission",
      errorCode: "unexpected_error",
    };
  }
}

export function getNetworkPassphrase(network: "testnet" | "mainnet"): string {
  return network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;
}
