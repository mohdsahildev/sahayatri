"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, Send } from "lucide-react";
import { createRideReview } from "@/lib/api/reviews";

interface ReviewTarget {
  id: string;
  name: string;
}

interface RideReviewProps {
  rideId: string;
  target: ReviewTarget;
  onSubmitted?: () => void;
}

export default function RideReview({
  rideId,
  target,
  onSubmitted,
}: RideReviewProps) {
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!rating) {
      setError("Please select a rating.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await createRideReview(rideId, {
        revieweeId: target.id,
        rating,
        comment: comment.trim() || undefined,
      });

      setSubmitted(true);
      router.refresh();
      onSubmitted?.();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit review.";
      const lower = msg.toLowerCase();
      if (
        lower.includes("already reviewed") ||
        lower.includes("already rated")
      ) {
        setAlreadyReviewed(true);
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (alreadyReviewed) {
    return (
      <div className="mt-3 rounded-xl bg-slate-100 p-4 border border-slate-200">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Star
            size={16}
            className="fill-amber-400 text-amber-400"
          />
          Already Reviewed
        </div>

        <p className="mt-1 text-xs text-slate-600">
          You have already reviewed{" "}
          {target.id ? (
            <Link
              href={`/profile/${target.id}`}
              className="font-semibold underline hover:text-slate-900"
            >
              {target.name}
            </Link>
          ) : (
            target.name
          )}
          {" "}for this ride.
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mt-3 rounded-xl bg-green-50 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
          <Star
            size={16}
            className="fill-yellow-400 text-yellow-400"
          />
          Review submitted
        </div>

        <p className="mt-1 text-xs text-green-600">
          Thanks for sharing your experience with{" "}
          {target.id ? (
            <Link
              href={`/profile/${target.id}`}
              className="font-semibold underline"
            >
              {target.name}
            </Link>
          ) : (
            target.name
          )}
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div>
        <h3 className="text-sm font-bold text-secondary">
          Rate{" "}
          {target.id ? (
            <Link
              href={`/profile/${target.id}`}
              className="transition hover:text-primary"
            >
              {target.name}
            </Link>
          ) : (
            target.name
          )}
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          How was your experience?
        </p>
      </div>

      <div className="mt-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => {
          const active = value <= (hoverRating || rating);

          return (
            <button
              key={value}
              type="button"
              aria-label={`${value} star${value > 1 ? "s" : ""}`}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(value)}
              className="rounded-md p-1 transition hover:scale-105"
            >
              <Star
                size={24}
                className={
                  active
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-slate-300"
                }
              />
            </button>
          );
        })}
      </div>

      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        maxLength={500}
        rows={3}
        placeholder="Share your experience (optional)"
        className="mt-3 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-primary"
      />

      <div className="mt-1 text-right text-[11px] text-slate-400">
        {comment.length}/500
      </div>

      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !rating}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-xs font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send size={14} />
        {submitting ? "Submitting..." : "Submit review"}
      </button>
    </div>
  );
}