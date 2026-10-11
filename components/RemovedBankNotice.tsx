"use client";

import { CheckCircle2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Green notice shown on My Banks after a bank has been removed.
// It clears itself from the URL after a few seconds.
const RemovedBankNotice = ({ bankName }: { bankName: string }) => {
  const router = useRouter();

  const dismiss = () => router.replace("/my-banks", { scroll: false });

  useEffect(() => {
    const timer = setTimeout(dismiss, 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankName]);

  return (
    <div
      role="status"
      className="flex w-full max-w-xl items-center gap-3 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-14 text-green-800 dark:border-green-700 dark:bg-green-950/60 dark:text-green-200"
    >
      <CheckCircle2 size={18} className="shrink-0" />
      <p className="flex-1">
        <span className="font-semibold">{bankName}</span> was removed.
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="rounded p-1 hover:bg-green-100 dark:hover:bg-green-900"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default RemovedBankNotice;
