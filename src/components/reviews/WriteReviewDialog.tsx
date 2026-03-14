"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, ExternalLink, Star } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppSettings } from "@/context/AppSettingsContext";
import { reviewSchema, type ReviewInput } from "@/lib/validations/admin";
import type { ReviewRecord } from "@/lib/app-config";

interface WriteReviewDialogProps {
  triggerLabel?: string;
  triggerClassName?: string;
}

function createReviewId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function WriteReviewDialog({
  triggerLabel = "Write a Review",
  triggerClassName,
}: WriteReviewDialogProps) {
  const { settings } = useAppSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [submittedReview, setSubmittedReview] = useState<ReviewRecord | null>(null);
  const submitReview = useMutation(api.reviews.submit);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      name: "",
      rating: 5,
      reviewText: "",
    },
  });

  const rating = form.watch("rating");
  const reviewText = form.watch("reviewText");
  const googleReviewUrl = useMemo(
    () => settings.restaurant.googleReviewLink || "https://search.google.com/local/writereview",
    [settings.restaurant.googleReviewLink]
  );

  const handleSubmit = async (values: ReviewInput) => {
    setIsSubmitting(true);
    try {
      await submitReview({
        name: values.name.trim(),
        rating: values.rating,
        reviewText: values.reviewText.trim(),
      });

      setSubmittedReview({
        id: "temp",
        name: values.name.trim(),
        rating: values.rating,
        reviewText: values.reviewText.trim(),
        createdAt: new Date().toISOString(),
        status: "pending",
        pinned: false,
      });

      form.reset({ name: "", rating: 5, reviewText: "" });
      toast.success("Review submitted for approval");
    } catch {
      toast.error("Unable to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyReview = async () => {
    if (!submittedReview) {
      return;
    }

    try {
      await navigator.clipboard.writeText(submittedReview.reviewText);
      toast.success("Review copied to clipboard");
    } catch {
      toast.error("Unable to copy review");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          triggerClassName ??
          "rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:shadow-[0_0_24px_rgba(245,166,35,0.45)]"
        }
      >
        {triggerLabel}
      </button>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setSubmittedReview(null);
          }
        }}
      >
        <DialogContent className="max-w-xl border-border bg-background text-foreground shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl sm:rounded-3xl">
          {/* Decorative Gradient in Dialog */}
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-3xl">
            <div className="absolute -top-[50%] -right-[50%] h-full w-full bg-primary/5 blur-[100px]" />
            <div className="absolute -bottom-[50%] -left-[50%] h-full w-full bg-primary/3 blur-[100px]" />
          </div>

          <div className="relative z-10">
            {!submittedReview ? (
              <div className="space-y-6">
                <DialogTitle className="bg-gradient-to-r from-[#F5A623] to-[#C47B05] bg-clip-text text-2xl font-bold text-transparent">
                  Share Your Experience
                </DialogTitle>

                <form className="space-y-5" onSubmit={form.handleSubmit(handleSubmit)}>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Your Name
                    </label>
                    <input
                      {...form.register("name")}
                      className="w-full rounded-xl border border-input bg-muted/30 px-4 py-3 text-sm text-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                      placeholder="e.g. Rahul Sharma"
                    />
                    {form.formState.errors.name && (
                      <p className="mt-1 text-xs text-destructive">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Your Rating
                    </label>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, index) => {
                        const starValue = index + 1;
                        const isActive = starValue <= rating;

                        return (
                          <button
                            key={`review-star-${starValue}`}
                            type="button"
                            onClick={() => form.setValue("rating", starValue, { shouldValidate: true })}
                            className="group rounded-full p-2 transition-transform duration-200 hover:scale-110 active:scale-95"
                          >
                            <Star 
                              className={`h-8 w-8 transition-all duration-300 ${isActive ? "fill-primary text-primary drop-shadow-[0_0_8px_rgba(245,166,35,0.4)]" : "text-muted/40"}`} 
                            />
                          </button>
                        );
                      })}
                    </div>
                    {form.formState.errors.rating && (
                      <p className="mt-1 text-xs text-destructive">{form.formState.errors.rating.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Your Review
                    </label>
                    <div className="relative">
                      <textarea
                        {...form.register("reviewText")}
                        className="min-h-32 w-full resize-none rounded-xl border border-input bg-muted/30 px-4 py-3 text-sm text-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                        placeholder="Tell us what you loved about our food and service..."
                      />
                      <div className="absolute right-3 bottom-3 flex items-center gap-2">
                        <span className={`text-[10px] font-medium transition-colors ${reviewText.length > 280 ? "text-destructive" : "text-muted-foreground"}`}>
                          {reviewText.length}/300
                        </span>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      {form.formState.errors.reviewText ? (
                        <p className="text-xs text-destructive">{form.formState.errors.reviewText.message}</p>
                      ) : (
                        <span className="text-[10px] font-medium text-muted-foreground/60">Minimum 10 characters</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-full bg-primary px-5 py-4 text-sm font-bold text-black shadow-lg transition-all duration-300 hover:shadow-primary/25 hover:brightness-105 active:scale-[0.98]"
                  >
                    Submit Review
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Star className="h-8 w-8 fill-primary text-primary" />
                  </div>
                  <DialogTitle className="bg-gradient-to-r from-[#F5A623] to-[#C47B05] bg-clip-text text-2xl font-bold text-transparent">
                    Thank You!
                  </DialogTitle>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your review has been submitted and is currently pending approval.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl bg-muted/40 p-5">
                  <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Boost us on Google
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={copyReview}
                      className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold transition-all duration-200 hover:border-primary/40 hover:text-primary"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Text
                    </button>
                    <a
                      href={googleReviewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-black transition-all duration-200 hover:shadow-lg hover:shadow-primary/20"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Write on Google
                    </a>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSubmittedReview(null);
                    setIsOpen(false);
                  }}
                  className="w-full rounded-full border border-border px-4 py-3 text-sm font-semibold transition-all duration-200 hover:bg-muted"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
