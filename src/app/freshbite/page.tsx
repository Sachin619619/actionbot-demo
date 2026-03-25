"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// Menu data
const MENU_ITEMS = [
  { id: 1, name: "Margherita Pizza", desc: "Classic thin crust with fresh mozzarella, basil & tomato sauce", price: 299, emoji: "🍕", category: "pizza", tags: ["bestseller"], rating: 4.9, reviews: 234, prepTime: 15 },
  { id: 2, name: "Butter Chicken", desc: "Creamy tomato gravy with tender chicken, served with naan", price: 349, emoji: "🍗", category: "main", tags: ["bestseller"], rating: 4.8, reviews: 189, prepTime: 20 },
  { id: 3, name: "Caesar Salad Bowl", desc: "Crispy romaine, parmesan, croutons & creamy caesar dressing", price: 199, emoji: "🥗", category: "healthy", tags: ["healthy"], rating: 4.7, reviews: 92, prepTime: 8 },
  { id: 4, name: "Smash Burger", desc: "Double smashed patty, cheddar, pickles, special sauce", price: 249, emoji: "🍔", category: "burger", tags: ["new"], rating: 4.9, reviews: 156, prepTime: 12 },
  { id: 5, name: "Chicken Biryani", desc: "Hyderabadi dum biryani with raita and salan", price: 279, emoji: "🍚", category: "rice", tags: ["spicy"], rating: 4.8, reviews: 312, prepTime: 18 },
  { id: 6, name: "Tiramisu", desc: "Classic Italian dessert with espresso-soaked ladyfingers", price: 179, emoji: "🧁", category: "dessert", tags: ["dessert"], rating: 4.9, reviews: 87, prepTime: 5 },
  { id: 7, name: "Pepperoni Pizza", desc: "Loaded with pepperoni, mozzarella & spicy marinara", price: 349, emoji: "🍕", category: "pizza", tags: [], rating: 4.8, reviews: 198, prepTime: 15 },
  { id: 8, name: "Paneer Tikka", desc: "Grilled cottage cheese marinated in tandoori spices", price: 229, emoji: "🧀", category: "main", tags: ["vegetarian"], rating: 4.6, reviews: 143, prepTime: 15 },
  { id: 9, name: "Fish & Chips", desc: "Crispy beer-battered fish with golden fries & tartar", price: 329, emoji: "🐟", category: "main", tags: [], rating: 4.7, reviews: 112, prepTime: 18 },
  { id: 10, name: "Chocolate Lava Cake", desc: "Warm chocolate cake with molten center & vanilla ice cream", price: 199, emoji: "🍫", category: "dessert", tags: ["dessert"], rating: 4.9, reviews: 76, prepTime: 8 },
];

interface CartItem {
  item: typeof MENU_ITEMS[0];
  qty: number;
}

interface Order {
  id: string;
  items: CartItem[];
  status: "placed" | "confirmed" | "preparing" | "out-for-delivery" | "delivered";
  eta: number;
  total: number;
  points: number;
  createdAt: number;
}

interface ChatMessage {
  id: string;
  from: "user" | "bot" | "system";
  text: string;
  timestamp: number;
  typing?: boolean;
  orderId?: string;
  orderData?: Order;
}

const ORDER_STEPS = [
  { key: "placed", label: "Order Placed", emoji: "📋", time: "now" },
  { key: "confirmed", label: "Confirmed", emoji: "✅", time: "1 min" },
  { key: "preparing", label: "Preparing", emoji: "👨‍🍳", time: "5 min" },
  { key: "out-for-delivery", label: "On the way", emoji: "🛵", time: "12 min" },
  { key: "delivered", label: "Delivered", emoji: "✅", time: "18 min" },
];

