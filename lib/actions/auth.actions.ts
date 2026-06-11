"use server";

import { createAdminClient } from "../appwrite";
import { parseStringify } from "../utils";

export const sendPasswordRecovery = async ({ email }: { email: string }) => {
  try {
    const { account } = await createAdminClient();

    const recoveryUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`;

    await account.createRecovery(email, recoveryUrl);

    return parseStringify({ success: true });
  } catch (error) {
    console.error("Password recovery error:", error);
    return parseStringify({ success: false });
  }
};

export const confirmPasswordRecovery = async ({
  userId,
  secret,
  password,
}: {
  userId: string;
  secret: string;
  password: string;
}) => {
  try {
    const { account } = await createAdminClient();

    await account.updateRecovery(userId, secret, password);

    return parseStringify({ success: true });
  } catch (error) {
    console.error("Password reset error:", error);
    return parseStringify({ success: false });
  }
};
