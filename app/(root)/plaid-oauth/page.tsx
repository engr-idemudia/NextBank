"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  PlaidLinkOnSuccess,
  PlaidLinkOptions,
  usePlaidLink,
} from "react-plaid-link";
import { useRouter } from "next/navigation";
import { exchangePublicToken } from "@/lib/actions/user.actions";

const PlaidOAuthPage = () => {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Recover the token and user stored before Link opened.
    // Both are read synchronously from sessionStorage, so there is no
    // network race: by the time Link is ready, user is already present.
    const storedToken = sessionStorage.getItem("plaid_link_token");
    const storedUser = sessionStorage.getItem("plaid_user");

    setToken(storedToken);
    setUser(storedUser ? JSON.parse(storedUser) : null);
    setHydrated(true);
  }, []);

  const onSuccess = useCallback<PlaidLinkOnSuccess>(
    async (public_token: string) => {
      if (!user) return;

      await exchangePublicToken({
        publicToken: public_token,
        user,
      });

      sessionStorage.removeItem("plaid_link_token");
      sessionStorage.removeItem("plaid_user");
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
    // Only open once everything is in place: storage hydrated, token and
    // user recovered, and Link fully initialised.
    if (hydrated && token && user && ready) {
      open();
    }
  }, [hydrated, token, user, ready, open]);

  return (
    <section className="flex-center size-full">
      <p className="text-16 font-medium text-gray-600">
        Completing your bank connection…
      </p>
    </section>
  );
};

export default PlaidOAuthPage;
