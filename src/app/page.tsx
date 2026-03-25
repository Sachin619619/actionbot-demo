"use client";
import Link from "next/link";

const apps = [
  {
    href: "/rocket-game",
    emoji: "🚀",
    title: "Rocket Game v3 + AI Copilot",
    desc: "Space game with power-ups (shield, slow-mo, fuel), particle effects, levels, combo system, score persistence & an intelligent AI co-pilot!",
    color: "#0a0a1a",
    tag: "GAME",
    tagColor: "#FF6B35",
    accent: "#FF6B35",
  },
  {
    href: "/restaurant-dashboard",
    emoji: "🍕",
    title: "Restaurant Owner Dashboard",
    desc: "Live order management with status tracking, revenue analytics, menu availability control, customer reviews & KPI cards.",
    color: "#1a1a2e",
    tag: "ADMIN",
    tagColor: "#22c55e",
    accent: "#22c55e",
  },
  {
    href: "/driver-app",
    emoji: "🚴",
    title: "Delivery Driver App",
    desc: "Simulated driver app with available deliveries, live ETA countdown, earnings counter, delivery flow & step-by-step progress.",
    color: "#0d1b0d",
    tag: "MOBILE",
    tagColor: "#3b82f6",
    accent: "#3b82f6",
  },
  {
    href: "/analytics",
    emoji: "📊",
    title: "Analytics Dashboard",
    desc: "Real-time order analytics with hourly bar charts, restaurant performance, delivery trends & live KPI cards.",
    color: "#0d0d1a",
    tag: "DATA",
    tagColor: "#a855f7",
    accent: "#a855f7",
  },
  {
    href: "/multi-restaurant",
    emoji: "🍕",
    title: "Multi-Restaurant Delivery",
    desc: "Order from 4 restaurants in one app. Live cart, social sharing (WhatsApp/Twitter), order history & cross-restaurant tracking.",
    color: "#1a1a2e",
    tag: "DEMO",
    tagColor: "#e85d04",
    accent: "#e85d04",
  },
  {
    href: "/castle-demo",
    emoji: "🏰",
    title: "Castle Living (PG Finder) — Live",
    desc: "Full AI-powered PG rental app with property matching, WhatsApp integration & walkthrough scheduling.",
    color: "#1B1C15",
    tag: "LIVE",
    tagColor: "#22c55e",
    accent: "#22c55e",
  },
  {
    href: "/widget-demo",
    emoji: "🔌",
    title: "Widget Integration Guide",
    desc: "Step-by-step guide on integrating ActionBot into any website with industry examples for food delivery, PG finder, e-commerce & SaaS.",
    color: "#0f0f1a",
    tag: "DEV",
    tagColor: "#0ea5e9",
    accent: "#0ea5e9",
  },
];

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", padding: "1.5rem", maxWidth: 680, margin: "0 auto", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem", paddingTop: "1rem" }}>
        <div style={{
          width: 64, height: 64,
          background: "linear-gradient(135deg, #e85d04, #ff8c42)",
          borderRadius: 18,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 0.875rem", fontSize: 32,
          boxShadow: "0 8px 32px rgba(232,93,4,0.3)",
        }}>🏰</div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "0.375rem" }}>ActionBot Demo</h1>
        <p style={{ color: "#888", fontSize: "0.85rem" }}>7 demo apps showcasing ActionBot capabilities</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        {apps.map(app => (
          <Link key={app.href} href={app.href as any} style={{ textDecoration: "none" }}>
            <div style={{
              background: app.color,
              borderRadius: 18,
              padding: "1.25rem",
              color: "white",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
              border: `1px solid ${app.accent}20`,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${app.accent}25`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
            >
              <span style={{ position: "absolute", top: 10, right: 10, background: app.tagColor, color: "white", fontSize: "0.58rem", fontWeight: 700, padding: "2px 8px", borderRadius: 100, letterSpacing: "0.3px" }}>{app.tag}</span>
              <span style={{ fontSize: 30, display: "block", marginBottom: "0.625rem" }}>{app.emoji}</span>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.375rem" }}>{app.title}</h2>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", lineHeight: 1.5 }}>{app.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: "1.75rem", padding: "1.25rem", background: "#FFFAEB", borderRadius: 18 }}>
        <h3 style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "0.625rem" }}>🔌 Integration Options</h3>
        {[
          { label: "Option 1", desc: "Use ActionBot widget (external SaaS) — one script tag" },
          { label: "Option 2", desc: "Build custom AI chat UI calling your own API directly" },
          { label: "Option 3", desc: "Hybrid: widget UI + your API for AI brain" },
        ].map((opt, i) => (
          <div key={i} style={{ display: "flex", gap: "0.625rem", marginBottom: "0.375rem", fontSize: "0.78rem" }}>
            <span style={{ fontWeight: 700, color: "#666", minWidth: 58 }}>{opt.label}</span>
            <span style={{ color: "#666" }}>{opt.desc}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
        {[
          { emoji: "🤖", title: "AI Copilot", desc: "Context-aware responses" },
          { emoji: "🎤", title: "Voice Input", desc: "Web Speech API" },
          { emoji: "💬", title: "Chat UI", desc: "Streaming replies" },
          { emoji: "🔔", title: "Notifications", desc: "Animated popups" },
        ].map(f => (
          <div key={f.title} style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 12, padding: "0.75rem" }}>
            <span style={{ fontSize: "1.1rem" }}>{f.emoji}</span>
            <div style={{ fontWeight: 700, fontSize: "0.78rem", marginTop: 3 }}>{f.title}</div>
            <div style={{ fontSize: "0.7rem", color: "#888", marginTop: 1 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
