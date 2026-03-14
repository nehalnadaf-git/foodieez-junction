export const ADMIN_SESSION_COOKIE = "fj_admin_session";

export function getAdminSessionToken(secret: string): string {
  return Buffer.from(`${secret}:foodieez-admin`).toString("base64");
}
