// Seeds the static demo banks for the public demo account.
//
// Usage (from the project root):
//   node scripts/seed-demo.mjs
//
// Reads the Appwrite settings from .env.local (or .env). Safe to run again at
// any time: it replaces the demo banks and their simulated transfers, and never
// touches real banks linked through Plaid.

import { readFileSync, existsSync } from "node:fs";
import { Client, Databases, ID, Query } from "node-appwrite";

const DEMO_EMAIL = "demo@nextbank.dev";
const DEMO_ACCESS_TOKEN_PREFIX = "demo-";

// Must match the account IDs in lib/demo-data.ts
const DEMO_BANKS = [
  { accountId: "demo-acc-checking", slug: "checking" },
  { accountId: "demo-acc-savings", slug: "savings" },
];

// ---- load environment -------------------------------------------------------
const envFile = [".env.local", ".env"].find((file) => existsSync(file));
if (envFile) {
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

const required = [
  "NEXT_PUBLIC_APPWRITE_ENDPOINT",
  "NEXT_PUBLIC_APPWRITE_PROJECT",
  "NEXT_APPWRITE_KEY",
  "APPWRITE_DATABASE_ID",
  "APPWRITE_USER_COLLECTION_ID",
  "APPWRITE_BANK_COLLECTION_ID",
  "APPWRITE_TRANSACTION_COLLECTION_ID",
];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const {
  NEXT_PUBLIC_APPWRITE_ENDPOINT: ENDPOINT,
  NEXT_PUBLIC_APPWRITE_PROJECT: PROJECT,
  NEXT_APPWRITE_KEY: API_KEY,
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
  APPWRITE_TRANSACTION_COLLECTION_ID: TRANSACTION_COLLECTION_ID,
} = process.env;

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT)
  .setKey(API_KEY);
const db = new Databases(client);

// ---- seed -------------------------------------------------------------------
async function main() {
  console.log(`Using ${envFile ?? "shell environment"}, endpoint ${ENDPOINT}`);

  // 1. Find the demo user
  const users = await db.listDocuments(DATABASE_ID, USER_COLLECTION_ID, [
    Query.equal("email", [DEMO_EMAIL]),
  ]);
  if (users.total === 0) {
    throw new Error(`No user document found for ${DEMO_EMAIL}`);
  }
  const user = users.documents[0];
  console.log(`Demo user: ${user.firstName} ${user.lastName} (${user.$id})`);

  // 2. Remove previous demo banks and their simulated transfers
  const banks = await db.listDocuments(DATABASE_ID, BANK_COLLECTION_ID, [
    Query.equal("userId", [user.$id]),
    Query.limit(100),
  ]);
  const oldDemoBanks = banks.documents.filter((bank) =>
    String(bank.accessToken).startsWith(DEMO_ACCESS_TOKEN_PREFIX),
  );
  const realBanks = banks.total - oldDemoBanks.length;

  for (const bank of oldDemoBanks) {
    for (const field of ["senderBankId", "receiverBankId"]) {
      const transfers = await db.listDocuments(
        DATABASE_ID,
        TRANSACTION_COLLECTION_ID,
        [Query.equal(field, [bank.$id]), Query.limit(100)],
      );
      for (const transfer of transfers.documents) {
        await db.deleteDocument(DATABASE_ID, TRANSACTION_COLLECTION_ID, transfer.$id);
      }
    }
    await db.deleteDocument(DATABASE_ID, BANK_COLLECTION_ID, bank.$id);
  }
  console.log(`Removed ${oldDemoBanks.length} old demo bank(s).`);
  console.log(`Left ${realBanks} real Plaid bank(s) untouched.`);

  // 3. Create the demo banks
  const created = {};
  for (const { accountId, slug } of DEMO_BANKS) {
    const bank = await db.createDocument(DATABASE_ID, BANK_COLLECTION_ID, ID.unique(), {
      userId: user.$id,
      bankId: "demo-item-nextbank",
      accountId,
      accessToken: `${DEMO_ACCESS_TOKEN_PREFIX}access-${slug}`,
      fundingSourceUrl: `demo://funding-sources/${slug}`,
      shareableId: Buffer.from(accountId).toString("base64"),
    });
    created[slug] = bank;
    console.log(`Created demo bank: ${accountId} (${bank.$id})`);
  }

  // 4. One simulated transfer, so the Appwrite transfer history is shown too
  await db.createDocument(DATABASE_ID, TRANSACTION_COLLECTION_ID, ID.unique(), {
    name: "Monthly savings top-up",
    amount: "250.00",
    channel: "online",
    category: "Transfer",
    senderId: user.$id,
    senderBankId: created.checking.$id,
    receiverId: user.$id,
    receiverBankId: created.savings.$id,
    email: DEMO_EMAIL,
  });
  console.log("Created 1 simulated transfer (checking to savings).");

  console.log("Done.");
}

main().catch((error) => {
  console.error("Seeding failed:", error?.message ?? error);
  process.exit(1);
});