export default function FreshBite() {
  const [activeTab, setActiveTab] = useState<"menu" | "orders" | "rewards">("menu");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showOrderTracker, setShowOrderTracker] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(847);
  const [notifications, setNotifications] = useState<{ id: string; text: string; type: string; time: number }[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "welcome", from: "bot", text: "👋 Welcome to FreshBite! I'm your AI ordering assistant.\n\nTry saying:\n• \"Order pizza\"\n• \"What's popular?\"\n• \"I want something healthy\"\n• \"Show my rewards\"", timestamp: Date.now() },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [notifPermission, setNotifPermission] = useState<"default" | "granted" | "denied">("default");
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [messageReactions, setMessageReactions] = useState<Record<string, string>>({});
  const msgIdRef = useRef(1);

  const categories = [
    { key: "all", label: "All" },
    { key: "pizza", label: "🍕 Pizza" },
    { key: "main", label: "🍖 Main" },
    { key: "healthy", label: "🥗 Healthy" },
    { key: "burger", label: "🍔 Burgers" },
    { key: "dessert", label: "🧁 Desserts" },
  ];

  const cartTotal = cart.reduce((sum, c) => sum + c.item.price * c.qty, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission as "default" | "granted" | "denied");
      if (Notification.permission === "default") {
        setTimeout(() => setShowNotifPrompt(true), 5000);
      }
    }
  }, []);

  // Simulate order progress
  useEffect(() => {
    if (!activeOrder) return;
    const stepKeys = ORDER_STEPS.map(s => s.key);
    const interval = setInterval(() => {
      setActiveOrder(prev => {
        if (!prev || prev.status === "delivered") {
          clearInterval(interval);
          return prev;
        }
        const currentIdx = stepKeys.indexOf(prev.status);
        if (currentIdx < stepKeys.length - 1) {
          const nextStatus = stepKeys[currentIdx + 1] as Order["status"];
          return { ...prev, status: nextStatus, eta: Math.max(0, prev.eta - 1) };
        }
        return prev;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [activeOrder]);

  const addToCart = (item: typeof MENU_ITEMS[0]) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) {
        return prev.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { item, qty: 1 }];
    });
    setNotifications(prev => [{
      id: `notif-${Date.now()}`,
      text: `Added ${item.name} to cart!`,
      type: "success",
      time: Date.now(),
    }, ...prev.slice(0, 4)]);
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === itemId);
      if (existing && existing.qty > 1) {
        return prev.map(c => c.item.id === itemId ? { ...c, qty: c.qty - 1 } : c);
      }
      return prev.filter(c => c.item.id !== itemId);
    });
  };

  const placeOrder = () => {
    if (cart.length === 0) return;
    const order: Order = {
      id: `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      items: [...cart],
      status: "placed",
      eta: 18,
      total: cartTotal,
      points: Math.floor(cartTotal / 10),
      createdAt: Date.now(),
    };
    setActiveOrder(order);
    setCart([]);
    setShowCart(false);
    setShowOrderTracker(true);
    setActiveTab("orders");
    setLoyaltyPoints(prev => prev + order.points);
    addNotification(`🎉 Order ${order.id} placed! +${order.points} reward points!`, "success");
  };

  const addNotification = (text: string, type: string) => {
    setNotifications(prev => [{ id: `notif-${Date.now()}`, text, type, time: Date.now() }, ...prev.slice(0, 4)]);
  };

  const requestNotifPermission = async () => {
    if (!("Notification" in window)) {
      alert("Notifications not supported in this browser.");
      return;
    }
    const result = await Notification.requestPermission();
    setNotifPermission(result as "default" | "granted" | "denied");
    setShowNotifPrompt(false);
    if (result === "granted") {
      new Notification("🔔 FreshBite Notifications Enabled!", {
        body: "You'll get real-time updates on your orders!",
        icon: "🍕",
      });
    }
  };

  // AI Chat logic
  const getChatResponse = (input: string): string | { action: string; data?: any } => {
    const lower = input.toLowerCase();
    
    if (lower.includes("order") || lower.includes("buy") || lower.includes("get")) {
      const matched = MENU_ITEMS.find(i => lower.includes(i.name.toLowerCase().split(" ")[0]) || lower.includes(i.category));
      if (matched) {
        addToCart(matched);
        return `Added ${matched.emoji} ${matched.name} (₹${matched.price}) to your cart! Would you like anything else?`;
      }
      return "What would you like to order? Try: 'order pizza', 'get burger', or 'I want biryani'";
    }
    
    if (lower.includes("cart") && (lower.includes("show") || lower.includes("view") || lower.includes("my"))) {
      if (cart.length === 0) return "🛒 Your cart is empty! What would you like to order?";
      const items = cart.map(c => `• ${c.item.emoji} ${c.item.name} x${c.qty} = ₹${c.item.price * c.qty}`).join("\n");
      return `🛒 Your Cart (${cartCount} items, ₹${cartTotal}):\n${items}\n\nSay 'checkout' to place your order!`;
    }
    
    if (lower.includes("checkout") || lower.includes("place order") || lower.includes("confirm order")) {
      if (cart.length === 0) return "🛒 Your cart is empty! Add some items first.";
      return "CHECKOUT";
    }
    
    if (lower.includes("popular") || lower.includes("bestseller") || lower.includes("best")) {
      const popular = MENU_ITEMS.filter(i => i.tags.includes("bestseller"));
      return "🔥 Our bestsellers:\n" + popular.map(i => `• ${i.emoji} ${i.name} — ₹${i.price} (⭐${i.rating})`).join("\n");
    }
    
    if (lower.includes("healthy") || lower.includes("light") || lower.includes("salad")) {
      const healthy = MENU_ITEMS.filter(i => i.tags.includes("healthy"));
      return "🥗 Healthy options:\n" + healthy.map(i => `• ${i.emoji} ${i.name} — ₹${i.price} (⭐${i.rating})`).join("\n");
    }
    
    if (lower.includes("reward") || lower.includes("point") || lower.includes("loyalty")) {
      return `⭐ You have ${loyaltyPoints} reward points!\n\nThat's worth about ₹${Math.floor(loyaltyPoints / 10)} in savings.\nEarn 1 point per ₹10 spent!`;
    }
    
    if (lower.includes("track") || lower.includes("where") || lower.includes("order status")) {
      if (!activeOrder) return "📦 No active orders. Place one first!";
      const step = ORDER_STEPS.find(s => s.key === activeOrder.status);
      return `📍 Order ${activeOrder.id}:\n${step?.emoji} ${step?.label}\n⏱️ ETA: ${activeOrder.eta} min\n\nSay 'track' anytime to check status!`;
    }
    
    if (lower.includes("menu") || lower.includes("show") || lower.includes("what")) {
      const items = MENU_ITEMS.slice(0, 5).map(i => `• ${i.emoji} ${i.name} — ₹${i.price}`).join("\n");
      return `📋 Menu highlights:\n${items}\n\nSay 'order [item]' to add to cart!`;
    }
    
    if (lower.includes("remove") || lower.includes("delete") || lower.includes("cancel")) {
      if (cart.length === 0) return "🛒 Cart is already empty!";
      return "Say 'remove [item name]' to delete a specific item from your cart.";
    }
    
    if (lower.includes("total") || lower.includes("price") || lower.includes("cost")) {
      if (cart.length === 0) return "🛒 Cart is empty — ₹0 total";
      return `💰 Cart total: ₹${cartTotal} (${cartCount} items)\nYou'll earn ${Math.floor(cartTotal / 10)} reward points!`;
    }
    
    return "🤖 I can help you order food! Try:\n• \"Order pizza\"\n• \"Show popular items\"\n• \"What's my rewards?\"\n• \"Track my order\"\n• \"Show my cart\"";
  };

  const toggleVoice = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice input not supported in this browser. Try Chrome!");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }
    
    setIsListening(true);
    recognition.start();
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
      setIsListening(false);
      setTimeout(() => handleChatSend(transcript), 300);
    };
    
    recognition.onerror = () => {
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
  }, [isListening]); // eslint-disable-line

  const handleChatSend = useCallback((input: string) => {
    const text = input.trim();
    if (!text) return;
    
    const userMsg: ChatMessage = { id: `msg-${msgIdRef.current++}`, from: "user", text, timestamp: Date.now() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    const response = getChatResponse(text);
    
    setTimeout(() => {
      setIsTyping(false);
      
      if (response === "CHECKOUT") {
        const botMsg: ChatMessage = { id: `msg-${msgIdRef.current++}`, from: "bot", text: "🛒 Order summary:\n" + cart.map(c => `• ${c.item.emoji} ${c.item.name} x${c.qty} = ₹${c.item.price * c.qty}`).join("\n") + `\n\n💰 Total: ₹${cartTotal}\n\nPlacing order now...`, timestamp: Date.now() };
        setChatMessages(prev => [...prev, botMsg]);
        setTimeout(() => {
          placeOrder();
          const confirmMsg: ChatMessage = { id: `msg-${msgIdRef.current++}`, from: "bot", text: `✅ Order placed! 🎉\n\nOrder ID: ${activeOrder?.id || "PROCESSING"}\nYou'll earn ${Math.floor(cartTotal / 10)} reward points!\n\nSay 'track' to monitor your delivery.`, timestamp: Date.now() };
          setChatMessages(prev => [...prev, confirmMsg]);
        }, 1200);
      } else {
        const botMsg: ChatMessage = { id: `msg-${msgIdRef.current++}`, from: "bot", text: response as string, timestamp: Date.now() };
        setChatMessages(prev => [...prev, botMsg]);
      }
    }, 800);
  }, [cart, cartTotal, cartCount, activeOrder]);

  const filteredItems = selectedCategory === "all" 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(i => i.category === selectedCategory);

  const currentStepIdx = activeOrder ? ORDER_STEPS.findIndex(s => s.key === activeOrder.status) : -1;

  return (
    <div style={{ minHeight: "100vh", background: "#fafaf7", fontFamily: "system-ui, sans-serif" }}>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes pop { 0% { transform: scale(0); } 70% { transform: scale(1.1); } 100% { transform: scale(1); } }
        @keyframes notifSlide { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .typing-dot { animation: pulse 1.2s ease-in-out infinite; }
        .notif-item { animation: notifSlide 0.3s ease; }
        .pop-in { animation: pop 0.3s ease; }
      `}</style>

      {/* Live Activity Banner */}
      {activeOrder && activeOrder.status !== "delivered" && (
        <div style={{
          background: "linear-gradient(135deg, #1a1a1a, #2d2d2d)",
          color: "white",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          animation: "slideUp 0.4s ease",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
            backgroundSize: "200% 100%",
            animation: "shimmer 3s linear infinite",
          }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, position: "relative" }}>
            <span style={{ fontSize: "1.3rem", animation: "livePulse 2s ease-in-out infinite" }}>
              {ORDER_STEPS.find(s => s.key === activeOrder.status)?.emoji}
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.8rem" }}>
                {ORDER_STEPS.find(s => s.key === activeOrder.status)?.label} — {activeOrder.eta}m min
              </div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>
                {activeOrder.id} · {activeOrder.items.length} items · ₹{activeOrder.total}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, position: "relative" }}>
            {ORDER_STEPS.map((step, idx) => (
              <div key={step.key} style={{
                width: 8, height: 8, borderRadius: "50%",
                background: idx <= currentStepIdx ? "#22c55e" : "rgba(255,255,255,0.15)",
                transition: "background 0.3s",
              }} />
            ))}
          </div>
          <button
            onClick={() => { setActiveTab("orders"); setShowOrderTracker(true); }}
            style={{
              background: "#e85d04",
              border: "none",
              borderRadius: 8,
              padding: "5px 12px",
              color: "white",
              fontWeight: 700,
              fontSize: "0.75rem",
              cursor: "pointer",
              position: "relative",
            }}
          >
            Track
          </button>
        </div>
      )}

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        padding: "12px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 24 }}>🍕</span>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px" }}>Fresh<span style={{ color: "#e85d04" }}>Bite</span></span>
          {notifPermission === "granted" && (
            <span style={{ fontSize: "0.7rem", background: "#22c55e", color: "white", padding: "2px 8px", borderRadius: 100, fontWeight: 600 }}>🔔</span>
          )}
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Notifications */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: "rgba(0,0,0,0.05)",
                border: "none",
                borderRadius: 12,
                padding: "8px 10px",
                cursor: "pointer",
                fontSize: "1.2rem",
                position: "relative",
              }}
            >
              🔔
              {notifications.length > 0 && (
                <span style={{
                  position: "absolute", top: 2, right: 2,
                  width: 16, height: 16, borderRadius: "50%",
                  background: "#e85d04",
                  color: "white",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {notifications.length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div style={{
                position: "absolute", top: "100%", right: 0, marginTop: 8,
                background: "white",
                borderRadius: 16,
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                border: "1px solid rgba(0,0,0,0.06)",
                minWidth: 300,
                overflow: "hidden",
                animation: "slideUp 0.2s ease",
                zIndex: 100,
              }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(0,0,0,0.06)", fontWeight: 700, fontSize: "0.9rem" }}>
                  Notifications 🔔
                </div>
                {notifications.length === 0 ? (
                  <p style={{ padding: 16, color: "#888", fontSize: "0.85rem", textAlign: "center" }}>No notifications yet</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="notif-item" style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid rgba(0,0,0,0.04)",
                      fontSize: "0.82rem",
                      color: "#333",
                      display: "flex", gap: 8, alignItems: "flex-start",
                    }}>
                      <span>{n.type === "success" ? "✅" : "🔔"}</span>
                      <span>{n.text}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <button
            onClick={() => setShowCart(true)}
            style={{
              background: cartCount > 0 ? "#e85d04" : "rgba(0,0,0,0.05)",
              border: "none",
              borderRadius: 12,
              padding: "8px 14px",
              color: cartCount > 0 ? "white" : "#333",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.2s",
            }}
          >
            🛒 {cartCount > 0 && <span style={{ background: "white", color: "#e85d04", borderRadius: 100, padding: "0 6px", fontSize: "0.7rem" }}>{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: 4,
        padding: "12px 16px",
        background: "white",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        overflowX: "auto",
      }}>
        {[
          { key: "menu", label: "🍽️ Menu" },
          { key: "orders", label: "📦 Orders" },
          { key: "rewards", label: "⭐ Rewards" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            style={{
              background: activeTab === tab.key ? "#1a1a1a" : "transparent",
              color: activeTab === tab.key ? "white" : "#666",
              border: "none",
              borderRadius: 100,
              padding: "8px 20px",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px 100px" }}>
        {/* MENU TAB */}
        {activeTab === "menu" && (
          <>
            {/* Categories */}
            <div style={{ display: "flex", gap: 8, padding: "16px 0", overflowX: "auto" }}>
              {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  style={{
                    background: selectedCategory === cat.key ? "#1a1a1a" : "white",
                    color: selectedCategory === cat.key ? "white" : "#666",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 100,
                    padding: "8px 16px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s",
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Quick Order Combos */}
            {selectedCategory === "all" && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <h3 style={{ fontWeight: 700, fontSize: "0.9rem" }}>⚡ Quick Combos</h3>
                  <span style={{ fontSize: "0.75rem", color: "#888" }}>Save up to 15%</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                  {[
                    { id: "combo1", name: "Burger Combo", desc: "Smash Burger + Fries + Coke", price: 349, original: 399, emoji: "🍔", savings: 50, items: ["Smash Burger", "Fries", "Coke"] },
                    { id: "combo2", name: "Pizza Deal", desc: "Pepperoni Pizza + Garlic Bread + Coke", price: 449, original: 529, emoji: "🍕", savings: 80, items: ["Pepperoni Pizza", "Garlic Bread", "Coke"] },
                    { id: "combo3", name: "Healthy Bowl", desc: "Caesar Salad + Berry Smoothie", price: 329, original: 398, emoji: "🥗", savings: 69, items: ["Caesar Salad Bowl", "Berry Smoothie Bowl"] },
                  ].map(combo => {
                    const comboItems = MENU_ITEMS.filter(mi => combo.items.includes(mi.name));
                    return (
                      <div key={combo.id} style={{
                        background: "linear-gradient(135deg, #fff8f0, #fff)",
                        border: "1px solid rgba(232,93,4,0.15)",
                        borderRadius: 14,
                        padding: 14,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        position: "relative",
                        overflow: "hidden",
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 20px rgba(232,93,4,0.12)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
                        onClick={() => comboItems.forEach(item => addToCart(item))}
                      >
                        <div style={{ position: "absolute", top: 8, right: 8, background: "#22c55e", color: "white", fontSize: "0.65rem", fontWeight: 700, padding: "2px 6px", borderRadius: 100 }}>SAVE ₹{combo.savings}</div>
                        <span style={{ fontSize: "1.5rem", display: "block", marginBottom: 6 }}>{combo.emoji}</span>
                        <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: 2 }}>{combo.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "#888", marginBottom: 8 }}>{combo.desc}</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div>
                            <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#e85d04" }}>₹{combo.price}</span>
                            <span style={{ fontSize: "0.72rem", color: "#aaa", textDecoration: "line-through", marginLeft: 6 }}>₹{combo.original}</span>
                          </div>
                          <button style={{ background: "#e85d04", border: "none", borderRadius: 8, padding: "4px 12px", color: "white", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}>Add</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Menu Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, paddingBottom: 20 }}>
              {filteredItems.map(item => (
                <div key={item.id} className="pop-in" style={{
                  background: "white",
                  borderRadius: 16,
                  overflow: "hidden",
                  border: "1px solid rgba(0,0,0,0.06)",
                  transition: "all 0.2s",
                  cursor: "pointer",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
                >
                  <div style={{
                    height: 140,
                    background: `linear-gradient(135deg, #fff8f0, #fff3e6)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 56,
                    position: "relative",
                  }}>
                    {item.emoji}
                    {item.tags.map(tag => (
                      <span key={tag} style={{
                        position: "absolute", top: 8, left: 8,
                        background: tag === "bestseller" ? "#e85d04" : tag === "new" ? "#22c55e" : tag === "healthy" ? "#10b981" : tag === "spicy" ? "#ef4444" : "rgba(0,0,0,0.6)",
                        color: "white",
                        padding: "3px 8px",
                        borderRadius: 100,
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div style={{ padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 4 }}>{item.name}</h3>
                      <span style={{ fontSize: "0.7rem", color: "#888" }}>⭐ {item.rating}</span>
                    </div>
                    <p style={{ fontSize: "0.78rem", color: "#888", marginBottom: 10, lineHeight: 1.4 }}>{item.desc}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#e85d04" }}>₹{item.price}</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ fontSize: "0.7rem", color: "#aaa" }}>⏱️ {item.prepTime}m</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                          style={{
                            background: "#e85d04",
                            border: "none",
                            borderRadius: 8,
                            padding: "6px 14px",
                            color: "white",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            cursor: "pointer",
                          }}
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div style={{ paddingTop: 24 }}>
            {activeOrder ? (
              <div style={{
                background: "white",
                borderRadius: 20,
                overflow: "hidden",
                border: "1px solid rgba(0,0,0,0.06)",
                animation: "slideUp 0.3s ease",
              }}>
                <div style={{ padding: "20px", background: "linear-gradient(135deg, #1a1a1a, #2d2d2d)", color: "white" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: "1rem" }}>Order {activeOrder.id}</span>
                    <span style={{ background: "#22c55e", padding: "4px 12px", borderRadius: 100, fontSize: "0.75rem", fontWeight: 700 }}>
                      {ORDER_STEPS.find(s => s.key === activeOrder.status)?.emoji} {ORDER_STEPS.find(s => s.key === activeOrder.status)?.label}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
                    {activeOrder.items.map(i => `${i.item.emoji} ${i.item.name} x${i.qty}`).join(" • ")}
                  </div>
                </div>

                {/* Progress Steps */}
                <div style={{ padding: "24px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    {ORDER_STEPS.map((step, idx) => (
                      <div key={step.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative" }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: "50%",
                          background: idx <= currentStepIdx ? "#22c55e" : "rgba(0,0,0,0.06)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "1rem",
                          transition: "all 0.3s",
                          transform: idx === currentStepIdx ? "scale(1.1)" : "scale(1)",
                        }}>
                          {step.emoji}
                        </div>
                        <span style={{ fontSize: "0.6rem", color: idx <= currentStepIdx ? "#333" : "#aaa", fontWeight: 600, marginTop: 6, textAlign: "center" }}>{step.label}</span>
                        {idx < ORDER_STEPS.length - 1 && (
                          <div style={{
                            position: "absolute",
                            top: 18,
                            left: "50%",
                            width: "100%",
                            height: 2,
                            background: idx < currentStepIdx ? "#22c55e" : "rgba(0,0,0,0.06)",
                            zIndex: -1,
                          }} />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div style={{
                    marginTop: 24,
                    background: "rgba(232,93,4,0.06)",
                    border: "1px solid rgba(232,93,4,0.12)",
                    borderRadius: 12,
                    padding: 16,
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: "2rem", fontWeight: 800, color: "#e85d04" }}>⏱️ {activeOrder.eta} min</div>
                    <div style={{ fontSize: "0.8rem", color: "#888", marginTop: 4 }}>Estimated delivery time</div>
                  </div>

                  {/* Delivery simulation - shown when out for delivery */}
                  {activeOrder.status === "out-for-delivery" && (
                    <div style={{
                      marginTop: 16,
                      background: "rgba(0,0,0,0.03)",
                      border: "1px solid rgba(0,0,0,0.06)",
                      borderRadius: 12,
                      padding: 14,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.82rem" }}>🛵 Partner nearby!</div>
                          <div style={{ fontSize: "0.72rem", color: "#888" }}>Rajesh K. · ⭐ 4.9 · 127 deliveries</div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button style={{ background: "#22c55e", border: "none", borderRadius: 8, width: 34, height: 34, color: "white", cursor: "pointer", fontSize: "1rem" }}>📞</button>
                          <button style={{ background: "#3b82f6", border: "none", borderRadius: 8, width: 34, height: 34, color: "white", cursor: "pointer", fontSize: "1rem" }}>💬</button>
                        </div>
                      </div>
                      {/* Mini map simulation */}
                      <div style={{ position: "relative", height: 60, background: "rgba(0,0,0,0.04)", borderRadius: 8, overflow: "hidden" }}>
                        <div style={{ position: "absolute", left: "5%", top: "50%", transform: "translateY(-50%)", fontSize: "1.2rem" }}>🏪</div>
                        <div style={{ position: "absolute", right: "5%", top: "50%", transform: "translateY(-50%)", fontSize: "1.2rem" }}>🏠</div>
                        <div style={{ 
                          position: "absolute", 
                          left: `${Math.max(10, Math.min(85, 100 - activeOrder.eta * 4))}%`,
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: "1.3rem",
                          animation: "bikeMove 2s ease-in-out infinite",
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                        }}>🛵</div>
                        <div style={{ 
                          position: "absolute", 
                          left: `${Math.max(10, Math.min(85, 100 - activeOrder.eta * 4 - 8))}%`,
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                          fontSize: "0.8rem",
                          color: "#666",
                          fontWeight: 700,
                        }}>{activeOrder.eta}m away</div>
                      </div>
                      <style>{`
                        @keyframes bikeMove { 0%, 100% { transform: translateY(-50%) rotate(-3deg); } 50% { transform: translateY(-50%) rotate(3deg); } }
                      `}</style>
                    </div>
                  )}

                  <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                    <span style={{ color: "#888" }}>Total paid</span>
                    <span style={{ fontWeight: 700 }}>₹{activeOrder.total}</span>
                  </div>
                  <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                    <span style={{ color: "#888" }}>Points earned</span>
                    <span style={{ fontWeight: 700, color: "#e85d04" }}>+{activeOrder.points} ⭐</span>
                  </div>

                  {/* Social Share */}
                  <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                    <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🍕 Just ordered from FreshBite! My order ${activeOrder.id} is on the way! Total: ₹${activeOrder.total} #FoodDelivery`)}`, "_blank")} style={{ flex: 1, background: "#1DA1F2", border: "none", borderRadius: 10, padding: "10px", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>🐦 Share</button>
                    <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`🍕 FreshBite order ${activeOrder.id} incoming! Total: ₹${activeOrder.total}. Track live: https://freshbite.app/track/${activeOrder.id}`)}`, "_blank")} style={{ flex: 1, background: "#25D366", border: "none", borderRadius: 10, padding: "10px", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>📱 WhatsApp</button>
                    <button onClick={() => { navigator.clipboard.writeText(`FreshBite Order ${activeOrder.id} — ₹${activeOrder.total} — Track: https://freshbite.app/track/${activeOrder.id}`).catch(() => {}); }} style={{ flex: 1, background: "#f5f5f0", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10, padding: "10px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>📋 Copy</button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", paddingTop: 60 }}>
                <span style={{ fontSize: 64, display: "block", marginBottom: 16 }}>📦</span>
                <h2 style={{ fontWeight: 700, marginBottom: 8 }}>No active orders</h2>
                <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: 24 }}>Your order history will appear here</p>
                <button
                  onClick={() => setActiveTab("menu")}
                  style={{
                    background: "#e85d04",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    padding: "12px 28px",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                  }}
                >
                  Browse Menu 🍕
                </button>
              </div>
            )}
          </div>
        )}

        {/* REWARDS TAB */}
        {activeTab === "rewards" && (
          <div style={{ paddingTop: 24 }}>
            <div style={{
              background: "linear-gradient(135deg, #1a1a1a, #2d2d2d)",
              borderRadius: 20,
              padding: 28,
              color: "white",
              textAlign: "center",
              marginBottom: 24,
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(232,93,4,0.15)" }} />
              <span style={{ fontSize: 48, display: "block", marginBottom: 8 }}>⭐</span>
              <div style={{ fontSize: "3rem", fontWeight: 800, lineHeight: 1 }}>{loyaltyPoints}</div>
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginTop: 8 }}>Reward Points</div>
              <div style={{ marginTop: 12, background: "rgba(255,255,255,0.1)", borderRadius: 100, padding: "6px 16px", display: "inline-block", fontSize: "0.8rem" }}>
                Worth ₹{Math.floor(loyaltyPoints / 10)} in savings
              </div>
            </div>

            {/* Progress to next reward */}
            <div style={{
              background: "white",
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              border: "1px solid rgba(0,0,0,0.06)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 10 }}>
                <span style={{ fontWeight: 600 }}>🎁 Free Margherita Pizza</span>
                <span style={{ color: "#888" }}>{loyaltyPoints % 500}/500 pts</span>
              </div>
              <div style={{ height: 8, background: "rgba(0,0,0,0.06)", borderRadius: 100, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(loyaltyPoints % 500) / 5}%`, background: "linear-gradient(90deg, #e85d04, #ff8c42)", borderRadius: 100, transition: "width 0.5s ease" }} />
              </div>
            </div>

            <div style={{
              background: "white",
              borderRadius: 16,
              padding: 20,
              border: "1px solid rgba(0,0,0,0.06)",
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: "0.95rem" }}>🏆 Rewards History</h3>
              {[
                { date: "Mar 20", desc: "Order bonus", points: 35, emoji: "📦" },
                { date: "Mar 15", desc: "First order reward", points: 100, emoji: "🎁" },
                { date: "Mar 10", desc: "Order bonus", points: 28, emoji: "📦" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                  <span style={{ fontSize: "1.3rem" }}>{r.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{r.desc}</div>
                    <div style={{ fontSize: "0.75rem", color: "#888" }}>{r.date}</div>
                  </div>
                  <span style={{ fontWeight: 700, color: "#22c55e", fontSize: "0.85rem" }}>+{r.points}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChat(true)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #e85d04, #ff8c42)",
          border: "none",
          color: "white",
          fontSize: "1.5rem",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(232,93,4,0.4)",
          zIndex: 40,
          transition: "transform 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        💬
      </button>

      {/* Push Notification Permission Banner */}
      {showNotifPrompt && notifPermission === "default" && (
        <div style={{
          position: "fixed",
          bottom: 100,
          left: 16,
          right: 16,
          maxWidth: 360,
          margin: "0 auto",
          background: "white",
          borderRadius: 16,
          padding: "14px 16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          border: "1px solid rgba(0,0,0,0.06)",
          zIndex: 60,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          animation: "slideUp 0.4s ease",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ fontSize: "1.5rem" }}>🔔</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: 2 }}>Enable Notifications</div>
              <div style={{ fontSize: "0.75rem", color: "#666", lineHeight: 1.4 }}>Get real-time order updates, exclusive deals & delivery alerts!</div>
            </div>
            <button onClick={() => setShowNotifPrompt(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "1rem" }}>✕</button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setShowNotifPrompt(false)}
              style={{ flex: 1, background: "rgba(0,0,0,0.05)", border: "none", borderRadius: 8, padding: "8px", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", color: "#666" }}
            >
              Not now
            </button>
            <button
              onClick={requestNotifPermission}
              style={{ flex: 1, background: "#e85d04", border: "none", borderRadius: 8, padding: "8px", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", color: "white" }}
            >
              Enable 🔔
            </button>
          </div>
        </div>
      )}

      {/* Chat Panel */}
      {showChat && (
        <div style={{
          position: "fixed",
          bottom: 100,
          right: 24,
          width: 380,
          maxHeight: 560,
          background: "white",
          borderRadius: 20,
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
          border: "1px solid rgba(0,0,0,0.06)",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          animation: "slideUp 0.3s ease",
          overflow: "hidden",
        }}>
          {/* Chat Header */}
          <div style={{
            padding: "14px 16px",
            background: "linear-gradient(135deg, #e85d04, #ff8c42)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>🤖</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>FreshBite Assistant</div>
                <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>AI-powered ordering</div>
              </div>
            </div>
            <button
              onClick={() => setShowChat(false)}
              style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "1.2rem" }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            minHeight: 300,
            maxHeight: 360,
          }}>
            {chatMessages.map(msg => (
              <div key={msg.id} style={{
                display: "flex",
                flexDirection: "column",
                alignItems: msg.from === "user" ? "flex-end" : "flex-start",
                animation: msg.from === "bot" ? "slideIn 0.3s ease" : "none",
              }}>
                <div style={{
                  maxWidth: "85%",
                  background: msg.from === "user" ? "linear-gradient(135deg, #e85d04, #ff8c42)" : "rgba(0,0,0,0.05)",
                  color: msg.from === "user" ? "white" : "#333",
                  borderRadius: msg.from === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  padding: "10px 14px",
                  fontSize: "0.82rem",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                }}>
                  {/* Reaction buttons */}
                  <div style={{ display: "flex", gap: 4, marginTop: 4, marginLeft: 4 }}>
                    {["👍", "❤️", "😂"].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setMessageReactions(prev => ({ ...prev, [msg.id]: emoji }))}
                        style={{
                          background: messageReactions[msg.id] === emoji ? "rgba(232,93,4,0.1)" : "transparent",
                          border: `1px solid ${messageReactions[msg.id] === emoji ? "#e85d04" : "rgba(0,0,0,0.1)"}`,
                          borderRadius: 100,
                          padding: "2px 8px",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          transition: "all 0.2s",
                        }}
                      >
                        {messageReactions[msg.id] === emoji ? messageReactions[msg.id] : emoji}
                      </button>
                    ))}
                  </div>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <div style={{
                  background: "rgba(0,0,0,0.05)",
                  borderRadius: "16px 16px 16px 4px",
                  padding: "10px 14px",
                  display: "flex",
                  gap: 4,
                }}>
                  <span className="typing-dot" style={{ fontSize: "1.2rem", color: "#e85d04" }}>●</span>
                  <span className="typing-dot" style={{ fontSize: "1.2rem", color: "#e85d04", animationDelay: "0.2s" }}>●</span>
                  <span className="typing-dot" style={{ fontSize: "1.2rem", color: "#e85d04", animationDelay: "0.4s" }}>●</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div style={{
            padding: 12,
            borderTop: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            gap: 8,
          }}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleChatSend(chatInput); }}
              placeholder="Try: 'order pizza' or 'what's popular?'"
              style={{
                flex: 1,
                background: "rgba(0,0,0,0.04)",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 12,
                padding: "10px 14px",
                fontSize: "0.82rem",
                outline: "none",
              }}
            />
            <button
              onClick={toggleVoice}
              title="Voice input"
              style={{
                background: isListening ? "#ef4444" : "rgba(0,0,0,0.08)",
                border: "none",
                borderRadius: 12,
                width: 40,
                height: 40,
                color: isListening ? "white" : "#888",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                animation: isListening ? "pulse 1s infinite" : "none",
              }}
            >
              {isListening ? "🔴" : "🎤"}
            </button>
            <button
              onClick={() => handleChatSend(chatInput)}
              style={{
                background: "#e85d04",
                border: "none",
                borderRadius: 12,
                width: 40,
                height: 40,
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 60,
          display: "flex", justifyContent: "flex-end",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} onClick={() => setShowCart(false)} />
          <div style={{
            width: 380,
            height: "100%",
            background: "white",
            animation: "slideIn 0.3s ease",
            display: "flex",
            flexDirection: "column",
          }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>🛒 Your Cart ({cartCount})</div>
              <button onClick={() => setShowCart(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>
            
            <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", paddingTop: 60 }}>
                  <span style={{ fontSize: 48, display: "block", marginBottom: 12 }}>🛒</span>
                  <p style={{ color: "#888", fontSize: "0.9rem" }}>Your cart is empty</p>
                </div>
              ) : (
                cart.map(c => (
                  <div key={c.item.id} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                    <span style={{ fontSize: "1.5rem" }}>{c.item.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>{c.item.name}</div>
                      <div style={{ color: "#888", fontSize: "0.78rem" }}>₹{c.item.price} × {c.qty}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button
                        onClick={() => removeFromCart(c.item.id)}
                        style={{ background: "rgba(0,0,0,0.06)", border: "none", borderRadius: 6, width: 26, height: 26, cursor: "pointer", fontWeight: 700 }}
                      >
                        −
                      </button>
                      <span style={{ fontWeight: 700, minWidth: 20, textAlign: "center" }}>{c.qty}</span>
                      <button
                        onClick={() => addToCart(c.item)}
                        style={{ background: "rgba(0,0,0,0.06)", border: "none", borderRadius: 6, width: 26, height: 26, cursor: "pointer", fontWeight: 700 }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ padding: 16, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: "#888", fontSize: "0.85rem" }}>Subtotal</span>
                  <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>₹{cartTotal}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ color: "#888", fontSize: "0.85rem" }}>Reward points earned</span>
                  <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#e85d04" }}>+{Math.floor(cartTotal / 10)} ⭐</span>
                </div>
                <button
                  onClick={placeOrder}
                  style={{
                    width: "100%",
                    background: "#e85d04",
                    color: "white",
                    border: "none",
                    borderRadius: 14,
                    padding: "14px",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    cursor: "pointer",
                  }}
                >
                  Place Order — ₹{cartTotal}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
