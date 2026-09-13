// src/app/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "TaskDeck Newsroom OS";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#07090E",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "sans-serif",
          color: "white",
          position: "relative",
        }}
      >
        {/* Glow orb background */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "400px",
            width: "500px",
            height: "500px",
            background: "rgba(37, 99, 235, 0.2)",
            filter: "blur(120px)",
            borderRadius: "50%",
          }}
        />

        {/* Top bar: Brand & Live Pill */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                background: "#2563EB",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="2" fill="white" />
                <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
              </svg>
            </div>
            <span style={{ fontSize: "28px", fontWeight: "bold", letterSpacing: "-0.5px" }}>
              TaskDeck<span style={{ color: "#3B82F6" }}>.News</span>
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "999px",
              padding: "8px 18px",
              fontSize: "14px",
              color: "#34D399",
              fontFamily: "monospace",
            }}
          >
            ● LIVE RUNDOWN OS
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <h1
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              letterSpacing: "-2px",
              lineHeight: 1.1,
              maxWidth: "900px",
            }}
          >
            Every story filed. Every telecast sealed.
          </h1>
          <p
            style={{
              fontSize: "24px",
              color: "rgba(255, 255, 255, 0.5)",
              maxWidth: "780px",
              lineHeight: 1.4,
            }}
          >
            High-tempo daily story assignment, editorial proof verification, and master broadcast rundowns.
          </p>
        </div>

        {/* Bottom Specs Ribbon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            fontSize: "16px",
            color: "rgba(255, 255, 255, 0.4)",
            fontFamily: "monospace",
          }}
        >
          <span>NEXT.JS APP ROUTER</span>
          <span>•</span>
          <span>POSTGRESQL</span>
          <span>•</span>
          <span>SUPABASE AUTH</span>
          <span>•</span>
          <span>DRIZZLE ORM</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}