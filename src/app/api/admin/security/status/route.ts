import { NextResponse } from "next/server";

export async function GET() {
  const hasUsername = Boolean(process.env.ADMIN_USERNAME);
  const hasPassword = Boolean(process.env.ADMIN_PASSWORD);
  const secretLength = process.env.ADMIN_SESSION_SECRET?.length ?? 0;

  return NextResponse.json({
    hasUsername,
    hasPassword,
    hasSessionSecret: secretLength > 0,
    hasStrongSessionSecret: secretLength >= 16,
    secretLength,
  });
}
