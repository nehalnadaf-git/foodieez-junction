"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { ReviewRecord } from "@/lib/app-config";

interface ReviewCardProps {
  review: ReviewRecord;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const dateLabel = new Date(review.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative h-full overflow-hidden rounded-2xl border p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
      style={{
        background: "linear-gradient(145deg, hsl(var(--card) / 0.9), hsl(var(--card) / 0.6))",
        borderColor: "hsl(var(--border))",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="bg-gradient-to-r from-[#F5A623] to-[#C47B05] bg-clip-text text-lg font-bold text-transparent">
              {review.name}
            </h3>
            <p className="mt-1 text-xs font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>{dateLabel}</p>
          </div>
          {review.pinned && (
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary shadow-[0_2px_10px_rgba(245,166,35,0.15)]">
              Top Review
            </span>
          )}
        </div>

        <div className="mt-5 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={`${review.id}-star-${index}`}
              className={`h-4 w-4 transition-all duration-300 group-hover:scale-110 ${index < review.rating ? "fill-primary text-primary" : "text-border"}`}
              style={{ transitionDelay: `${index * 50}ms` }}
            />
          ))}
        </div>

        <div className="mt-6">
          <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--foreground) / 0.85)" }}>
            <span className="mr-1 text-2xl font-serif leading-none text-primary/30">"</span>
            {review.reviewText}
            <span className="ml-1 text-2xl font-serif leading-none text-primary/30">"</span>
          </p>
        </div>
      </div>
    </motion.article>
  );
}
