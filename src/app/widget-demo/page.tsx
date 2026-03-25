"use client";
import { useState } from "react";

const integrationExamples = [
  {
    id: "food-delivery",
    title: "Food Delivery",
    emoji: "🍕",
    description: "Chat to order, track delivery, get recommendations",
    code: `<script src="https://actionbot.app/widget.js"
  data-tenant="freshbite-001"
  data-api="https://actionbot.app"
  data-color="#e85d04">
</script>`,
    features: ["Menu browsing", "Order placement", "Delivery tracking", "Loyalty points"],
  },
  {
    id: "pg-finder",
    title: "PG / Flat Finder",
    emoji: "🏰",
    description: "Natural language property search with WhatsApp follow-up",
    code: `<script src="https://actionbot.app/widget.js"
  data-tenant="castle-living"
  data-api="https://actionbot.app"
  data-color="#1B1C15">
</script>`,
    features: ["Budget filtering", "Location search", "Visit scheduling", "WhatsApp alerts"],
  },
  {
    id: "ecommerce",
    title: "E-Commerce",
    emoji: "🛍️",
    description: "Product search, cart management, order status",
    code: `<script src="https://actionbot.app/widget.js"
  data-tenant="shop-example"
  data-api="https://actionbot.app"
  data-color="#6366f1">
</script>`,
    features: ["Product search", "Cart operations", "Order history", "Returns handling"],
  },
  {
    id: "saas",
    title: "SaaS Dashboard",
    emoji: "📊",
    description: "Help center, feature discovery, onboarding flow",
    code: `<script src="https://actionbot.app/widget.js"
  data-tenant="saas-app"
  data-api="https://actionbot.app"
  data-color="#0ea5e9">
</script>`,
    features: ["Help articles", "Feature tour", "Onboarding", "Usage analytics"],
  },
];

export default function WidgetDemo() {
  const [selectedExample, setSelectedExample] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const example = integrationExamples[selectedExample];

  const copyCode = () => {
    navigator.clipboard.writeText(example.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f1117", color: "white", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "20px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>🔌</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20 }}>ActionBot Integration</div>
              <div style={{ fontSize: 12, color: "#888" }}>One script tag = full AI assistant</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px" }}>
        {/* How It Works */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>⚡ How It Works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { step: "1", title: "Add Script Tag", desc: "Copy one HTML tag into your website's <head>", code: '<script src="..."></script>' },
              { step: "2", title: "Configure Tenant", desc: "Set your tenant key, API endpoint & brand color", code: 'data-tenant="your-app"' },
              { step: "3", title: "AI Goes Live", desc: "Your AI assistant is ready — handles chat, actions & analytics", code: '🤖 Ready!' },
            ].map((item, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 20 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#e85d04", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, marginBottom: 12 }}>
                  {item.step}
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: "#888", lineHeight: 1.5, marginBottom: 10 }}>{item.desc}</div>
                <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: "8px 10px", fontFamily: "monospace", fontSize: 11, color: "#e85d04" }}>{item.code}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Selector */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>🎯 Industry Examples</h2>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
            {integrationExamples.map((ex, i) => (
              <button key={ex.id} onClick={() => setSelectedExample(i)} style={{
                background: selectedExample === i ? "#e85d04" : "rgba(255,255,255,0.05)",
                border: `1px solid ${selectedExample === i ? "#e85d04" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 12, padding: "10px 20px", cursor: "pointer",
                flexShrink: 0, display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ fontSize: 18 }}>{ex.emoji}</span>
                <span style={{ color: "white", fontWeight: 600, fontSize: 14 }}>{ex.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Example Detail */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
          {/* Left: Description */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 36 }}>{example.emoji}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{example.title}</div>
                <div style={{ fontSize: 13, color: "#888" }}>{example.description}</div>
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: "#888" }}>CAPABILITIES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {example.features.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#22c55e", fontSize: 16 }}>✓</span>
                  <span style={{ fontSize: 14 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Code */}
          <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#888" }}>INTEGRATION CODE</div>
              <button onClick={copyCode} style={{ background: copied ? "#22c55e" : "#e85d04", border: "none", borderRadius: 8, padding: "6px 16px", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                {copied ? "✓ Copied!" : "📋 Copy"}
              </button>
            </div>
            <pre style={{ color: "#e85d04", fontFamily: "monospace", fontSize: 12, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0, background: "rgba(0,0,0,0.2)", padding: 16, borderRadius: 12 }}>
              {example.code}
            </pre>
          </div>
        </div>

        {/* Features */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>✨ Built-in Features</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { icon: "🤖", title: "Context-Aware AI", desc: "Knows your app state in real-time" },
              { icon: "💬", title: "Streaming Replies", desc: "Real-time response streaming" },
              { icon: "🎤", title: "Voice Input", desc: "Web Speech API integration" },
              { icon: "🌐", title: "5 Languages", desc: "EN, HI, KN, TA, TE" },
              { icon: "🌙", title: "Dark Mode", desc: "Auto-detects system theme" },
              { icon: "💰", title: "Cost Tracking", desc: "Per-message cost analytics" },
              { icon: "🔔", title: "Notifications", desc: "Push notification UI" },
              { icon: "📊", title: "Action Analytics", desc: "Track every user interaction" },
            ].map(f => (
              <div key={f.title} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget Preview Button */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <button onClick={() => setShowPreview(!showPreview)} style={{ background: "#e85d04", border: "none", borderRadius: 14, padding: "14px 32px", color: "white", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
            {showPreview ? "Hide Widget Preview" : "👁️ Preview Widget on This Page"}
          </button>
          {showPreview && (
            <div style={{ marginTop: 16, background: "white", borderRadius: 16, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 14, color: "#888", marginBottom: 12 }}>This is where the ActionBot widget would appear</div>
              <div style={{ background: "#f5f5f5", borderRadius: 12, padding: 32, textAlign: "center", color: "#888", fontSize: 13 }}>
                [ActionBot Widget]<br />Click to open chat
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
          div[style*="repeat(4, 1fr)"] { grid-template-columns: 1fr 1fr !important; }
          div[style*="1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
