"use client";
import { useState } from "react";

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  minOrder: number;
  deliveryFee: number;
  image: string;
  accentColor: string;
  tagline: string;
  menuItems: { name: string; price: number; badge?: string }[];
}

const restaurants: Restaurant[] = [
  {
    id: "fb-ind",
    name: "FreshBite Indiranagar",
    cuisine: "Italian · Indian · Chinese",
    rating: 4.8,
    deliveryTime: "18-25 min",
    minOrder: 150,
    deliveryFee: 30,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80",
    accentColor: "#e85d04",
    tagline: "The OG FreshBite — everyone's favorite",
    menuItems: [
      { name: "Margherita Pizza", price: 299, badge: "🔥 Bestseller" },
      { name: "Butter Chicken", price: 349 },
      { name: "Caesar Salad", price: 199 },
      { name: "Smash Burger", price: 249, badge: "⭐ Top Rated" },
      { name: "Chicken Biryani", price: 279 },
      { name: "Tiramisu", price: 179 },
    ],
  },
  {
    id: "fb-whf",
    name: "FreshBite Whitefield",
    cuisine: "Continental · Asian · Mexican",
    rating: 4.7,
    deliveryTime: "22-30 min",
    minOrder: 200,
    deliveryFee: 40,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
    accentColor: "#3b82f6",
    tagline: "International flavors, local delivery",
    menuItems: [
      { name: "Pasta Carbonara", price: 329 },
      { name: "Grilled Salmon", price: 499, badge: "🆕 New" },
      { name: "Pad Thai", price: 289 },
      { name: "Fish Tacos", price: 249 },
      { name: "Chocolate Lava Cake", price: 199 },
    ],
  },
  {
    id: "fb-kor",
    name: "FreshBite Koramangala",
    cuisine: "Indian · Biryani · Desserts",
    rating: 4.9,
    deliveryTime: "15-20 min",
    minOrder: 100,
    deliveryFee: 20,
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=80",
    accentColor: "#22c55e",
    tagline: "Fastest delivery in Koramangala",
    menuItems: [
      { name: "Chicken Biryani", price: 279, badge: "🔥 Bestseller" },
      { name: "Mutton Curry", price: 389 },
      { name: "Paneer Tikka", price: 229 },
      { name: "Garlic Naan (3pc)", price: 80 },
      { name: "Rasmalai (4pc)", price: 149 },
    ],
  },
  {
    id: "fb-hsr",
    name: "FreshBite HSR Layout",
    cuisine: "Healthy · Salads · Smoothies",
    rating: 4.6,
    deliveryTime: "20-28 min",
    minOrder: 180,
    deliveryFee: 35,
    image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&q=80",
    accentColor: "#a855f7",
    tagline: "Eat clean, feel great",
    menuItems: [
      { name: "Quinoa Power Bowl", price: 299 },
      { name: "Avocado Toast", price: 249 },
      { name: "Berry Smoothie Bowl", price: 199 },
      { name: "Grilled Chicken Salad", price: 279, badge: "🥗 Healthy" },
      { name: "Protein Shake", price: 149 },
    ],
  },
];

