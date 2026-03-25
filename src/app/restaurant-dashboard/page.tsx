"use client";
import { useState, useEffect, useRef } from "react";

interface Order {
  id: string;
  customer: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: "pending" | "preparing" | "ready" | "picked_up" | "delivered";
  time: string;
  payment: "UPI" | "Cash" | "Card";
  rating?: number;
  notes?: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  available: boolean;
  ordersToday: number;
}

const initialOrders: Order[] = [
  { id: "ORD-2847", customer: "Priya Sharma", items: [{ name: "Margherita Pizza", qty: 1, price: 299 }, { name: "Caesar Salad", qty: 2, price: 199 }], total: 697, status: "pending", time: "2 min ago", payment: "UPI", notes: "Extra cheese please" },
  { id: "ORD-2848", customer: "Rahul Verma", items: [{ name: "Butter Chicken", qty: 1, price: 349 }, { name: "Garlic Naan", qty: 3, price: 60 }], total: 529, status: "preparing", time: "5 min ago", payment: "Cash" },
  { id: "ORD-2849", customer: "Ananya Patel", items: [{ name: "Smash Burger", qty: 2, price: 249 }], total: 498, status: "preparing", time: "8 min ago", payment: "UPI" },
  { id: "ORD-2850", customer: "Vikram Singh", items: [{ name: "Chicken Biryani", qty: 1, price: 279 }, { name: "Raita", qty: 1, price: 60 }, { name: "Tiramisu", qty: 1, price: 179 }], total: 518, status: "ready", time: "12 min ago", payment: "Card" },
  { id: "ORD-2851", customer: "Meera Joshi", items: [{ name: "Margherita Pizza", qty: 1, price: 299 }], total: 299, status: "picked_up", time: "15 min ago", payment: "UPI", rating: 5 },
  { id: "ORD-2852", customer: "Aditya Nair", items: [{ name: "Butter Chicken", qty: 2, price: 349 }, { name: "Naan", qty: 4, price: 60 }], total: 998, status: "delivered", time: "25 min ago", payment: "UPI", rating: 4 },
  { id: "ORD-2853", customer: "Sneha Reddy", items: [{ name: "Caesar Salad", qty: 1, price: 199 }, { name: "Sparkling Water", qty: 2, price: 50 }], total: 299, status: "pending", time: "1 min ago", payment: "UPI", notes: "No ice in water" },
];

const menuItems: MenuItem[] = [
  { id: "m1", name: "Margherita Pizza", price: 299, category: "Pizza", available: true, ordersToday: 24 },
  { id: "m2", name: "Butter Chicken", price: 349, category: "Main Course", available: true, ordersToday: 18 },
  { id: "m3", name: "Caesar Salad", price: 199, category: "Salads", available: true, ordersToday: 12 },
  { id: "m4", name: "Smash Burger", price: 249, category: "Burgers", available: true, ordersToday: 31 },
  { id: "m5", name: "Chicken Biryani", price: 279, category: "Rice", available: false, ordersToday: 22 },
  { id: "m6", name: "Tiramisu", price: 179, category: "Desserts", available: true, ordersToday: 15 },
  { id: "m7", name: "Garlic Naan", price: 60, category: "Breads", available: true, ordersToday: 45 },
  { id: "m8", name: "Pasta Alfredo", price: 229, category: "Pasta", available: true, ordersToday: 9 },
];

