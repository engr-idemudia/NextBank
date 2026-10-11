"use server";

import { revalidatePath } from "next/cache";
import { Query } from "node-appwrite";
import { CountryCode } from "plaid";

import { createAdminClient } from "../appwrite";
import { plaidClient } from "../plaid";
import { parseStringify } from "../utils";
import {
  getDemoAccount,
  getDemoTransactions,
  isDemoBank,
  isProtectedBank,
} from "../demo-data";

import { getTransactionsByBankId } from "./transaction.actions";
import { removeFundingSource } from "./dwolla.actions";
import { getBanks, getBank, getLoggedInUser } from "./user.actions";

// Get one bank's account details from Plaid
const getPlaidAccount = async (bank: Bank): Promise<Account> => {
  // get account info from plaid
  const accountsResponse = await plaidClient.accountsGet({
    access_token: bank.accessToken,
  });
  const accountData = accountsResponse.data.accounts[0];

  // get institution info from plaid
  const institution = await getInstitution({
    institutionId: accountsResponse.data.item.institution_id!,
  });

  return {
    id: accountData.account_id,
    availableBalance: accountData.balances.available!,
    currentBalance: accountData.balances.current!,
    institutionId: institution?.institution_id,
    name: accountData.name,
    officialName: accountData.official_name!,
    mask: accountData.mask!,
    type: accountData.type as string,
    subtype: accountData.subtype! as string,
    appwriteItemId: bank.$id,
    shareableId: bank.shareableId,
    isProtected: isProtectedBank(bank),
  };
};

// Get multiple bank accounts
export const getAccounts = async ({ userId }: getAccountsProps) => {
  try {
    // get banks from db
    const banks: Bank[] = (await getBanks({ userId })) ?? [];

    // Demo banks first, so the default view loads instantly without Plaid
    const orderedBanks = [
      ...banks.filter((bank) => isDemoBank(bank)),
      ...banks.filter((bank) => !isDemoBank(bank)),
    ];

    // Load each bank independently: one failing Plaid item (for example an
    // expired sandbox token) must not blank the whole dashboard
    const results = await Promise.allSettled(
      orderedBanks.map(async (bank) =>
        isDemoBank(bank) ? getDemoAccount(bank) : getPlaidAccount(bank),
      ),
    );

    const accounts: Account[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value) {
        accounts.push(result.value);
      } else if (result.status === "rejected") {
        console.error(
          `Skipping bank ${orderedBanks[index].$id}: could not load it from Plaid.`,
          result.reason,
        );
      }
    });

    const totalBanks = accounts.length;
    const totalCurrentBalance = accounts.reduce((total, account) => {
      return total + (account.currentBalance ?? 0);
    }, 0);

    return parseStringify({ data: accounts, totalBanks, totalCurrentBalance });
  } catch (error) {
    console.error("An error occurred while getting the accounts:", error);
  }
};

// Get one bank account
export const getAccount = async ({ appwriteItemId }: getAccountProps) => {
  try {
    // get bank from db
    const bank = await getBank({ documentId: appwriteItemId });

    // get transfer transactions from appwrite
    const transferTransactionsData = await getTransactionsByBankId({
      bankId: bank.$id,
    });

    const transferTransactions = (transferTransactionsData?.documents ?? []).map(
      (transferData: Transaction) => ({
        id: transferData.$id,
        name: transferData.name!,
        amount: transferData.amount!,
        date: transferData.$createdAt,
        paymentChannel: transferData.channel,
        category: transferData.category,
        type: transferData.senderBankId === bank.$id ? "debit" : "credit",
      }),
    );

    let account: Account | null;
    let transactions: any[];

    if (isDemoBank(bank)) {
      // static demo data, no Plaid call
      account = getDemoAccount(bank);
      transactions = getDemoTransactions(bank);
    } else {
      account = await getPlaidAccount(bank);
      transactions =
        (await getTransactions({ accessToken: bank.accessToken })) ?? [];
    }

    if (!account) throw new Error(`No account details for bank ${bank.$id}`);

    // sort transactions by date such that the most recent transaction is first
    const allTransactions = [...transactions, ...transferTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    return parseStringify({
      data: account,
      transactions: allTransactions,
    });
  } catch (error) {
    console.error("An error occurred while getting the account:", error);
  }
};

// Get bank info
export const getInstitution = async ({
  institutionId,
}: getInstitutionProps) => {
  try {
    const institutionResponse = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: ["US"] as CountryCode[],
    });

    const intitution = institutionResponse.data.institution;

    return parseStringify(intitution);
  } catch (error) {
    console.error("An error occurred while getting the accounts:", error);
  }
};

