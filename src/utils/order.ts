/**
 * Generates a Foodieez order token in the #PREFIX-1234 format.
 */
export function generateOrderToken(prefix: string): string {
  const normalizedPrefix = prefix.trim().toUpperCase() || "FJ";
  const random = Math.floor(1000 + Math.random() * 9000);
  return `#${normalizedPrefix}-${random}`;
}
