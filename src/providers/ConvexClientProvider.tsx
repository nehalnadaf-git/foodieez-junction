"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const address = process.env.NEXT_PUBLIC_CONVEX_URL || "https://dummy-url-for-build.convex.cloud";
const convex = new ConvexReactClient(address);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
