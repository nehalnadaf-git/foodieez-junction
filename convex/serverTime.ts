import { action } from "./_generated/server";

/**
 * Returns the current Convex server timestamp in milliseconds.
 * Use this whenever you need an accurate server-side time without
 * persisting anything to the database.
 *
 * Date.now() inside a Convex action runs on the SERVER, never on the
 * customer's device — so it is always 100% accurate and IST-consistent.
 */
export const now = action({
  args: {},
  handler: async (): Promise<number> => {
    return Date.now();
  },
});
