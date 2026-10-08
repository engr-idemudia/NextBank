// Static demo data for the public NextBank showcase.
//
// Demo banks are ordinary documents in the Appwrite banks collection (created
// by scripts/seed-demo.mjs). They are recognised by an access token that starts
// with DEMO_ACCESS_TOKEN_PREFIX and a funding source URL that starts with
// DEMO_FUNDING_SOURCE_PREFIX. For these banks the app reads the account details
// and transaction history below instead of calling Plaid, so the dashboard is
// always populated instantly, even when Plaid is unreachable or blocked.
//
// Real banks linked through Plaid Link are unaffected and still use Plaid and
// Dwolla exactly as before.

export const DEMO_ACCESS_TOKEN_PREFIX = "demo-";
export const DEMO_FUNDING_SOURCE_PREFIX = "demo://";

type DemoAccountDetails = Omit<Account, "appwriteItemId" | "shareableId">;

type DemoTransactionTemplate = {
  name: string;
  // Negative = money out (shown in red), positive = money in (shown in green).
  amount: number;
  category: string;
  paymentChannel: "online" | "in store" | "other";
  daysAgo: number;
};

const DEMO_ACCOUNTS: Record<string, DemoAccountDetails> = {
  "demo-acc-checking": {
    id: "demo-acc-checking",
    name: "NextBank Everyday Checking",
    officialName: "NextBank Everyday Checking Account",
    mask: "4821",
    type: "depository",
    subtype: "checking",
    currentBalance: 8432.17,
    availableBalance: 8232.17,
    institutionId: "ins_nextbank_demo",
  },
  "demo-acc-savings": {
    id: "demo-acc-savings",
    name: "NextBank High-Yield Savings",
    officialName: "NextBank High-Yield Savings Account",
    mask: "7390",
    type: "depository",
    subtype: "savings",
    currentBalance: 24650.0,
    availableBalance: 24650.0,
    institutionId: "ins_nextbank_demo",
  },
};

const DEMO_TRANSACTIONS: Record<string, DemoTransactionTemplate[]> = {
  "demo-acc-checking": [
    { name: "Uber", amount: -18.4, category: "Travel", paymentChannel: "online", daysAgo: 0 },
    { name: "Starbucks", amount: -6.35, category: "Food and Drink", paymentChannel: "in store", daysAgo: 1 },
    { name: "Acme Corp Payroll", amount: 3250.0, category: "Payment", paymentChannel: "other", daysAgo: 2 },
    { name: "Whole Foods Market", amount: -84.12, category: "Food and Drink", paymentChannel: "in store", daysAgo: 3 },
    { name: "Netflix", amount: -15.49, category: "Payment", paymentChannel: "online", daysAgo: 4 },
    { name: "United Airlines", amount: -412.8, category: "Travel", paymentChannel: "online", daysAgo: 6 },
    { name: "Chipotle", amount: -12.75, category: "Food and Drink", paymentChannel: "in store", daysAgo: 7 },
    { name: "Electric Company", amount: -96.3, category: "Payment", paymentChannel: "online", daysAgo: 9 },
    { name: "Monthly Account Fee", amount: -5.0, category: "Bank Fees", paymentChannel: "other", daysAgo: 10 },
    { name: "Lyft", amount: -23.1, category: "Travel", paymentChannel: "online", daysAgo: 12 },
    { name: "Venmo Transfer from Alex", amount: 60.0, category: "Transfer", paymentChannel: "online", daysAgo: 13 },
    { name: "Trader Joes", amount: -57.64, category: "Food and Drink", paymentChannel: "in store", daysAgo: 15 },
    { name: "Spotify", amount: -10.99, category: "Payment", paymentChannel: "online", daysAgo: 16 },
    { name: "Acme Corp Payroll", amount: 3250.0, category: "Payment", paymentChannel: "other", daysAgo: 16 },
    { name: "Shell Gas Station", amount: -48.2, category: "Travel", paymentChannel: "in store", daysAgo: 18 },
    { name: "Dominos Pizza", amount: -22.5, category: "Food and Drink", paymentChannel: "online", daysAgo: 21 },
  ],
  "demo-acc-savings": [
    { name: "Interest Payment", amount: 82.15, category: "Payment", paymentChannel: "other", daysAgo: 1 },
    { name: "Transfer from Checking", amount: 500.0, category: "Transfer", paymentChannel: "online", daysAgo: 8 },
    { name: "Transfer from Checking", amount: 500.0, category: "Transfer", paymentChannel: "online", daysAgo: 22 },
    { name: "Interest Payment", amount: 79.6, category: "Payment", paymentChannel: "other", daysAgo: 31 },
    { name: "Transfer to Checking", amount: -250.0, category: "Transfer", paymentChannel: "online", daysAgo: 35 },
  ],
};

// A bank document created by the seed script.
export const isDemoBank = (bank?: Partial<Bank> | null) =>
  typeof bank?.accessToken === "string" &&
  bank.accessToken.startsWith(DEMO_ACCESS_TOKEN_PREFIX);

// Used on the client, where only the funding source URL is needed.
export const isDemoFundingSource = (url?: string | null) =>
  typeof url === "string" && url.startsWith(DEMO_FUNDING_SOURCE_PREFIX);

export const getDemoAccount = (bank: Bank): Account | null => {
  const details = DEMO_ACCOUNTS[bank.accountId];
  if (!details) return null;

  return {
    ...details,
    appwriteItemId: bank.$id,
    shareableId: bank.shareableId,
  };
};

// Dates are relative to today, so the demo history always looks current.
export const getDemoTransactions = (bank: Bank) => {
  const templates = DEMO_TRANSACTIONS[bank.accountId] ?? [];

  return templates.map((t, index) => {
    const date = new Date();
    date.setHours(10 + (index % 8), (index * 17) % 60, 0, 0);
    date.setDate(date.getDate() - t.daysAgo);

    return {
      id: `${bank.$id}-demo-${index}`,
      name: t.name,
      paymentChannel: t.paymentChannel,
      type: t.paymentChannel,
      accountId: bank.accountId,
      amount: t.amount,
      pending: t.daysAgo < 2,
      category: t.category,
      date: date.toISOString(),
      image: "",
    };
  });
};
