"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const features = [
  { icon: "🤖", title: "AI Chat Copilot", desc: "Context-aware AI that knows your app state in real-time" },
  { icon: "🎤", title: "Voice Input", desc: "Web Speech API integration for hands-free interaction" },
  { icon: "💬", title: "Streaming Replies", desc: "Real-time streaming responses with typing indicators" },
  { icon: "🔔", title: "Smart Notifications", desc: "Animated push notification UI with action buttons" },
  { icon: "🌐", title: "5 Languages", desc: "English, Hindi, Kannada, Tamil & Telugu support" },
  { icon: "🌙", title: "Dark Mode", desc: "Auto-detects system theme preference" },
  { icon: "📊", title: "Action Analytics", desc: "Track every user action with detailed analytics" },
  { icon: "🔗", title: "1-Line Integration", desc: "Add to any website with a single script tag" },
];

const demoApps = [
  { href: "/rocket-game", emoji: "🚀", name: "Rocket Game", desc: "Space game with AI copilot" },
  { href: "/freshbite", emoji: "🍕", name: "FreshBite", desc: "Food delivery with AI chat" },
  { href: "/restaurant-dashboard", emoji: "🍕", name: "Dashboard", desc: "Restaurant owner admin" },
  { href: "/driver-app", emoji: "🚴", name: "Driver App", desc: "Delivery simulation" },
  { href: "/analytics", emoji: "📊", name: "Analytics", desc: "Order insights" },
  { href: "/castle-demo", emoji: "🏰", name: "Castle Living", desc: "PG finder with AI" },
];

export default function Landing() {
  const [stats, setStats] = useState({ tenants: 0, messages: 0, uptime: 0 });
  
  useEffect(() => {
    // Animate counters
    const targets = { tenants: 2847, messages: 89234, uptime: 99.9 };
    let frame = 0;
    const totalFrames = 60;
    const interval = setInterval(() => {
      frame++;
      setStats({
        tenants: Math.round((targets.tenants / totalFrames) * frame),
        messages: Math.round((targets.messages / totalFrames) * frame),
        uptime: Math.round((targets.uptime / totalFrames) * frame * 10) / 10,
      });
      if (frame >= totalFrames) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 40, background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "12px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>🏰</span>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>ActionBot</span>
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <a href="#features" style={{ textDecoration: "none", color: "#666", fontSize: 14, fontWeight: 500 }}>Features</a>
            <a href="#demo" style={{ textDecoration: "none", color: "#666", fontSize: 14, fontWeight: 500 }}>Demo</a>
            <a href="#pricing" style={{ textDecoration: "none", color: "#666", fontSize: 14, fontWeight: 500 }}>Pricing</a>
            <Link href="/" style={{ background: "#1B1C15", color: "white", textDecoration: "none", padding: "8px 20px", borderRadius: 100, fontSize: 14, fontWeight: 700 }}>Try Demo →</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ paddingTop: 120, paddingBottom: 80, textAlign: "center", background: "linear-gradient(135deg, #fff8f0 0%, #fafaf7 50%, #f0f7ff 100%)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "inline-block", padding: "6px 16px", background: "#fff3e6", border: "1px solid #ffe0b2", borderRadius: 100, fontSize: 13, fontWeight: 600, color: "#e85d04", marginBottom: 20 }}>
            🚀 Now with Voice Input & Streaming Replies
          </div>
          <h1 style={{ fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 16 }}>
            AI Chat Widget for<br /><span style={{ color: "#e85d04" }}>Every Website</span>
          </h1>
          <p style={{ color: "#666", fontSize: 18, maxWidth: 500, margin: "0 auto 32px", lineHeight: 1.6 }}>
            Add a fully functional AI assistant to any website in one line of code. 
            Knows your app state, handles actions, speaks 5 languages.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#1B1C15", color: "white", padding: "14px 32px", borderRadius: 100, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
              View Live Demo →
            </Link>
            <div style={{ background: "white", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 100, padding: "14px 24px", fontFamily: "monospace", fontSize: 12, color: "#e85d04", maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              &lt;script src=&quot;actionbot.app/widget.js&quot; ...&gt;
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: "white", borderTop: "1px solid rgba(0,0,0,0.06)", borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "32px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
          {[
            { label: "Active Tenants", value: stats.tenants.toLocaleString() + "+" },
            { label: "Messages Handled", value: stats.messages.toLocaleString() + "+" },
            { label: "Uptime SLA", value: stats.uptime + "%" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#e85d04" }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div id="features" style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px" }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: "center", marginBottom: 8 }}>Everything You Need ✨</h2>
        <p style={{ color: "#888", textAlign: "center", marginBottom: 40 }}>Built-in features that make ActionBot the most complete AI widget platform</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {features.map(f => (
            <div key={f.title} style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Apps */}
      <div id="demo" style={{ background: "#1B1C15", padding: "60px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "white", textAlign: "center", marginBottom: 8 }}>See It In Action 🎮</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", marginBottom: 40 }}>Click any demo to explore real-world ActionBot integrations</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {demoApps.map(app => (
              <Link key={app.href} href={app.href} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20, textDecoration: "none", transition: "all 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
              >
                <div style={{ fontSize: 32, marginBottom: 10 }}>{app.emoji}</div>
                <div style={{ color: "white", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{app.name}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{app.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Integration Code */}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Add to Any Website in 30 Seconds</h2>
        <p style={{ color: "#888", marginBottom: 24 }}>Copy, paste, and you're live. No backend required.</p>
        <div style={{ background: "#1a1a1a", borderRadius: 16, padding: 24, textAlign: "left" }}>
          <div style={{ color: "#888", fontSize: 12, marginBottom: 8 }}>HTML</div>
          <pre style={{ color: "#e85d04", fontFamily: "monospace", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0 }}>
{`<script
  src="https://actionbot.app/widget.js"
  data-tenant="your-tenant-key"
  data-api="https://actionbot.app"
  data-color="#e85d04"
  data-lang="en">
</script>`}
          </pre>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "40px 24px", borderTop: "1px solid rgba(0,0,0,0.06)", color: "#888", fontSize: 13 }}>
        <p>ActionBot Demo — Multi-tenant AI action bot platform</p>
        <p style={{ marginTop: 4 }}>6 demo apps showcasing widget capabilities</p>
      </footer>
    </div>
  );
}
