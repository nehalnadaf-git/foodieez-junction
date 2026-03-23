"use client";

import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAppSettings } from "@/context/AppSettingsContext";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { WriteReviewDialog } from "@/components/reviews/WriteReviewDialog";
import type { ReviewRecord } from "@/lib/app-config";
import { sortReviews } from "@/utils/reviews";

export function ReviewsSection() {
  const { settings } = useAppSettings();
  const reviewsData = useQuery(api.reviews.listApproved);
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", dragFree: true });
  const approvedReviews = useMemo<ReviewRecord[]>(() => {
    const reviews = reviewsData ?? [];
    const mapped = reviews.map((review: any) => ({
      id: String(review._id),
      name: review.name,
      rating: review.rating,
      reviewText: review.reviewText,
      createdAt: new Date(review._creationTime).toISOString(),
      status: review.status,
      pinned: review.pinned,
    }));
    return sortReviews(mapped).slice(0, 5);
  }, [reviewsData]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    emblaApi.reInit();
  }, [emblaApi, approvedReviews.length]);

  if (!settings.reviews.showReviewsOnHome) {
    return null;
  }

  return (
    <section className="relative overflow-hidden px-4 py-16 md:py-24">
      {/* Decorative Background Elements */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div 
          className="absolute -top-[20%] -left-[10%] h-[60%] w-[40%] rounded-full bg-primary/10 blur-[120px]" 
          aria-hidden="true"
        />
        <div 
          className="absolute -bottom-[20%] -right-[10%] h-[60%] w-[40%] rounded-full bg-primary/5 blur-[120px]" 
          aria-hidden="true"
        />
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" 
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-label">Guest Reviews</p>
            <h2 className="mt-4 bg-gradient-to-r from-[#F5A623] to-[#C47B05] bg-clip-text text-4xl font-bold text-transparent">
              What Hubballi Is Saying
            </h2>
          </div>
          <WriteReviewDialog />
        </div>

        <div className="relative">
          <div 
            className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]" 
            ref={emblaRef}
          >
            <div className="flex gap-4 px-4 py-8 md:gap-6 md:px-0">
              {approvedReviews.length > 0 ? (
                approvedReviews.map((review) => (
                  <div key={review.id} className="min-w-0 flex-[0_0_85%] md:flex-[0_0_45%] xl:flex-[0_0_30%]">
                    <ReviewCard review={review} />
                  </div>
                ))
              ) : (
                <div className="min-w-0 flex-[0_0_85%] md:flex-[0_0_45%] xl:flex-[0_0_30%]">
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex h-full min-h-64 items-center rounded-2xl border p-6 text-sm leading-7 backdrop-blur-xl transition-colors duration-300"
                    style={{
                      background: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      color: "hsl(var(--muted-foreground))",
                    }}
                  >
                    Fresh reviews will appear here once approved in the admin panel.
                  </motion.div>
                </div>
              )}
              <div className="min-w-0 flex-[0_0_85%] md:flex-[0_0_45%] xl:flex-[0_0_30%]">
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex h-full min-h-64 items-center justify-center rounded-2xl border p-6 text-center backdrop-blur-xl transition-colors duration-300"
                  style={{
                    background: "hsl(var(--primary) / 0.08)",
                    borderColor: "hsl(var(--primary) / 0.25)",
                  }}
                >
                  <Link
                    href="/reviews"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-black transition-all duration-200 hover:shadow-[0_0_24px_rgba(245,166,35,0.45)]"
                  >
                    See All Reviews
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
