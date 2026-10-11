"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { removeBank } from "@/lib/actions/bank.actions";

import { Button } from "./ui/button";

type RemoveBankButtonProps = {
  appwriteItemId: string;
  bankName: string;
  isProtected?: boolean;
};

// "Remove bank" control shown under each card on the My Banks page.
// It opens a small drop-down panel under the button:
// - protected banks (demo banks and the protected Plaid banks) show a note
//   explaining they cannot be removed;
// - other banks show a confirmation with Cancel and Remove.
// The server action also blocks protected banks, so this is not the only check.
const RemoveBankButton = ({
  appwriteItemId,
  bankName,
  isProtected,
}: RemoveBankButtonProps) => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  // Removal is a two-step confirmation: "confirm" first, then "final"
  const [stage, setStage] = useState<"confirm" | "final">("confirm");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    if (isLoading) return;
    setOpen(false);
    setStage("confirm");
    setError("");
  };

  // Close when clicking outside the panel or pressing Escape
  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        close();
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isLoading]);

  const handleRemove = async () => {
    setIsLoading(true);
    setError("");

    const result = await removeBank({ appwriteItemId });

    setIsLoading(false);

    if (result.success) {
      setOpen(false);
      setStage("confirm");
      // Show a short "removed" notice on the My Banks page
      router.replace(`/my-banks?removed=${encodeURIComponent(bankName)}`);
      router.refresh();
    } else {
      setError(result.message);
    }
  };

  const panelId = `remove-bank-panel-${appwriteItemId}`;

  return (
    <div ref={containerRef} className="relative mt-2 w-fit">
      <Button
        type="button"
        variant="ghost"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? close() : setOpen(true))}
        className="flex w-fit gap-2 px-2 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
      >
        <Trash2 size={16} />
        Remove bank
      </Button>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-label={`Remove ${bankName}`}
          className="absolute left-0 top-full z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-purple-400/60 dark:bg-[#1e2350] dark:text-gray-100"
        >
          {isProtected ? (
            <>
              <p className="text-14 font-semibold">Demo bank</p>
              <p className="mt-2 text-12 text-gray-600 dark:text-gray-300">
                <span className="font-semibold">{bankName}</span> is a demo bank
                and cannot be removed. To try this feature, link a sandbox bank
                with <span className="font-semibold">Connect bank</span>, then
                remove that one.
              </p>
              <div className="mt-3 flex justify-end">
                <Button
                  type="button"
                  onClick={close}
                  className="h-8 bg-purple-600 px-3 text-12 text-white hover:bg-purple-700"
                >
                  OK
                </Button>
              </div>
            </>
          ) : stage === "confirm" ? (
            <>
              <p className="text-14 font-semibold">Remove {bankName}?</p>
              <p className="mt-2 text-12 text-gray-600 dark:text-gray-300">
                Its Plaid access and Dwolla funding source will be removed. Past
                transfers stay in your history.
              </p>
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  onClick={close}
                  className="h-8 border border-gray-300 bg-transparent px-3 text-12 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => setStage("final")}
                  className="h-8 bg-red-600 px-3 text-12 text-white hover:bg-red-700"
                >
                  Remove
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-14 font-semibold text-red-600 dark:text-red-400">
                Are you sure?
              </p>
              <p className="mt-2 text-12 text-gray-600 dark:text-gray-300">
                <span className="font-semibold">{bankName}</span> will be
                removed permanently. This cannot be undone. You would need to
                link it again with Connect bank.
              </p>
              {error && <p className="mt-2 text-12 text-red-500">{error}</p>}
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setStage("confirm");
                    setError("");
                  }}
                  disabled={isLoading}
                  className="h-8 border border-gray-300 bg-transparent px-3 text-12 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Go back
                </Button>
                <Button
                  type="button"
                  onClick={handleRemove}
                  disabled={isLoading}
                  className="h-8 bg-red-600 px-3 text-12 text-white hover:bg-red-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      &nbsp;Removing...
                    </>
                  ) : (
                    "Yes, remove permanently"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RemoveBankButton;
