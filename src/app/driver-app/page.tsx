"use client";
import { useState, useEffect } from "react";

interface DeliveryTask {
  id: string;
  pickup: string;
  dropoff: string;
  customer: string;
  distance: string;
  earnings: number;
  food: string[];
  status: "available" | "picked" | "delivering" | "completed";
  eta: number;
  orderId: string;
}

const availableTasks: DeliveryTask[] = [
  { id: "D-001", pickup: "FreshBite - Indiranagar", dropoff: "123 CMH Road, Indiranagar", customer: "Priya S.", distance: "2.3 km", earnings: 68, food: ["Margherita Pizza", "Caesar Salad"], status: "available", eta: 8, orderId: "ORD-2847" },
  { id: "D-002", pickup: "FreshBite - Whitefield", dropoff: "45 Phoenix Marketcity, Whitefield", customer: "Rahul V.", distance: "4.1 km", earnings: 112, food: ["Butter Chicken", "3x Naan"], status: "available", eta: 15, orderId: "ORD-2848" },
  { id: "D-003", pickup: "FreshBite - Koramangala", dropoff: "88 5th Block, Koramangala", customer: "Ananya P.", distance: "1.8 km", earnings: 54, food: ["2x Smash Burger"], status: "available", eta: 6, orderId: "ORD-2849" },
  { id: "D-004", pickup: "FreshBite - HSR Layout", dropoff: "22 Sector 2, HSR Layout", customer: "Vikram S.", distance: "3.5 km", earnings: 95, food: ["Chicken Biryani", "Raita", "Tiramisu"], status: "available", eta: 12, orderId: "ORD-2850" },
];

