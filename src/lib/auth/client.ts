export type CurrentAuthUser = {
  provider: "kakao" | "google";
  nickname: string;
  profileImage?: string;
  email?: string;
};

export type CurrentAuthState = {
  loggedIn: boolean;
  user: CurrentAuthUser | null;
};

function currentInternalPath() {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function buildLoginUrl(nextPath = currentInternalPath()) {
  const safeNext = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";
  return `/login?next=${encodeURIComponent(safeNext)}`;
}

export async function getCurrentAuthUser(): Promise<CurrentAuthState> {
  try {
    const response = await fetch("/api/auth/me", {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (!response.ok) return { loggedIn: false, user: null };

    const data = (await response.json()) as Partial<CurrentAuthState>;
    return {
      loggedIn: Boolean(data.loggedIn && data.user),
      user: data.loggedIn && data.user ? data.user : null,
    };
  } catch {
    return { loggedIn: false, user: null };
  }
}

export async function isLoggedIn() {
  const auth = await getCurrentAuthUser();
  return auth.loggedIn;
}
