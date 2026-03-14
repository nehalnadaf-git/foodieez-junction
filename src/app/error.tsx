"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <h2 className="mb-4 text-3xl font-bold text-foreground">
          Something went wrong
        </h2>
        <p className="mb-6 text-muted-foreground">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-full font-heading font-semibold text-sm"
          style={{
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