export default function DriverApp() {
  const [tasks, setTasks] = useState<DeliveryTask[]>(availableTasks);
  const [activeTask, setActiveTask] = useState<DeliveryTask | null>(null);
  const [earnings, setEarnings] = useState(1247);
  const [deliveries, setDeliveries] = useState(12);
  const [rating, setRating] = useState(4.9);
  const [showEarnModal, setShowEarnModal] = useState(false);
  const [currentEta, setCurrentEta] = useState(0);
  const [etaInterval, setEtaInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  const startDelivery = (task: DeliveryTask) => {
    const updated = { ...task, status: "picked" as const, eta: task.eta };
    setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
    setActiveTask(updated);
    setCurrentEta(task.eta);
    
    const interval = setInterval(() => {
      setCurrentEta(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setEtaInterval(interval);
  };

  const completeDelivery = () => {
    if (!activeTask) return;
    if (etaInterval) clearInterval(etaInterval);
    
    const earned = activeTask.earnings;
    setEarnings(prev => prev + earned);
    setDeliveries(prev => prev + 1);
    
    setTasks(prev => prev.filter(t => t.id !== activeTask.id));
    setActiveTask(null);
    setShowEarnModal(true);
    setTimeout(() => setShowEarnModal(false), 3000);
  };

  const cancelDelivery = () => {
    if (etaInterval) clearInterval(etaInterval);
    if (activeTask) {
      setTasks(prev => prev.map(t => t.id === activeTask.id ? { ...t, status: "available" as const } : t));
      setActiveTask(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#111", color: "white", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", maxWidth: 430, margin: "0 auto", position: "relative" }}>
      
      {/* Earned Modal */}
      {showEarnModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "#22c55e", borderRadius: 24, padding: "40px", textAlign: "center", animation: "popIn 0.4s ease" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Delivered!</div>
            <div style={{ fontSize: 36, fontWeight: 800 }}>+₹{activeTask?.earnings}</div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div style={{ background: "#1a1a1a", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #e85d04, #ff8c42)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              🚴
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Alex Kumar</div>
              <div style={{ fontSize: 12, color: "#22c55e" }}>● Online</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>⭐ {rating}</div>
              <div style={{ fontSize: 10, color: "#888" }}>Rating</div>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: "#22c55e" }}>₹{earnings}</div>
              <div style={{ fontSize: 10, color: "#888" }}>Today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Delivery Banner */}
      {activeTask && (
        <div style={{ background: "linear-gradient(135deg, #e85d04, #ff6b35)", padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>CURRENT DELIVERY</div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>ETA {currentEta} min</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 12, padding: "8px 16px", fontWeight: 800 }}>
              ₹{activeTask.earnings}
            </div>
          </div>
          
          {/* Progress Steps */}
          <div style={{ display: "flex", gap: 0, marginBottom: 16, position: "relative" }}>
            {["Pick Up", "On the way", "Delivered"].map((step, i) => {
              const currentStep = activeTask.status === "picked" ? 0 : activeTask.status === "delivering" ? 1 : 2;
              const done = i <= currentStep;
              return (
                <div key={i} style={{ flex: 1, textAlign: "center", position: "relative" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? "white" : "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", fontSize: 12 }}>
                    {done ? "✓" : i + 1}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: done ? "white" : "rgba(255,255,255,0.4)" }}>{step}</div>
                  {i < 2 && <div style={{ position: "absolute", top: 14, left: "calc(50% + 14px)", right: "calc(-50% + 14px)", height: 2, background: done ? "white" : "rgba(255,255,255,0.2)" }} />}
                </div>
              );
            })}
          </div>

          {/* Address */}
          <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>
              {activeTask.status === "picked" ? "📍 PICK UP" : "📍 DROP OFF"}
            </div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              {activeTask.status === "picked" ? activeTask.pickup : activeTask.dropoff}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{activeTask.customer}</div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={cancelDelivery} style={{ flex: 1, background: "rgba(0,0,0,0.3)", border: "none", borderRadius: 12, padding: 12, color: "white", fontWeight: 700, cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={activeTask.status === "picked" ? () => setActiveTask({ ...activeTask, status: "delivering" }) : completeDelivery} style={{ flex: 2, background: "white", border: "none", borderRadius: 12, padding: 12, color: "#e85d04", fontWeight: 800, cursor: "pointer", fontSize: 15 }}>
              {activeTask.status === "picked" ? "🚴 Start Delivery →" : "✅ Complete Delivery"}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ padding: "20px" }}>
        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
          {[
            { icon: "📦", label: "Deliveries", value: deliveries },
            { icon: "⏱️", label: "Hours Online", value: "6.2h" },
            { icon: "💰", label: "This Week", value: "₹8,340" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#888" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Available Deliveries */}
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800 }}>Available Deliveries 🚴</h3>
          <span style={{ fontSize: 12, color: "#888" }}>{tasks.filter(t => t.status === "available").length} nearby</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {tasks.filter(t => t.status === "available").map(task => (
            <div key={task.id} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>PICKUP</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{task.pickup}</div>
                </div>
                <div style={{ background: "#22c55e", borderRadius: 10, padding: "6px 14px", fontWeight: 800, fontSize: 16, color: "white" }}>
                  ₹{task.earnings}
                </div>
              </div>

              <div style={{ borderLeft: "2px solid rgba(255,255,255,0.1)", paddingLeft: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>DROP OFF</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{task.dropoff}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{task.customer} · {task.distance} away</div>
              </div>

              <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>
                📦 {task.food.join(", ")}
              </div>

              <button onClick={() => startDelivery(task)} style={{ width: "100%", background: "#e85d04", border: "none", borderRadius: 12, padding: 12, color: "white", fontWeight: 800, cursor: "pointer" }}>
                Accept Delivery 🚴
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Nav */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 430, margin: "0 auto", background: "rgba(17,17,17,0.95)", borderTop: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", display: "flex", justifyContent: "space-around", padding: "12px 0" }}>
          {[
            { icon: "🏠", label: "Home", active: true },
            { icon: "📋", label: "Orders", active: false },
            { icon: "📊", label: "Earnings", active: false },
            { icon: "👤", label: "Profile", active: false },
          ].map((item, i) => (
            <button key={i} style={{ background: "none", border: "none", color: item.active ? "#e85d04" : "#888", cursor: "pointer", textAlign: "center", padding: "4px 16px" }}>
              <div style={{ fontSize: 22, marginBottom: 2 }}>{item.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 600 }}>{item.label}</div>
            </button>
          ))}
        </div>

        <div style={{ height: 80 }} /> {/* Spacer for bottom nav */}
      </div>

      <style>{`
        @keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}
