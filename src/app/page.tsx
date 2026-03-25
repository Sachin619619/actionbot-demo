"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "3rem", paddingTop: "2rem" }}>
        <div style={{
          width: 64,
          height: 64,
          background: "#1B1C15",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1rem"
        }}>
          <span style={{ fontSize: 32 }}>🏰</span>
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          ActionBot Demo
        </h1>
        <p style={{ color: "#666", fontSize: "0.9rem" }}>
          Castle Living AI Chatbot — Integration Examples
        </p>
      </div>

      {/* Demo Apps */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {[
          {
            href: "/rocket-game",
            emoji: "🚀",
            title: "Rocket Game + AI Bot",
            desc: "Play a space game with an AI co-pilot that knows your score, fuel, and game state in real-time! Voice input supported.",
            color: "#0a0a1a",
            tag: "ENHANCED",
            tagColor: "#FF6B35",
          },
          {
            href: "/freshbite",
            emoji: "🍕",
            title: "FreshBite — Food Delivery",
            desc: "AI-powered food ordering via chat! Track deliveries in real-time, earn loyalty points, get push notification UI.",
            color: "#e85d04",
            tag: "NEW",
            tagColor: "#22c55e",
          },
          {
            href: "/castle-demo",
            emoji: "🏰",
            title: "Castle Living (PG Finder)",
            desc: "The full AI-powered PG rental app with ActionBot integrated.",
            color: "#1B1C15",
            tag: "LIVE",
            tagColor: "#22c55e",
          },
        ].map((app) => (
          <Link key={app.href} href={app.href} style={{ textDecoration: "none" }}>
            <div style={{
              background: app.color,
              borderRadius: 20,
              padding: "1.5rem",
              color: "white",
              transition: "transform 0.2s",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <span style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: app.tagColor,
                color: "white",
                fontSize: "0.65rem",
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: 100,
              }}>
                {app.tag}
              </span>
              <span style={{ fontSize: 36, display: "block", marginBottom: "0.75rem" }}>{app.emoji}</span>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>{app.title}</h2>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", lineHeight: 1.5 }}>{app.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Info */}
      <div style={{ marginTop: "2rem", padding: "1.5rem", background: "#FFFAEB", borderRadius: 20 }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem" }}>🔌 Integration Options</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[
            { label: "Option 1", desc: "Use ActionBot widget (external SaaS) — like Castle Living" },
            { label: "Option 2", desc: "Build custom AI chat UI calling your own API directly" },
            { label: "Option 3", desc: "Hybrid: widget for UI + your API for AI brain" },
          ].map((opt, i) => (
            <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
              <span style={{ fontWeight: 700, fontSize: "0.75rem", color: "#666", minWidth: 60 }}>{opt.label}</span>
              <span style={{ fontSize: "0.8rem", color: "#666" }}>{opt.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Cards */}
      <div style={{ marginTop: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        {[
          { emoji: "🤖", title: "AI Chat Bot", desc: "Context-aware, streaming responses" },
          { emoji: "🎤", title: "Voice Input", desc: "Web Speech API integration" },
          { emoji: "💬", title: "Chat Ordering", desc: "Natural language food orders" },
          { emoji: "📍", title: "Live Tracking", desc: "Real-time order status" },
          { emoji: "⭐", title: "Loyalty System", desc: "Points & rewards tracking" },
          { emoji: "🔔", title: "Notifications", desc: "Animated notification UI" },
        ].map(f => (
          <div key={f.title} style={{
            background: "white",
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: 14,
            padding: "0.875rem",
          }}>
            <span style={{ fontSize: "1.2rem" }}>{f.emoji}</span>
            <div style={{ fontWeight: 700, fontSize: "0.82rem", marginTop: 4 }}>{f.title}</div>
            <div style={{ fontSize: "0.72rem", color: "#888", marginTop: 2 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
