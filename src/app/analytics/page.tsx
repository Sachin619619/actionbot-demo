"use client";
import { useState, useEffect } from "react";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">("week");

  const dataSets = {
    today: {
      revenue: "₹34,580", revenueChange: "+12.3%", orders: "287", ordersChange: "+8.1%",
      aov: "₹412", aovChange: "+5.2%", deliveryTime: "22 min", deliveryChange: "-8.1%",
      hourly: [
        { hour: "6AM", orders: 4, revenue: 1240 }, { hour: "7AM", orders: 8, revenue: 2340 },
        { hour: "8AM", orders: 12, revenue: 3600 }, { hour: "9AM", orders: 18, revenue: 5420 },
        { hour: "10AM", orders: 25, revenue: 7200 }, { hour: "11AM", orders: 32, revenue: 9100 },
        { hour: "12PM", orders: 48, revenue: 14400 }, { hour: "1PM", orders: 55, revenue: 16200 },
        { hour: "2PM", orders: 42, revenue: 12800 }, { hour: "3PM", orders: 28, revenue: 8400 },
        { hour: "4PM", orders: 22, revenue: 6600 }, { hour: "5PM", orders: 35, revenue: 10500 },
        { hour: "6PM", orders: 52, revenue: 15600 }, { hour: "7PM", orders: 68, revenue: 20400 },
        { hour: "8PM", orders: 75, revenue: 22500 }, { hour: "9PM", orders: 62, revenue: 18600 },
        { hour: "10PM", orders: 38, revenue: 11400 },
      ],
    },
    week: {
      revenue: "₹2,34,580", revenueChange: "+18.3%", orders: "1,847", ordersChange: "+12.5%",
      aov: "₹412", aovChange: "+5.2%", deliveryTime: "22 min", deliveryChange: "-8.1%",
      hourly: [
        { hour: "Mon", orders: 42, revenue: 14200 }, { hour: "Tue", orders: 58, revenue: 19800 },
        { hour: "Wed", orders: 31, revenue: 10600 }, { hour: "Thu", orders: 72, revenue: 24400 },
        { hour: "Fri", orders: 65, revenue: 22000 }, { hour: "Sat", orders: 89, revenue: 30200 },
        { hour: "Sun", orders: 75, revenue: 25400 },
      ],
    },
    month: {
      revenue: "₹9,87,240", revenueChange: "+22.1%", orders: "7,834", ordersChange: "+15.8%",
      aov: "₹418", aovChange: "+7.1%", deliveryTime: "21 min", deliveryChange: "-10.2%",
      hourly: [
        { hour: "Week 1", orders: 1200, revenue: 410000 }, { hour: "Week 2", orders: 1450, revenue: 496000 },
        { hour: "Week 3", orders: 1680, revenue: 574000 }, { hour: "Week 4", orders: 1890, revenue: 646000 },
      ],
    },
  };

  const currentData = dataSets[timeRange];
  const hourlyData = currentData.hourly;
  const maxOrders = Math.max(...hourlyData.map(d => d.orders));

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "white", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "20px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>📊</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20 }}>Order Analytics</div>
              <div style={{ fontSize: 12, color: "#888" }}>FreshBite Platform — Real-time insights</div>
            </div>
          </div>
          
          {/* Time Range Selector */}
          <div style={{ display: "flex", gap: 8 }}>
            {(["today", "week", "month"] as const).map(range => (
              <button key={range} onClick={() => setTimeRange(range)} style={{
                background: timeRange === range ? "#e85d04" : "rgba(255,255,255,0.06)",
                border: "none", borderRadius: 10, padding: "8px 20px",
                color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer",
                textTransform: "capitalize",
              }}>
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Revenue", value: currentData.revenue, change: currentData.revenueChange, up: true, icon: "💰", color: "#22c55e" },
            { label: "Orders", value: currentData.orders, change: currentData.ordersChange, up: true, icon: "📦", color: "#3b82f6" },
            { label: "Avg Order Value", value: currentData.aov, change: currentData.aovChange, up: true, icon: "🛒", color: "#e85d04" },
            { label: "Delivery Time", value: currentData.deliveryTime, change: currentData.deliveryChange, up: true, icon: "⏱️", color: "#a855f7" },
          ].map((kpi, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>{kpi.icon}</span>
                <span style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 100 }}>{kpi.change}</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 4, color: kpi.color }}>{kpi.value}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Hourly Orders Chart */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800 }}>📈 Orders by Hour</h3>
            <span style={{ fontSize: 12, color: "#888" }}>{timeRange === "today" ? "Peak: 1-2 PM" : timeRange === "week" ? "Peak: Saturday" : "Peak: Week 4"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 180 }}>
            {hourlyData.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
                <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                  <div style={{
                    width: "100%",
                    height: `${(d.orders / maxOrders) * 100}%`,
                    background: i >= 12 && i <= 14 ? "linear-gradient(to top, #e85d04, #ff8c42)" : i >= 18 && i <= 21 ? "linear-gradient(to top, #ff6b35, #ffd93d)" : "rgba(255,255,255,0.15)",
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.5s ease",
                    minHeight: 4,
                    position: "relative",
                  }}>
                    {i === 14 && (
                      <div style={{ position: "absolute", top: -24, left: "50%", transform: "translateX(-50%)", background: "#e85d04", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>
                        PEAK 📈
                      </div>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: 9, color: "#888", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>{d.hour}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Top Restaurants */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>🏪 Restaurant Performance</h3>
            {[
              { name: "FreshBite Indiranagar", orders: 342, revenue: 124500, growth: "+22%" },
              { name: "FreshBite Whitefield", orders: 298, revenue: 108200, growth: "+18%" },
              { name: "FreshBite Koramangala", orders: 267, revenue: 97200, growth: "+15%" },
              { name: "FreshBite HSR Layout", orders: 234, revenue: 85100, growth: "+12%" },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: "#888", width: 20 }}>#{i+1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: "#888" }}>{r.orders} orders · ₹{(r.revenue/1000).toFixed(0)}K revenue</div>
                </div>
                <span style={{ color: "#22c55e", fontWeight: 700, fontSize: 12 }}>{r.growth}</span>
              </div>
            ))}
          </div>

          {/* Order Status Distribution */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>📊 Order Status Distribution</h3>
            {[
              { label: "Delivered", count: 1523, pct: 82, color: "#22c55e" },
              { label: "Cancelled", count: 98, pct: 5, color: "#ef4444" },
              { label: "Refunded", count: 74, pct: 4, color: "#f59e0b" },
              { label: "In Progress", count: 152, pct: 8, color: "#3b82f6" },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: 13, color: "#888" }}>{item.count} ({item.pct}%)</span>
                </div>
                <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4 }}>
                  <div style={{ width: `${item.pct}%`, height: "100%", background: item.color, borderRadius: 4, transition: "width 0.8s ease" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Trends */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>🚴 Delivery Trends</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Avg Delivery Time", value: "22 min", trend: "↓ 8%" },
                { label: "On-Time Rate", value: "96.4%", trend: "↑ 2%" },
                { label: "Avg Distance", value: "3.2 km", trend: "↓ 5%" },
                { label: "Driver Utilization", value: "78%", trend: "↑ 11%" },
              ].map((t, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{t.label}</div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{t.value}</div>
                  <div style={{ fontSize: 11, color: "#22c55e", marginTop: 4 }}>{t.trend}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Items */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>🔥 Most Popular Items</h3>
            {[
              { name: "Smash Burger", orders: 487, revenue: 121243, pct: 100 },
              { name: "Margherita Pizza", orders: 412, revenue: 123188, pct: 85 },
              { name: "Butter Chicken", orders: 356, revenue: 124244, pct: 73 },
              { name: "Chicken Biryani", orders: 298, revenue: 83142, pct: 61 },
              { name: "Caesar Salad", orders: 234, revenue: 46566, pct: 48 },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: "#888", width: 18 }}>{i+1}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{item.name}</span>
                <div style={{ width: 80, height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                  <div style={{ width: `${item.pct}%`, height: "100%", background: "linear-gradient(to right, #e85d04, #ff8c42)", borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 12, color: "#888", minWidth: 40, textAlign: "right" }}>{item.orders}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(4, 1fr)"] { grid-template-columns: 1fr 1fr !important; }
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
