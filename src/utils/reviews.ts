import { type ReviewRecord } from "@/lib/app-config";

type SortableReview = Pick<ReviewRecord, "pinned" | "createdAt">;

/**
 * Sorts reviews with pinned approved reviews first, then by recency.
 */
export function sortReviews<T extends SortableReview>(reviews: T[]): T[] {
  return [...reviews].sort((left, right) => {
    if (left.pinned !== right.pinned) {
      return left.pinned ? -1 : 1;
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}
