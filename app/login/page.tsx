import { safeInternalPath } from "@/src/lib/auth/session";

import { LoginClient } from "./LoginClient";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = safeInternalPath(params.next, "/");

  return <LoginClient nextPath={nextPath} error={params.error} />;
}
