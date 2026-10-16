export const SIMKAR_BASE_URL = "https://ptpmn.co.id/simkar/public";
export const SIMKAR_LOGIN_URL = `${SIMKAR_BASE_URL}/auth/login`;
export const SIMKAR_HOST = "ptpmn.co.id";

export function isSimkarUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    return (
      url.protocol === "https:" &&
      url.hostname === SIMKAR_HOST &&
      (url.pathname === "/simkar" || url.pathname.startsWith("/simkar/"))
    );
  } catch {
    return false;
  }
}

export function isPresensiUrl(rawUrl: string): boolean {
  try {
    return isSimkarUrl(rawUrl) && new URL(rawUrl).pathname.includes("/presensi");
  } catch {
    return false;
  }
}