// Get transactions
export const getTransactions = async ({
  accessToken,
}: getTransactionsProps) => {
  let hasMore = true;
  let transactions: any = [];

  try {
    // Iterate through each page of new transaction updates for item
    while (hasMore) {
      const response = await plaidClient.transactionsSync({
        access_token: accessToken,
      });

      const data = response.data;

      transactions = response.data.added.map((transaction) => ({
        id: transaction.transaction_id,
        name: transaction.name,
        paymentChannel: transaction.payment_channel,
        type: transaction.payment_channel,
        accountId: transaction.account_id,
        // Plaid reports money leaving the account as a positive amount.
        // Flip the sign so spending is negative (red) and income positive (green),
        // matching the demo data and how the transactions table colours amounts.
        amount: -transaction.amount,
        pending: transaction.pending,
        category: transaction.category ? transaction.category[0] : "",
        date: transaction.date,
        image: transaction.logo_url,
      }));

      hasMore = data.has_more;
    }

    return parseStringify(transactions);
  } catch (error) {
    console.error("An error occurred while getting the accounts:", error);
  }
};

// Remove a linked bank: revoke Plaid access, remove the Dwolla funding source
// and delete the Appwrite record. Demo and protected banks cannot be removed.
export const removeBank = async ({
  appwriteItemId,
}: {
  appwriteItemId: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await getLoggedInUser();
    if (!user) return { success: false, message: "Please sign in again." };

    const bank = await getBank({ documentId: appwriteItemId });
    if (!bank) return { success: false, message: "Bank not found." };

    // userId may come back as a plain ID or as the related user document
    const ownerId =
      typeof bank.userId === "string" ? bank.userId : bank.userId?.$id;
    if (ownerId !== user.$id) {
      return { success: false, message: "You can only remove your own banks." };
    }

    if (isProtectedBank(bank)) {
      return {
        success: false,
        message: "This is a demo bank and cannot be removed.",
      };
    }

    const {
      APPWRITE_DATABASE_ID: DATABASE_ID,
      APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
    } = process.env;
    const { database } = await createAdminClient();

    // Plaid sandbox can link the same account more than once, and Dwolla then
    // reuses the existing funding source. Only revoke what no other bank record
    // still uses, so protected banks keep working.
    const [sameToken, sameFunding] = await Promise.all([
      database.listDocuments(DATABASE_ID!, BANK_COLLECTION_ID!, [
        Query.equal("accessToken", [bank.accessToken]),
      ]),
      database.listDocuments(DATABASE_ID!, BANK_COLLECTION_ID!, [
        Query.equal("fundingSourceUrl", [bank.fundingSourceUrl]),
      ]),
    ]);

    if (sameToken.total <= 1) {
      try {
        await plaidClient.itemRemove({ access_token: bank.accessToken });
      } catch (error) {
        // An expired or already-removed item should not block removal
        console.warn("Plaid item could not be removed:", error);
      }
    }

    if (sameFunding.total <= 1 && bank.fundingSourceUrl) {
      await removeFundingSource(bank.fundingSourceUrl);
    }

    await database.deleteDocument(DATABASE_ID!, BANK_COLLECTION_ID!, bank.$id);

    revalidatePath("/");
    revalidatePath("/my-banks");

    return { success: true, message: "Bank removed." };
  } catch (error) {
    console.error("An error occurred while removing the bank:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
};
