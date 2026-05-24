import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "Tradeverse Academy";
  const path = searchParams.get("path") ?? "Trading Education";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0F172A",
          color: "#F1F5F9",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px",
          fontFamily: "Inter",
        }}
      >
        <div style={{ color: "#F7C325", fontSize: 34, marginBottom: 20 }}>Tradeverse Academy</div>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
        <div style={{ fontSize: 30, marginTop: 18, opacity: 0.9 }}>{path}</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
