/**
 * blockchain.js
 * Simple stub to "write" KYC hash to a blockchain-like ledger.
 * Replace with real ledger integration (Hyperledger Fabric / Ethereum / Corda) in production.
 */

const ledger = [];

function writeIdentityHash(touristRef, kycHash) {
  const entry = { id: `chain-${Date.now()}`, touristRef, kycHash, timestamp: new Date().toISOString() };
  ledger.push(entry);
  return entry;
}

function getLedger() {
  return ledger.slice().reverse();
}

module.exports = { writeIdentityHash, getLedger };