export default function MultiRestaurant() {
  const [selected, setSelected] = useState<Restaurant>(restaurants[0]);
  const [cart, setCart] = useState<{ name: string; price: number; qty: number }[]>([]);
  const [showShare, setShowShare] = useState(false);
  const [showOrderPlaced, setShowOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [filter, setFilter] = useState("");

  const addToCart = (item: { name: string; price: number }) => {
    setCart(prev => {
      const existing = prev.find(c => c.name === item.name);
      if (existing) return prev.map(c => c.name === item.name ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (name: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.name === name);
      if (existing && existing.qty > 1) return prev.map(c => c.name === name ? { ...c, qty: c.qty - 1 } : c);
      return prev.filter(c => c.name !== name);
    });
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const placeOrder = () => {
    const id = "ORD-" + Math.floor(1000 + Math.random() * 9000);
    setOrderId(id);
    setShowOrderPlaced(true);
    setCart([]);
  };

  const shareOrder = (platform: string) => {
    const text = `🍕 I just ordered from ${selected.name} on FreshBite! My order total is ₹${cartTotal}. Order ID: ${orderId}. #FreshBite #FoodDelivery`;
    if (platform === "twitter") window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
    if (platform === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    if (platform === "copy") { navigator.clipboard.writeText(text).catch(() => {}); alert("Copied to clipboard!"); }
    setShowShare(false);
  };

  const filtered = restaurants.filter(r => r.name.toLowerCase().includes(filter.toLowerCase()) || r.cuisine.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div style={{ minHeight: "100vh", background: "#fafaf7", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Order Placed Modal */}
      {showOrderPlaced && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "white", borderRadius: 24, padding: "40px", maxWidth: 400, width: "90%", textAlign: "center", animation: "popIn 0.4s ease" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Order Placed!</h2>
            <p style={{ color: "#666", marginBottom: 4 }}>Order ID: <b style={{ color: "#e85d04" }}>{orderId}</b></p>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>Estimated delivery: {selected.deliveryTime}</p>
            <div style={{ background: "#f5f5f5", borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>Share your order with friends:</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button onClick={() => shareOrder("whatsapp")} style={{ background: "#25D366", border: "none", borderRadius: 10, padding: "10px 20px", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>📱 WhatsApp</button>
                <button onClick={() => shareOrder("twitter")} style={{ background: "#1DA1F2", border: "none", borderRadius: 10, padding: "10px 20px", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>🐦 Twitter</button>
                <button onClick={() => shareOrder("copy")} style={{ background: "#666", border: "none", borderRadius: 10, padding: "10px 20px", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>📋 Copy</button>
              </div>
            </div>
            <button onClick={() => setShowOrderPlaced(false)} style={{ background: "#e85d04", border: "none", borderRadius: 12, padding: "12px 32px", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>Done</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "16px 24px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 26 }}>🍕</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>FreshBite</div>
              <div style={{ fontSize: 12, color: "#888" }}>Multi-Restaurant Delivery</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search restaurants..." style={{ background: "#f5f5f5", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 13, outline: "none", width: 200 }} />
            {cartCount > 0 && (
              <div style={{ position: "relative" }}>
                <button style={{ background: "#e85d04", border: "none", borderRadius: 12, padding: "10px 20px", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 14, position: "relative" }}>
                  🛒 Cart ({cartCount})
                </button>
                <div style={{ position: "absolute", top: -6, right: -6, background: "#ef4444", color: "white", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>
                  {cartCount}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
        {/* Restaurant Tabs + Menu */}
        <div>
          {/* Restaurant Selector */}
          <div style={{ display: "flex", gap: 12, overflowX: "auto", marginBottom: 24, paddingBottom: 4 }}>
            {filtered.map(r => (
              <button key={r.id} onClick={() => setSelected(r)} style={{
                background: selected.id === r.id ? r.accentColor : "white",
                border: `2px solid ${selected.id === r.id ? r.accentColor : "rgba(0,0,0,0.08)"}`,
                borderRadius: 16, padding: "14px 20px", cursor: "pointer", flexShrink: 0,
                transition: "all 0.2s", minWidth: 200,
              }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: selected.id === r.id ? "white" : "#1a1a1a" }}>{r.name.split(" ").slice(1).join(" ")}</div>
                <div style={{ fontSize: 11, color: selected.id === r.id ? "rgba(255,255,255,0.7)" : "#888", marginTop: 2 }}>{r.rating} ⭐ · {r.deliveryTime}</div>
              </button>
            ))}
          </div>

          {/* Restaurant Detail */}
          <div style={{ background: "white", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(0,0,0,0.06)", marginBottom: 20 }}>
            <div style={{ height: 180, backgroundImage: `url(${selected.image})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }} />
              <div style={{ position: "absolute", bottom: 16, left: 20, color: "white" }}>
                <div style={{ fontWeight: 800, fontSize: 22 }}>{selected.name}</div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>{selected.cuisine}</div>
              </div>
              <div style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.95)", borderRadius: 10, padding: "6px 14px" }}>
                <span style={{ fontWeight: 800, color: "#1a1a1a" }}>⭐ {selected.rating}</span>
              </div>
            </div>
            <div style={{ padding: "16px 20px" }}>
              <p style={{ color: "#888", fontSize: 13 }}>{selected.tagline}</p>
              <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
                <span style={{ fontSize: 13, color: "#888" }}>⏱️ {selected.deliveryTime}</span>
                <span style={{ fontSize: 13, color: "#888" }}>💰 Min ₹{selected.minOrder}</span>
                <span style={{ fontSize: 13, color: "#888" }}>🚴 ₹{selected.deliveryFee} delivery</span>
              </div>
            </div>
          </div>

          {/* Menu */}
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>🍽️ Menu</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {selected.menuItems.map((item, i) => (
              <div key={i} style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 16, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, flex: 1 }}>{item.name}</div>
                  <span style={{ fontWeight: 800, fontSize: 16, color: "#e85d04" }}>₹{item.price}</span>
                </div>
                {item.badge && <div style={{ fontSize: 11, color: "#888", marginBottom: 8 }}>{item.badge}</div>}
                <button onClick={() => addToCart(item)} style={{ width: "100%", background: selected.accentColor, border: "none", borderRadius: 10, padding: "8px", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  + Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Sidebar */}
        <div style={{ position: "sticky", top: 90, height: "fit-content" }}>
          <div style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 20, padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>🛒 Your Order</h3>
            
            {cart.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "#888", fontSize: 14 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🛒</div>
                <p>Your cart is empty</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>Add items from the menu</p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                  {cart.map((item, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: "#888" }}>₹{item.price} × {item.qty}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>₹{item.price * item.qty}</span>
                        <button onClick={() => removeFromCart(item.name)} style={{ background: "#f5f5f5", border: "none", borderRadius: 6, width: 24, height: 24, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 12, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#888", marginBottom: 6 }}>
                    <span>Subtotal</span><span>₹{cartTotal}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#888", marginBottom: 6 }}>
                    <span>Delivery fee</span><span>₹{selected.deliveryFee}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16, marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                    <span>Total</span><span style={{ color: "#22c55e" }}>₹{cartTotal + selected.deliveryFee}</span>
                  </div>
                </div>

                <button onClick={placeOrder} style={{ width: "100%", background: "#e85d04", border: "none", borderRadius: 14, padding: "14px", color: "white", fontWeight: 800, fontSize: 15, cursor: "pointer", marginBottom: 8 }}>
                  Place Order 🏃
                </button>

                {/* Social Share */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setShowShare(true)} style={{ flex: 1, background: "#f0f0f0", border: "none", borderRadius: 10, padding: "10px", color: "#333", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    📤 Share Order
                  </button>
                  <button onClick={() => setCart([])} style={{ flex: 1, background: "#fff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10, padding: "10px", color: "#666", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    🗑️ Clear
                  </button>
                </div>

                {showShare && (
                  <div style={{ marginTop: 12, background: "#f9f9f9", borderRadius: 12, padding: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: "#888" }}>Share this order:</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => shareOrder("whatsapp")} style={{ flex: 1, background: "#25D366", border: "none", borderRadius: 8, padding: "8px", color: "white", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>WhatsApp</button>
                      <button onClick={() => shareOrder("twitter")} style={{ flex: 1, background: "#1DA1F2", border: "none", borderRadius: 8, padding: "8px", color: "white", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Twitter</button>
                      <button onClick={() => shareOrder("copy")} style={{ flex: 1, background: "#666", border: "none", borderRadius: 8, padding: "8px", color: "white", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Copy</button>
                    </div>
                    <button onClick={() => setShowShare(false)} style={{ width: "100%", marginTop: 8, background: "none", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, padding: "6px", color: "#888", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Cancel</button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Order History */}
          <div style={{ marginTop: 16, background: "white", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 20, padding: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>📋 Recent Orders</h4>
            {[
              { id: "ORD-2844", restaurant: "Indiranagar", items: "Margherita Pizza, Caesar Salad", total: 498, status: "Delivered" },
              { id: "ORD-2839", restaurant: "Koramangala", items: "Chicken Biryani, Naan", total: 359, status: "Delivered" },
            ].map((o, i) => (
              <div key={i} style={{ background: "#f9f9f9", borderRadius: 10, padding: 10, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 12 }}>{o.id}</span>
                  <span style={{ fontSize: 11, color: "#22c55e" }}>{o.status}</span>
                </div>
                <div style={{ fontSize: 11, color: "#888" }}>{o.restaurant} · {o.items}</div>
                <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>₹{o.total}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 360px"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
