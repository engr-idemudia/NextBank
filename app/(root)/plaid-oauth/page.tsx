"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  PlaidLinkOnSuccess,
  PlaidLinkOptions,
  usePlaidLink,
} from "react-plaid-link";
import { useRouter } from "next/navigation";
import {
  exchangePublicToken,
  getLoggedInUser,
} from "@/lib/actions/user.actions";

const PlaidOAuthPage = () => {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const init = async () => {
      // Recover the link token stored before Link opened
      const storedToken = sessionStorage.getItem("plaid_link_token");
      const loggedInUser = await getLoggedInUser();

      setToken(storedToken);
      setUser(loggedInUser);
    };

    init();
  }, []);

  const onSuccess = useCallback<PlaidLinkOnSuccess>(
    async (public_token: string) => {
      if (!user) return;

      await exchangePublicToken({
        publicToken: public_token,
        user,
      });

      sessionStorage.removeItem("plaid_link_token");
      router.push("/");
    },
    [user, router],
  );

  const config: PlaidLinkOptions = {
    token,
    onSuccess,
    // The full redirect URL Plaid sent the user back to, including OAuth state
    receivedRedirectUri:
      typeof window !== "undefined" ? window.location.href : undefined,
  };

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    if (ready) open();
  }, [ready, open]);

  return (
    <section className="flex-center size-full">
      <p className="text-16 font-medium text-gray-600">
        Completing your bank connection…
      </p>
    </section>
  );
};

export default PlaidOAuthPage;