const statusFlow = ["pending", "preparing", "ready", "picked_up", "delivered"];

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "New Order", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  preparing: { label: "Preparing", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  ready: { label: "Ready", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  picked_up: { label: "Picked Up", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  delivered: { label: "Delivered", color: "#888", bg: "rgba(136,136,136,0.1)" },
};

export default function RestaurantDashboard() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [menu, setMenu] = useState<MenuItem[]>(menuItems);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "menu" | "overview">("orders");
  const [notification, setNotification] = useState<string | null>(null);
  const notifTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = (msg: string) => {
    setNotification(msg);
    if (notifTimeout.current) clearTimeout(notifTimeout.current);
    notifTimeout.current = setTimeout(() => setNotification(null), 2500);
  };

  const advanceStatus = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const idx = statusFlow.indexOf(o.status);
      if (idx < statusFlow.length - 1) {
        notify(`Order ${orderId} → ${statusLabels[statusFlow[idx + 1]]?.label}`);
        return { ...o, status: statusFlow[idx + 1] as Order["status"] };
      }
      return o;
    }));
  };

  const toggleAvailability = (itemId: string) => {
    setMenu(prev => prev.map(m => m.id === itemId ? { ...m, available: !m.available } : m));
  };

  const totalRevenue = orders.filter(o => o.status === "delivered").reduce((sum, o) => sum + o.total, 0);
  const pendingCount = orders.filter(o => o.status === "pending").length;
  const preparingCount = orders.filter(o => o.status === "preparing").length;
  const readyCount = orders.filter(o => o.status === "ready").length;
  const avgRating = (orders.filter(o => o.rating).reduce((s, o) => s + (o.rating || 0), 0) / orders.filter(o => o.rating).length).toFixed(1);

  return (
    <div style={{ minHeight: "100vh", background: "#0f1117", color: "white", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Notification */}
      {notification && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 100,
          background: "#22c55e", color: "white", padding: "12px 24px",
          borderRadius: 12, fontWeight: 700, fontSize: 14,
          animation: "slideIn 0.3s ease",
          boxShadow: "0 8px 24px rgba(34,197,94,0.3)",
        }}>
          ✅ {notification}
        </div>
      )}

      {/* Header */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "16px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>🍕</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>FreshBite Kitchen</div>
              <div style={{ fontSize: 12, color: "#888" }}>Restaurant Owner Dashboard</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "#888" }}>Today's Revenue</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: "#22c55e" }}>₹{totalRevenue.toLocaleString()}</div>
            </div>
            <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.1)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Open</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
        {[
          { label: "Pending", value: pendingCount, icon: "🔴", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
          { label: "Preparing", value: preparingCount, icon: "🟡", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
          { label: "Ready", value: readyCount, icon: "🟢", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
          { label: "Avg Rating", value: avgRating, icon: "⭐", color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
          { label: "Total Orders", value: orders.length, icon: "📋", color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
        ].map((stat, i) => (
          <div key={i} style={{ background: stat.bg, border: `1px solid ${stat.color}30`, borderRadius: 14, padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 24, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tab Nav */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 16px", display: "flex", gap: 8 }}>
        {(["orders", "menu", "overview"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            background: activeTab === tab ? "#e85d04" : "rgba(255,255,255,0.05)",
            border: "none", borderRadius: 10, padding: "10px 24px",
            color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer",
            transition: "all 0.2s",
          }}>
            {tab === "orders" ? "📋 Orders" : tab === "menu" ? "🍽️ Menu" : "📊 Overview"}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 40px" }}>
        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[...orders]
                .sort((a, b) => statusFlow.indexOf(a.status) - statusFlow.indexOf(b.status))
                .map(order => {
                  const st = statusLabels[order.status];
                  return (
                    <div key={order.id} onClick={() => setSelectedOrder(order)} style={{
                      background: selectedOrder?.id === order.id ? "rgba(232,93,4,0.15)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${selectedOrder?.id === order.id ? "#e85d04" : "rgba(255,255,255,0.06)"}`,
                      borderRadius: 14, padding: "16px 20px", cursor: "pointer",
                      transition: "all 0.2s", display: "flex", alignItems: "center", gap: 16,
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <span style={{ fontWeight: 800, fontSize: 15 }}>{order.id}</span>
                          <span style={{ background: st.bg, color: st.color, fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 100 }}>{st.label}</span>
                          <span style={{ marginLeft: "auto", fontSize: 12, color: "#888" }}>{order.time}</span>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{order.customer}</div>
                        <div style={{ fontSize: 12, color: "#888" }}>
                          {order.items.map(i => `${i.qty}x ${i.name}`).join(", ")}
                        </div>
                        {order.notes && (
                          <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 4, fontStyle: "italic" }}>📝 {order.notes}</div>
                        )}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 800, fontSize: 16, color: "#22c55e" }}>₹{order.total}</div>
                        <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{order.payment}</div>
                        {order.status !== "delivered" && (
                          <button onClick={e => { e.stopPropagation(); advanceStatus(order.id); }} style={{
                            marginTop: 8, background: "#e85d04", border: "none", borderRadius: 8,
                            padding: "6px 16px", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer",
                          }}>
                            {order.status === "pending" ? "Start →" : order.status === "preparing" ? "Ready!" : order.status === "ready" ? "Mark Picked Up" : "Complete"}
                          </button>
                        )}
                        {order.rating && (
                          <div style={{ marginTop: 6, fontSize: 13 }}>{Array.from({ length: order.rating }).map(() => "⭐").join("")}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Order Detail Panel */}
            {selectedOrder && (
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20, height: "fit-content", position: "sticky", top: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800 }}>Order {selectedOrder.id}</h3>
                  <button onClick={() => setSelectedOrder(null)} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 18 }}>✕</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>CUSTOMER</div>
                    <div style={{ fontWeight: 700 }}>{selectedOrder.customer}</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 11, color: "#888", marginBottom: 8 }}>ITEMS</div>
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span>{item.qty}x {item.name}</span>
                        <span style={{ fontWeight: 600 }}>₹{item.price * item.qty}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
                      <span>Total</span><span style={{ color: "#22c55e" }}>₹{selectedOrder.total}</span>
                    </div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>PAYMENT</div>
                    <div style={{ fontWeight: 700 }}>{selectedOrder.payment}</div>
                  </div>
                  {selectedOrder.notes && (
                    <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 11, color: "#f59e0b", marginBottom: 4 }}>SPECIAL NOTES</div>
                      <div style={{ fontSize: 13 }}>{selectedOrder.notes}</div>
                    </div>
                  )}
                  {selectedOrder.rating && (
                    <div style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 10, padding: 12, textAlign: "center" }}>
                      <div style={{ fontSize: 20 }}>{Array.from({ length: selectedOrder.rating }).map(() => "⭐").join("")}</div>
                      <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Customer rated this order</div>
                    </div>
                  )}
                  {selectedOrder.status !== "delivered" && (
                    <button onClick={() => advanceStatus(selectedOrder.id)} style={{
                      background: "#e85d04", border: "none", borderRadius: 12, padding: "14px",
                      color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer", marginTop: 4,
                    }}>
                      Advance Status →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MENU TAB */}
        {activeTab === "menu" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {menu.map(item => (
              <div key={item.id} style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14, padding: 20,
                opacity: item.available ? 1 : 0.5,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{item.category}</div>
                  </div>
                  <button onClick={() => toggleAvailability(item.id)} style={{
                    background: item.available ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                    border: "none", borderRadius: 8, padding: "6px 12px",
                    color: item.available ? "#22c55e" : "#ef4444",
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                  }}>
                    {item.available ? "✓ Available" : "✕ Unavailable"}
                  </button>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 800, fontSize: 20, color: "#e85d04" }}>₹{item.price}</span>
                  <span style={{ fontSize: 12, color: "#888" }}>{item.ordersToday} orders today</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Revenue Chart (simplified bar chart) */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>Revenue This Week</h3>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 160 }}>
                {[
                  { day: "Mon", value: 4200, height: 70 },
                  { day: "Tue", value: 5800, height: 90 },
                  { day: "Wed", value: 3100, height: 50 },
                  { day: "Thu", value: 7200, height: 100 },
                  { day: "Fri", value: 6500, height: 95 },
                  { day: "Sat", value: 8900, height: 100 },
                  { day: "Sun", value: 7500, height: 90 },
                ].map(d => (
                  <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <div style={{ width: "100%", height: `${d.height}%`, background: "linear-gradient(to top, #e85d04, #ff8c42)", borderRadius: 6, minHeight: 4, transition: "height 0.5s ease" }} />
                    <span style={{ fontSize: 11, color: "#888" }}>{d.day}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", fontSize: 13, color: "#888" }}>
                <span>Total: ₹43,200</span>
                <span style={{ color: "#22c55e" }}>+18% vs last week</span>
              </div>
            </div>

            {/* Order Status Breakdown */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>Order Status Breakdown</h3>
              {[
                { label: "Pending", count: pendingCount, color: "#ef4444" },
                { label: "Preparing", count: preparingCount, color: "#f59e0b" },
                { label: "Ready", count: readyCount, color: "#22c55e" },
                { label: "Picked Up", count: orders.filter(o => o.status === "picked_up").length, color: "#3b82f6" },
                { label: "Delivered", count: orders.filter(o => o.status === "delivered").length, color: "#888" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.color }} />
                  <span style={{ flex: 1, fontSize: 14 }}>{item.label}</span>
                  <span style={{ fontWeight: 800, fontSize: 15 }}>{item.count}</span>
                  <div style={{ width: 120, height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3 }}>
                    <div style={{ width: `${(item.count / orders.length) * 100}%`, height: "100%", background: item.color, borderRadius: 3, transition: "width 0.5s ease" }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Top Dishes */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>🔥 Top Selling Dishes</h3>
              {[...menu].sort((a, b) => b.ordersToday - a.ordersToday).map((item, i) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: "#888", width: 20 }}>#{i + 1}</span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{item.name}</span>
                  <span style={{ fontSize: 13, color: "#888" }}>{item.ordersToday} sold</span>
                </div>
              ))}
            </div>

            {/* Recent Reviews */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>⭐ Recent Reviews</h3>
              {[
                { name: "Aditya Nair", rating: 4, text: "Amazing butter chicken! Generous portion.", time: "25 min ago" },
                { name: "Meera Joshi", rating: 5, text: "Best pizza in Bangalore. Fast delivery too!", time: "45 min ago" },
                { name: "Rahul V", rating: 5, text: "The smash burger was incredible 🔥", time: "1h ago" },
              ].map((r, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 12, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{r.name}</span>
                    <span style={{ fontSize: 12, color: "#888" }}>{r.time}</span>
                  </div>
                  <div style={{ fontSize: 14, color: "#fbbf24" }}>{Array.from({ length: r.rating }).map(() => "⭐").join("")}</div>
                  <div style={{ fontSize: 13, color: "#ccc", marginTop: 4 }}>{r.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @media (max-width: 768px) { div[style*="grid-template-columns: 1fr 380px"] { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
