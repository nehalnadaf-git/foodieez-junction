import { STORAGE_KEYS, type ReviewRecord } from "@/lib/app-config";
import { loadFromStorage, saveToStorage } from "@/utils/storage";

export const DEFAULT_REVIEWS: ReviewRecord[] = [
  {
    id: "review-seed-1",
    name: "Ayesha",
    rating: 5,
    reviewText: "Crispy fries, excellent momos, and a really warm dine-in vibe. Easily one of our repeat spots in Hubballi.",
    createdAt: "2026-03-10T12:15:00.000Z",
    status: "approved",
    pinned: true,
  },
  {
    id: "review-seed-2",
    name: "Zaid",
    rating: 5,
    reviewText: "Chicken momos and fried rice were both fresh and spicy in the right way. The WhatsApp ordering flow is super quick too.",
    createdAt: "2026-03-09T19:45:00.000Z",
    status: "approved",
    pinned: false,
  },
  {
    id: "review-seed-3",
    name: "Fatima",
    rating: 4,
    reviewText: "Good portions, fast service, and the peri peri fries stayed crisp even for takeaway. Would definitely order again.",
    createdAt: "2026-03-07T16:20:00.000Z",
    status: "approved",
    pinned: false,
  },
];

/**
 * Loads persisted reviews with seeded approved reviews as the initial fallback.
 */
export function loadReviews(): ReviewRecord[] {
  return loadFromStorage<ReviewRecord[]>(STORAGE_KEYS.reviews, DEFAULT_REVIEWS);
}

/**
 * Persists the latest review list.
 */
export function saveReviews(reviews: ReviewRecord[]): void {
  saveToStorage(STORAGE_KEYS.reviews, reviews);
}

/**
 * Sorts reviews with pinned approved reviews first, then by recency.
 */
export function sortReviews(reviews: ReviewRecord[]): ReviewRecord[] {
  return [...reviews].sort((left, right) => {
    if (left.pinned !== right.pinned) {
      return left.pinned ? -1 : 1;
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}
