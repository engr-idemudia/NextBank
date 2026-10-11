import BankCard from "@/components/BankCard";
import HeaderBox from "@/components/HeaderBox";
import RemoveBankButton from "@/components/RemoveBankButton";
import RemovedBankNotice from "@/components/RemovedBankNotice";
import { getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import React from "react";

const MyBanks = async ({ searchParams }: SearchParamProps) => {
  const { removed } = await searchParams;
  const loggedIn = await getLoggedInUser();

  if (!loggedIn) redirect("/sign-in");

  const accounts = await getAccounts({
    userId: loggedIn.$id,
  });

  return (
    <section className="flex">
      <div className="my-banks">
        <HeaderBox
          title="My Bank Accounts"
          subtext="Effortlessly manage your banking activites."
        />

        {typeof removed === "string" && removed && (
          <RemovedBankNotice bankName={removed} />
        )}

        <div className="space-y-4">
          <h2 className="header-2">Your cards</h2>
          <div className="flex flex-wrap gap-6">
            {accounts &&
              accounts.data.map((a: Account) => (
                <div key={a.appwriteItemId} className="flex flex-col">
                  <BankCard account={a} userName={loggedIn?.firstName} />
                  <RemoveBankButton
                    appwriteItemId={a.appwriteItemId}
                    bankName={a.name}
                    isProtected={a.isProtected}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyBanks;
