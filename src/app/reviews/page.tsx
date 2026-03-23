"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { WriteReviewDialog } from "@/components/reviews/WriteReviewDialog";
import type { ReviewRecord } from "@/lib/app-config";

export default function ReviewsPage() {
  const reviewsData = useQuery(api.reviews.listApproved);
  const reviews: ReviewRecord[] = useMemo(
    () =>
      (reviewsData ?? []).map((review: any) => ({
        id: String(review._id),
        name: review.name,
        rating: review.rating,
        reviewText: review.reviewText,
        createdAt: new Date(review._creationTime).toISOString(),
        status: review.status,
        pinned: review.pinned,
      })),
    [reviewsData]
  );

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return 0;
    }

    const total = reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* Decorative Background Elements */}
      <div className="pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[50%] w-[50%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <main className="relative z-10 px-4 pb-24 pt-32 md:pt-40">
        <div className="mx-auto max-w-6xl space-y-12">
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden rounded-[2.5rem] border border-border bg-card/30 p-8 backdrop-blur-3xl md:p-12"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-transparent" />
            
            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <p className="section-label">Guest Feedback</p>
                <h1 className="mt-6 bg-gradient-to-r from-[#F5A623] to-[#C47B05] bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
                  Real Stories, <br className="hidden md:block" /> Real Flavour
                </h1>
                <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-muted-foreground md:text-lg">
                  Explore honest experiences from our community of food lovers in Hubballi. From our signature momos to fiery rice bowls.
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card/50 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 group-hover:border-primary/20">
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Average Rating</p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <p className="text-6xl font-black tracking-tighter text-primary">
                      {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
                    </p>
                    <p className="text-xl font-bold text-muted-foreground/40">/ 5</p>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-muted-foreground">Based on {reviews.length} genuine reviews</p>
                </div>
                <WriteReviewDialog triggerClassName="w-full rounded-full bg-primary px-8 py-4 text-sm font-bold text-black shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:brightness-105 active:scale-95" />
              </div>
            </div>
          </motion.section>

          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.length > 0 ? (
              reviews.map((review) => <ReviewCard key={review.id} review={review} />)
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full rounded-2xl border border-border bg-card/20 p-12 text-center backdrop-blur-xl"
              >
                <p className="text-lg font-medium text-muted-foreground">No reviews have been published yet.</p>
                <div className="mt-6">
                  <WriteReviewDialog triggerLabel="Be the first to review" />
                </div>
              </motion.div>
            )}
          </section>

          <div>
            <Link
              href="/"
              className="inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/85 transition-all duration-200 hover:border-primary/30 hover:text-primary"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
