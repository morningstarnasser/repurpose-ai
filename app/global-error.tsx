"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased" style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", background: "#FAFAFA", color: "#1A1A2E" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div style={{ border: "3px solid #000", boxShadow: "4px 4px 0px #000", background: "#fff", padding: "2rem", maxWidth: "28rem", width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>&#9888;</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.5rem" }}>Something went wrong</h2>
            <p style={{ color: "#1A1A2E99", fontWeight: 500, fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              style={{ border: "3px solid #000", boxShadow: "4px 4px 0px #000", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", padding: "0.75rem 1.5rem", background: "#FFD700", fontSize: "0.875rem" }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
