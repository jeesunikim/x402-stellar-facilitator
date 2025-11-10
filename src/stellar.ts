/**
 * Stellar network utilities and helpers
 */

import {
  Keypair,
  rpc as StellarRpc,
  TransactionBuilder,
  Networks,
  xdr,
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

const verifySignature = (
  signature: { hint: string; signature: string },
  publicKey: string | undefined,
  txHash: string | undefined
) => {
  if (!publicKey || !txHash) {
    return false;
  }

  try {
    const keypair = Keypair.fromPublicKey(publicKey);
    // Signature from JSON RPC is hex-encoded
    const signatureBuffer = Buffer.from(signature.signature, "hex");
    // txHash from RPC response is hex string
    const txHashBuffer = Buffer.from(txHash, "hex");

    return keypair.verify(txHashBuffer, signatureBuffer);
  } catch {
    return false;
  }
};

export async function validateTransaction(
  transactionXdr: string,
  network: "testnet" | "mainnet" = "testnet"
): Promise<{ valid: boolean; error?: string }> {
  try {
    // const server = getStellarRpcServer(network);
    const passphrase = getNetworkPassphrase(network);
    const transaction = TransactionBuilder.fromXDR(transactionXdr, passphrase);
    const signatures = transaction.signatures;

    console.log("[validateTransaction] signatures", signatures);
    // const result = await server.validateTransaction(transaction);
    // const valid = transaction.signatures.every(
    //   ({ signature }: xdr.DecoratedSignature) => {
    //     verifySignature(
    //       signature,
    //       transaction.signatures[0].publicKey,
    //       transaction.hash
    //     );
    //   }
    // );
    return {
      valid: true,
      error: result.error,
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
    const passphrase =
      network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;
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

export function getNetworkPassphrase(network: "testnet" | "mainnet"): string {
  return network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;
}
