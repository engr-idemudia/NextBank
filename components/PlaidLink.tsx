import React, { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  PlaidLinkOnSuccess,
  PlaidLinkOptions,
  usePlaidLink,
} from "react-plaid-link";
import { useRouter } from "next/navigation";
import {
  createLinkToken,
  exchangePublicToken,
} from "@/lib/actions/user.actions";
import Image from "next/image";

const PlaidLink = ({ user, variant }: PlaidLinkProps) => {
  const router = useRouter();

  const [token, setToken] = useState("");

  useEffect(() => {
    const getLinkToken = async () => {
      const data = await createLinkToken(user);

      setToken(data?.linkToken);
    };

    getLinkToken();
  }, [user]);

  const onSuccess = useCallback<PlaidLinkOnSuccess>(
    async (public_token: string) => {
      await exchangePublicToken({
        publicToken: public_token,
        user,
      });

      router.push("/");
    },
    [user],
  );

  const config: PlaidLinkOptions = {
    token,
    onSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  const handleOpen = () => {
    if (ready) open();
  };

  return (
    <>
      {variant === "addBank" ? (
        <Button
          onClick={handleOpen}
          disabled={!ready}
          variant="ghost"
          className="flex gap-2 p-0 hover:bg-transparent"
        >
          <Image src="/icons/plus.svg" width={20} height={20} alt="plus" />
          <h2 className="text-14 font-semibold text-gray-600">Add Bank</h2>
        </Button>
      ) : variant === "primary" ? (
        <Button
          onClick={handleOpen}
          disabled={!ready}
          className="plaidlink-primary"
        >
          Connect bank
        </Button>
      ) : variant === "ghost" ? (
        <Button
          onClick={handleOpen}
          disabled={!ready}
          variant="ghost"
          className="plaidlink-ghost"
        >
          <Image
            src="/icons/connect-bank.svg"
            alt="connect bank"
            width={24}
            height={24}
          />
          <p className="hiddenl text-[16px] font-semibold text-black-2 xl:block">
            Connect bank
          </p>
        </Button>
      ) : (
        <Button
          onClick={handleOpen}
          disabled={!ready}
          className="plaidlink-default"
        >
          <Image
            src="/icons/connect-bank.svg"
            alt="connect bank"
            width={24}
            height={24}
          />
          <p className="text-[16px] font-semibold text-black-2">Connect bank</p>
        </Button>
      )}
    </>
  );
};

export default PlaidLink;
