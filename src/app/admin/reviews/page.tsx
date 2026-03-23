"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Pin, Trash2, X } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import { useAppSettings } from "@/context/AppSettingsContext";
import type { ReviewRecord } from "@/lib/app-config";

export default function AdminReviewsPage() {
  const { settings, patchSettings } = useAppSettings();
  const reviews = useQuery(api.reviews.listAll);
  
  const approveReview = useMutation(api.reviews.updateStatus);
  const rejectReview = useMutation(api.reviews.remove);
  const togglePinned = useMutation(api.reviews.togglePinned);
  const updateStatus = useMutation(api.reviews.updateStatus);

  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");

  const pendingReviews = useMemo(
    () => (reviews ?? []).filter((review: any) => review.status === "pending"),
    [reviews]
  );
  const approvedReviews = useMemo(
    () => (reviews ?? []).filter((review: any) => review.status === "approved"),
    [reviews]
  );

  const visibleReviews = activeTab === "pending" ? pendingReviews : approvedReviews;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      <h2 className="bg-gradient-to-r from-[#F5A623] to-[#C47B05] bg-clip-text text-3xl font-bold text-transparent">
        Review Management
      </h2>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <p className="text-xs uppercase tracking-[0.24em] text-white/50">Pending Reviews</p>
          <p className="mt-3 text-4xl font-bold text-primary">{pendingReviews.length}</p>
          <p className="mt-1 text-sm text-white/60">Awaiting approval or rejection</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <p className="text-xs uppercase tracking-[0.24em] text-white/50">Approved Reviews</p>
          <p className="mt-3 text-4xl font-bold text-primary">{approvedReviews.length}</p>
          <p className="mt-1 text-sm text-white/60">Currently live across public surfaces</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <p className="text-xs uppercase tracking-[0.24em] text-white/50">Homepage Visibility</p>
          <button
            type="button"
            onClick={() => {
              patchSettings({
                reviews: {
                  showReviewsOnHome: !settings.reviews.showReviewsOnHome,
                },
              });
              toast.success(
                settings.reviews.showReviewsOnHome
                  ? "Home reviews section hidden"
                  : "Home reviews section visible"
              );
            }}
            className={`mt-4 rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200 ${settings.reviews.showReviewsOnHome ? "border-primary bg-primary/20 text-primary" : "border-white/10 text-white/70"}`}
          >
            {settings.reviews.showReviewsOnHome ? "Visible on Home" : "Hidden from Home"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="flex flex-wrap items-center gap-3">
          {([
            { label: `Pending (${pendingReviews.length})`, value: "pending" },
            { label: `Approved (${approvedReviews.length})`, value: "approved" },
          ] as const).map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-black shadow-[0_0_24px_rgba(245,166,35,0.35)]"
                    : "border border-white/10 bg-white/5 text-white/70 hover:border-primary/30 hover:text-primary"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {visibleReviews.length > 0 ? (
            visibleReviews.map((review: any) => (
              <article
                key={review._id}
                className="rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(245,166,35,0.08),rgba(255,255,255,0.04))] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{review.name}</h3>
                    <p className="mt-1 text-xs text-white/50">
                      {new Date(review._creationTime).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold text-primary">
                    {review.rating}/5
                  </span>
                </div>

                <p className="mt-4 text-sm leading-7 text-white/78">{review.reviewText}</p>

                <div className="mt-5 flex flex-wrap gap-3">
                  {review.status === "pending" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          approveReview({ id: (review as any)._id, status: "approved" });
                          toast.success("Review approved");
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-black transition-all duration-200 hover:shadow-[0_0_24px_rgba(245,166,35,0.35)]"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          rejectReview({ id: (review as any)._id });
                          toast.success("Review deleted");
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition-all duration-200 hover:bg-red-500/20"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          togglePinned({ id: (review as any)._id });
                          toast.success(review.pinned ? "Review unpinned" : "Review pinned to top");
                        }}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${review.pinned ? "bg-primary text-black" : "border border-white/10 bg-white/5 text-white/80 hover:border-primary/30 hover:text-primary"}`}
                      >
                        <Pin className="h-4 w-4" />
                        {review.pinned ? "Unpin" : "Pin"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateStatus({ id: (review as any)._id, status: "pending" });
                          toast.success("Review moved back to pending");
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition-all duration-200 hover:border-primary/30 hover:text-primary"
                      >
                        <X className="h-4 w-4" />
                        Move to Pending
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          rejectReview({ id: (review as any)._id });
                          toast.success("Approved review deleted");
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition-all duration-200 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
              No reviews in this state right now.
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
