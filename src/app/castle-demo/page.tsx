"use client";
import { useState } from "react";

const properties = [
  { id: 1, name: "Castle Heights PG", location: "Indiranagar, Bangalore", price: 8500, gender: "Any", type: "PG", rating: 4.7, reviews: 48, image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80", amenities: ["WiFi", "AC", "Meals", "Laundry", "Power Backup"], rooms: 12, available: 3, distance: "0.8 km from office" },
  { id: 2, name: "Royal Residency", location: "Koramangala, Bangalore", price: 12000, gender: "Male", type: "Flat", rating: 4.9, reviews: 32, image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80", amenities: ["WiFi", "AC", "Kitchen", "Parking", "Security"], rooms: 6, available: 2, distance: "1.2 km from office" },
  { id: 3, name: "Castle Lite", location: "HSR Layout, Bangalore", price: 6500, gender: "Female", type: "PG", rating: 4.5, reviews: 56, image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80", amenities: ["WiFi", "AC", "Meals", "Cleaning"], rooms: 20, available: 5, distance: "2.1 km from office" },
  { id: 4, name: "Fortress Apartments", location: "Whitefield, Bangalore", price: 15000, gender: "Any", type: "Flat", rating: 4.8, reviews: 24, image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80", amenities: ["WiFi", "AC", "Kitchen", "Gym", "Pool", "Security"], rooms: 8, available: 1, distance: "3.5 km from office" },
  { id: 5, name: "Castle Basic PG", location: "Marathahalli, Bangalore", price: 5500, gender: "Male", type: "PG", rating: 4.2, reviews: 89, image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&q=80", amenities: ["WiFi", "Meals"], rooms: 30, available: 8, distance: "4.0 km from office" },
];

const conversations = [
  { role: "bot", text: "Hi! I'm your Castle Living assistant 🏰 Looking for a PG or flat near your office?" },
  { role: "user", text: "Yes, under 10000 with AC" },
  { role: "bot", text: "Found 3 options with AC under ₹10,000! Which area do you prefer?" },
  { role: "user", text: "Indiranagar" },
  { role: "bot", text: "🏰 Castle Heights PG — ₹8,500/month with AC, WiFi, meals included! Want me to schedule a visit?" },
];

export default function CastleDemo() {
  const [search, setSearch] = useState("");
  const [budget, setBudget] = useState(15000);
  const [gender, setGender] = useState("Any");
  const [selected, setSelected] = useState<typeof properties[0] | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState(conversations);
  const [chatInput, setChatInput] = useState("");
  const [scheduleModal, setScheduleModal] = useState(false);
  const [saved, setSaved] = useState<number[]>([]);
  const [booked, setBooked] = useState<number[]>([]);

  const filtered = properties.filter(p =>
    p.price <= budget &&
    (gender === "Any" || p.gender === "Any" || p.gender === gender) &&
    (search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase()))
  );

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const newMessages = [...chatMessages, { role: "user" as const, text }];
    setChatMessages(newMessages);
    setChatInput("");
    
    setTimeout(() => {
      const lower = text.toLowerCase();
      let response = "I'm still learning! Try asking about budget, location, or amenities. 🏰";
      
      if (lower.includes("visit") || lower.includes("schedule") || lower.includes("see")) {
        response = "Great! I can schedule a visit. What date and time works for you? 📅";
      } else if (lower.includes("budget") || lower.includes("price") || lower.includes("cost")) {
        response = `The average PG in Bangalore costs ₹7,000-12,000/month. Flats start at ₹12,000. What's your budget range? 💰`;
      } else if (lower.includes("ac") || lower.includes("air") || lower.includes("cool")) {
        response = "AC rooms typically cost ₹2,000-5,000 extra per month. Want me to filter for AC properties? ❄️";
      } else if (lower.includes("food") || lower.includes("meal") || lower.includes("eat")) {
        response = "Most PGs include breakfast and dinner. Some also have lunch. Castle Heights PG includes all 3 meals! 🍽️";
      } else if (lower.includes("location") || lower.includes("area") || lower.includes("near")) {
        response = "Popular areas near offices: Indiranagar (trendy, ₹8-12K), Koramangala (vibrant, ₹10-15K), HSR (budget-friendly, ₹6-10K). Which do you prefer? 📍";
      } else if (lower.includes("deposit") || lower.includes("advance")) {
        response = "Most PGs require 1-2 months deposit + 1 month rent advance. Castle Lite offers 0 deposit option! 💵";
      } else if (lower.includes("thank")) {
        response = "You're welcome! Let me know if you need anything else. Happy house hunting! 🏰✨";
      }
      
      setChatMessages(prev => [...prev, { role: "bot" as const, text: response }]);
    }, 800 + Math.random() * 400);
  };

  const toggleSave = (id: number) => {
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBook = (id: number) => {
    setBooked(prev => [...prev, id]);
    setSelected(null);
    setScheduleModal(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f6f0", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1B1C15 0%, #2d2d1f 100%)", color: "white", padding: "24px 24px 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>🏰</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20 }}>Castle Living</div>
              <div style={{ fontSize: 12, opacity: 0.6 }}>AI-Powered PG & Flat Finder</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button onClick={() => setShowChat(!showChat)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "8px 16px", color: "white", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                💬 AI Chat
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div style={{ display: "flex", gap: 10, paddingBottom: 20 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or area..." style={{ flex: 1, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 14, outline: "none" }} />
            <select value={gender} onChange={e => setGender(e.target.value)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 14, outline: "none" }}>
              <option style={{ color: "black" }}>Any</option>
              <option style={{ color: "black" }}>Male</option>
              <option style={{ color: "black" }}>Female</option>
            </select>
            <select value={budget} onChange={e => setBudget(Number(e.target.value))} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 14, outline: "none" }}>
              {[5000, 8000, 10000, 12000, 15000, 20000].map(b => <option key={b} style={{ color: "black" }}>{b}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: showChat ? "1fr 380px" : "1fr", gap: 24, transition: "all 0.3s" }}>
        {/* Properties */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800 }}>{filtered.length} Properties Found 🏠</h2>
            <span style={{ fontSize: 12, color: "#888" }}>Budget: up to ₹{budget.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filtered.map(p => (
              <div key={p.id} style={{ background: "white", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(0,0,0,0.06)", transition: "all 0.2s" }}>
                <div style={{ display: "flex", gap: 0 }}>
                  <div style={{ width: 200, height: 150, backgroundImage: `url(${p.image})`, backgroundSize: "cover", backgroundPosition: "center", flexShrink: 0, position: "relative" }}>
                    <div style={{ position: "absolute", top: 10, left: 10, background: "#1B1C15", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>{p.type}</div>
                    {booked.includes(p.id) && <div style={{ position: "absolute", top: 10, right: 10, background: "#22c55e", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>✓ Booked</div>}
                  </div>
                  <div style={{ padding: 16, flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{p.name}</div>
                        <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>📍 {p.location} · {p.distance}</div>
                        <div style={{ fontSize: 12, color: "#888" }}>👤 {p.gender === "Any" ? "Any Gender" : p.gender + " only"} · {p.available} of {p.rooms} rooms available</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 800, fontSize: 20, color: "#e85d04" }}>₹{p.price.toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>/month</div>
                        <div style={{ fontSize: 12, marginTop: 4 }}>⭐ {p.rating} ({p.reviews})</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                      {p.amenities.map(a => <span key={a} style={{ background: "#f5f5f0", fontSize: 11, padding: "3px 10px", borderRadius: 100, color: "#666" }}>{a}</span>)}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button onClick={() => setSelected(p)} style={{ background: "#1B1C15", border: "none", borderRadius: 10, padding: "8px 18px", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>View Details →</button>
                      <button onClick={() => toggleSave(p.id)} style={{ background: saved.includes(p.id) ? "#fef3c7" : "#f5f5f0", border: "none", borderRadius: 10, padding: "8px 14px", fontSize: 14, cursor: "pointer" }}>{saved.includes(p.id) ? "❤️ Saved" : "🤍 Save"}</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div style={{ background: "white", borderRadius: 20, border: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", height: 500, position: "sticky", top: 20 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>🏰</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Castle AI Assistant</div>
                <div style={{ fontSize: 11, color: "#22c55e" }}>● Online — Ready to help</div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "80%", background: msg.role === "user" ? "#1B1C15" : "#f5f5f0", color: msg.role === "user" ? "white" : "#1a1a1a", borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", padding: "10px 14px", fontSize: 13, lineHeight: 1.5 }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: 12, borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", gap: 8 }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") sendMessage(chatInput); }} placeholder="Ask me anything..." style={{ flex: 1, background: "#f5f5f0", border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none" }} />
              <button onClick={() => sendMessage(chatInput)} style={{ background: "#1B1C15", border: "none", borderRadius: 10, padding: "10px 16px", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>→</button>
            </div>
          </div>
        )}
      </div>

      {/* Property Detail Modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div style={{ background: "white", borderRadius: 24, maxWidth: 560, width: "100%", maxHeight: "85vh", overflowY: "auto", padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>{selected.name}</h2>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#888" }}>✕</button>
            </div>
            <div style={{ height: 200, borderRadius: 16, backgroundImage: `url(${selected.image})`, backgroundSize: "cover", backgroundPosition: "center", marginBottom: 20 }} />
            <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
              <div style={{ flex: 1, background: "#f9f9f0", borderRadius: 12, padding: 14, textAlign: "center" }}>
                <div style={{ fontWeight: 800, fontSize: 22, color: "#e85d04" }}>₹{selected.price.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: "#888" }}>per month</div>
              </div>
              <div style={{ flex: 1, background: "#f9f9f0", borderRadius: 12, padding: 14, textAlign: "center" }}>
                <div style={{ fontWeight: 800, fontSize: 22 }}>⭐ {selected.rating}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{selected.reviews} reviews</div>
              </div>
              <div style={{ flex: 1, background: "#f9f9f0", borderRadius: 12, padding: 14, textAlign: "center" }}>
                <div style={{ fontWeight: 800, fontSize: 22 }}>{selected.available}/{selected.rooms}</div>
                <div style={{ fontSize: 12, color: "#888" }}>rooms avail.</div>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>📍 {selected.location} · {selected.distance}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {selected.amenities.map(a => <span key={a} style={{ background: "#1B1C15", color: "white", fontSize: 12, padding: "4px 12px", borderRadius: 100 }}>{a}</span>)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setScheduleModal(true); }} style={{ flex: 2, background: "#e85d04", border: "none", borderRadius: 14, padding: "14px", color: "white", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>📅 Schedule Visit</button>
              <button onClick={() => toggleSave(selected.id)} style={{ flex: 1, background: saved.includes(selected.id) ? "#fef3c7" : "#f5f5f0", border: "none", borderRadius: 14, padding: "14px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>{saved.includes(selected.id) ? "❤️ Saved" : "🤍 Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModal && selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div style={{ background: "white", borderRadius: 24, maxWidth: 420, width: "100%", padding: 28, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Schedule a Visit</h3>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>{selected.name}</p>
            <input type="date" style={{ width: "100%", background: "#f5f5f0", border: "none", borderRadius: 12, padding: "12px 16px", fontSize: 14, marginBottom: 12, outline: "none" }} />
            <input type="time" defaultValue="10:00" style={{ width: "100%", background: "#f5f5f0", border: "none", borderRadius: 12, padding: "12px 16px", fontSize: 14, marginBottom: 16, outline: "none" }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setScheduleModal(false)} style={{ flex: 1, background: "#f5f5f0", border: "none", borderRadius: 12, padding: "12px", color: "#666", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => handleBook(selected.id)} style={{ flex: 2, background: "#1B1C15", border: "none", borderRadius: 12, padding: "12px", color: "white", fontWeight: 800, cursor: "pointer" }}>Confirm Visit ✓</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 380px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
