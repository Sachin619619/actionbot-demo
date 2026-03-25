"use client";
import { useState, useEffect, useCallback, useRef } from "react";

interface Rocket {
  x: number; y: number; vx: number; vy: number;
  angle: number; fuel: number; thrusting: boolean;
  color: string; name: string; shield: boolean; speed: number;
}

interface Star { x: number; y: number; size: number; opacity: number; speed: number; }

interface Obstacle {
  id: number; x: number; y: number; size: number; type: string;
  angle: number; rotSpeed: number; active: boolean;
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; color: string; size: number;
}

interface PowerUp {
  id: number; x: number; y: number; size: number; type: "shield" | "fuel" | "magnet" | "slowmo" | "lifebonus";
  active: boolean; pulse: number;
}

interface GameState {
  score: number; highScore: number; level: number;
  lives: number; gameOver: boolean; paused: boolean;
  started: boolean; combo: number; slowmo: boolean;
}

const SAVED_KEY = "actionbot_rocket_v3";

export default function RocketGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0, highScore: 0, level: 1, lives: 3, gameOver: false,
    paused: false, started: false, combo: 0, slowmo: false,
  });
  const [showBot, setShowBot] = useState(false);
  const [botMessages, setBotMessages] = useState<{ from: string; text: string; time: string }[]>([]);
  const [botInput, setBotInput] = useState("");

  const rocketRef = useRef<Rocket>({
    x: 300, y: 300, vx: 0, vy: 0, angle: 0, fuel: 100,
    thrusting: false, color: "#FF6B35", name: "Player",
    shield: false, speed: 1,
  });
  const starsRef = useRef<Star[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const keysRef = useRef<Set<string>>(new Set());
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animRef = useRef<number>(0);
  const gameRef = useRef<GameState>(gameState);
  const obstacleIdRef = useRef(0);
  const powerUpIdRef = useRef(0);

  useEffect(() => { gameRef.current = gameState; }, [gameState]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setGameState(prev => ({ ...prev, highScore: data.highScore || 0, level: data.level || 1 }));
      }
    } catch {}
  }, []);

  const initStars = useCallback((W: number, H: number) => {
    starsRef.current = Array.from({ length: 150 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.5 + 0.1,
    }));
  }, []);

  const spawnObstacles = useCallback((W: number, H: number, level: number) => {
    const count = 4 + level * 2;
    const obs: Obstacle[] = [];
    for (let i = 0; i < count; i++) {
      let x, y;
      do {
        x = Math.random() * (W - 100) + 50;
        y = Math.random() * (H - 150) + 80;
      } while (Math.abs(x - W/2) < 80 && Math.abs(y - H/2) < 80);
      obs.push({
        id: obstacleIdRef.current++,
        x, y,
        size: Math.random() * 25 + 18,
        type: Math.random() > 0.7 ? "asteroid" : Math.random() > 0.5 ? "coin" : "star",
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        active: true,
      });
    }
    obstaclesRef.current = obs;
  }, []);

  const spawnPowerUp = useCallback((W: number, H: number) => {
    if (Math.random() > 0.35) return;
    const types: PowerUp["type"][] = ["shield", "fuel", "magnet", "slowmo", "lifebonus"];
    const type = types[Math.floor(Math.random() * types.length)];
    powerUpsRef.current.push({
      id: powerUpIdRef.current++,
      x: Math.random() * (W - 80) + 40,
      y: Math.random() * (H - 150) + 60,
      size: 18, type, active: true, pulse: 0,
    });
  }, []);

  const spawnParticles = (x: number, y: number, count: number, colors: string[], speed = 5, life = 30) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const vel = Math.random() * speed;
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * vel, vy: Math.sin(angle) * vel,
        life, maxLife: life,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 4 + 1,
      });
    }
  };

  const resetGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width, H = canvas.height;
    rocketRef.current = { x: W/2, y: H/2, vx: 0, vy: 0, angle: 0, fuel: 100, thrusting: false, color: "#FF6B35", name: "Player", shield: false, speed: 1 };
    particlesRef.current = [];
    powerUpsRef.current = [];
    initStars(W, H);
    spawnObstacles(W, H, 1);
    setGameState(prev => ({ ...prev, score: 0, level: 1, lives: 3, gameOver: false, paused: false, started: true, combo: 0, slowmo: false }));
  }, [initStars, spawnObstacles]);

  const smartResponses = [
    { patterns: [/score|points|how (much|many)/i, /what.*score/i], response: () => `Your score is ${gameState.score} points! Combo: ${gameState.combo}x 🎯` },
    { patterns: [/level|stage|rank/i], response: () => `Level ${gameState.level} — more obstacles, more coins! 💫` },
    { patterns: [/high.?score|best|record/i], response: () => `High score: ${gameState.highScore}! 🏆` },
    { patterns: [/fuel|energy|power|gas/i], response: () => gameState.slowmo ? "Slow-mo is ACTIVE! 🐢" : rocketRef.current.fuel < 20 ? "⚠️ Fuel critical! Tap W gently!" : `Fuel at ${Math.round(rocketRef.current.fuel)}% — small bursts! ⛽` },
    { patterns: [/control|move|how.*play|key/i], response: () => "WASD or Arrows to move! W thrusts up. Collect coins, avoid asteroids! 🚀" },
    { patterns: [/life|lives|heart|die/i], response: () => `${gameState.lives} lives left! ${rocketRef.current.shield ? "🛡️ SHIELD ACTIVE" : "No shield"} — be careful! ❤️` },
    { patterns: [/pause|stop/i], response: () => "Press P or ESC to pause! ⏸️" },
    { patterns: [/tip|help|hint|advice/i], response: () => ["Hover near coins! 🧲", "Small, frequent thrusts save fuel! 💡", "Shields protect from one hit! 🛡️", "Star coins are worth 3x! ⭐"][Math.floor(Math.random() * 4)] },
    { patterns: [/shield|protect/i], response: () => rocketRef.current.shield ? "You have an active shield! 🛡️" : "No shield — grab a blue gem when you see one! 💎" },
    { patterns: [/slow.?mo|time.?warp/i], response: () => gameState.slowmo ? "Slow-mo active! 🐢✨" : "Slow-mo power-ups look like purple crystals! 💜" },
    { patterns: [/combo/i], response: () => `Combo: ${gameState.combo}x! Collect quickly without getting hit! 🔥` },
    { patterns: [/magnet|attract/i], response: () => "Magnet pulls nearby coins toward you! 🧲" },
    { patterns: [/restart|reset|new game/i], response: () => "RESTART_GAME" },
    { patterns: [/thank|thanks/i], response: () => "You're welcome! Now beat that high score! 🚀" },
    { patterns: [/funny|joke/i], response: () => ["Why did the rocket break up? It needed more space! 🚀💔", "What do rockets play on guitars? Launch chords! 🎸"][Math.floor(Math.random() * 2)] },
  ];

  const getBotResponse = (input: string): string => {
    const lower = input.toLowerCase();
    for (const rule of smartResponses) {
      if (rule.patterns.some(p => p.test(lower))) return rule.response();
    }
    const contextual = [
      "You're doing great! Keep collecting those coins! 💪",
      "The high score is waiting to be broken! 🏆",
      "Remember: small thrusts = more fuel efficiency! 🚀",
      "Check the HUD for fuel and lives! 📊",
    ];
    return contextual[Math.floor(Math.random() * contextual.length)];
  };

  const sendBotMessage = (input: string) => {
    const userMsg = input.trim();
    if (!userMsg) return;
    const response = getBotResponse(userMsg);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setBotMessages(prev => [...prev, { from: "user", text: userMsg, time: timeStr }, { from: "bot", text: response, time: timeStr }]);
    if (response === "RESTART_GAME") resetGame();
    setBotInput("");
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (["ArrowUp", "w", "W", " "].includes(e.key)) e.preventDefault();
    };
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", handleKey);
    window.addEventListener("keyup", handleKeyUp);
    return () => { window.removeEventListener("keydown", handleKey); window.removeEventListener("keyup", handleKeyUp); };
  }, []);

  useEffect(() => {
    if (!gameState.started || gameState.paused || gameState.gameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const slow = gameState.slowmo ? 0.5 : 1;

    initStars(W, H);

    const gameLoop = () => {
      const gs = gameRef.current;
      const rocket = rocketRef.current;
      const keys = keysRef.current;

      rocket.thrusting = keys.has("ArrowUp") || keys.has("w") || keys.has("W");
      if (rocket.thrusting && rocket.fuel > 0) {
        rocket.vy -= 0.35 * slow;
        rocket.fuel -= 0.12 * slow;
        spawnParticles(rocket.x, rocket.y + 20, 3, ["#FF6B35", "#FFD93D", "#FF8C42"], 3, 18);
      }
      if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) rocket.vx -= 0.3 * slow;
      if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) rocket.vx += 0.3 * slow;

      rocket.vy += 0.08 * slow;
      rocket.vx *= 0.97;
      rocket.vy *= 0.97;
      rocket.x += rocket.vx * slow;
      rocket.y += rocket.vy * slow;

      if (rocket.x < -20) rocket.x = W + 20;
      if (rocket.x > W + 20) rocket.x = -20;
      if (rocket.y < -20) rocket.y = H + 20;
      if (rocket.y > H + 20) rocket.y = -20;
      if (rocket.x < 20) rocket.vx += 0.15;
      if (rocket.x > W - 20) rocket.vx -= 0.15;

      rocket.fuel = Math.min(100, Math.max(0, rocket.fuel));
      rocket.speed = Math.sqrt(rocket.vx * rocket.vx + rocket.vy * rocket.vy);

      starsRef.current.forEach(s => { s.y += s.speed * slow; if (s.y > H) { s.y = 0; s.x = Math.random() * W; } });

      particlesRef.current = particlesRef.current.filter(p => { p.x += p.vx * slow; p.y += p.vy * slow; p.life -= slow; return p.life > 0; });
      powerUpsRef.current.forEach(p => { p.pulse += 0.08; });
      obstaclesRef.current.forEach(obs => { if (!obs.active) return; obs.angle += obs.rotSpeed * slow; if (obs.type === "coin") { obs.y += 0.3 * slow; if (obs.y > H + 20) { obs.y = -20; obs.x = Math.random() * W; } } });

      let scoreDelta = 0;
      let livesDelta = 0;
      let comboBroken = false;

      obstaclesRef.current = obstaclesRef.current.filter(obs => {
        if (!obs.active) return true;
        const dx = rocket.x - obs.x;
        const dy = rocket.y - obs.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < obs.size + 14) {
          if (obs.type === "coin" || obs.type === "star") {
            const points = obs.type === "star" ? 30 : 10;
            scoreDelta += points * (gs.combo > 0 ? Math.min(gs.combo, 5) : 1);
            spawnParticles(obs.x, obs.y, 10, ["#FFD93D", "#FFA500", "#fff"], 6, 25);
            if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
            comboTimerRef.current = setTimeout(() => { setGameState(prev => ({ ...prev, combo: 0 })); }, 3000);
            return false;
          } else if (obs.type === "asteroid") {
            if (rocket.shield) {
              rocket.shield = false;
              spawnParticles(rocket.x, rocket.y, 20, ["#60a5fa", "#3b82f6", "#93c5fd"], 7, 30);
            } else {
              livesDelta++;
              spawnParticles(rocket.x, rocket.y, 25, ["#FF6B35", "#FF4444", "#FFD93D"], 8, 40);
              rocket.x = W / 2; rocket.y = H / 2; rocket.vx = 0; rocket.vy = 0;
              comboBroken = true;
            }
            return true;
          }
        }
        return true;
      });

      powerUpsRef.current = powerUpsRef.current.filter(pu => {
        if (!pu.active) return true;
        const dx = rocket.x - pu.x;
        const dy = rocket.y - pu.y;
        if (Math.sqrt(dx * dx + dy * dy) < pu.size + 18) {
          spawnParticles(pu.x, pu.y, 15, ["#fff", "#e0f2fe", "#7dd3fc"], 6, 30);
          switch (pu.type) {
            case "shield": rocket.shield = true; break;
            case "fuel": rocket.fuel = Math.min(100, rocket.fuel + 50); break;
            case "slowmo": setGameState(prev => ({ ...prev, slowmo: true })); setTimeout(() => setGameState(prev => ({ ...prev, slowmo: false })), 6000); break;
            case "lifebonus": livesDelta = Math.min(-1, livesDelta); break;
          }
          return false;
        }
        return true;
      });

      if (Math.random() < 0.008) spawnPowerUp(W, H);

      if (obstaclesRef.current.filter(o => o.active).length === 0) {
        const newLevel = gs.level + 1;
        spawnObstacles(W, H, newLevel);
        scoreDelta += 50 + newLevel * 20;
        setGameState(prev => ({ ...prev, level: newLevel }));
      }

      if (livesDelta > 0) {
        setGameState(prev => {
          const newLives = prev.lives - livesDelta;
          const newCombo = comboBroken ? 0 : prev.combo;
          if (newLives <= 0) {
            const newHigh = Math.max(prev.highScore, prev.score);
            try { localStorage.setItem(SAVED_KEY, JSON.stringify({ score: prev.score, level: prev.level, highScore: newHigh })); } catch {}
            return { ...prev, lives: 0, gameOver: true, score: prev.score, highScore: newHigh, combo: newCombo };
          }
          return { ...prev, lives: newLives, combo: newCombo };
        });
      }

      if (scoreDelta > 0) {
        setGameState(prev => {
          const newScore = prev.score + scoreDelta;
          const newCombo = prev.combo + 1;
          const newHigh = Math.max(prev.highScore, newScore);
          try { localStorage.setItem(SAVED_KEY, JSON.stringify({ score: newScore, level: prev.level, highScore: newHigh })); } catch {}
          return { ...prev, score: newScore, highScore: newHigh, combo: newCombo };
        });
      }

      // DRAW
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, gameState.slowmo ? "#1a0a2e" : "#0a0a1a");
      grad.addColorStop(1, gameState.slowmo ? "#0a1a2e" : "#050510");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      if (gameState.slowmo) { ctx.fillStyle = "rgba(138,43,226,0.08)"; ctx.fillRect(0, 0, W, H); }

      starsRef.current.forEach(star => { ctx.globalAlpha = star.opacity; ctx.fillStyle = star.size > 1.8 ? "#e0f2fe" : "white"; ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2); ctx.fill(); });
      ctx.globalAlpha = 1;

      powerUpsRef.current.forEach(pu => {
        if (!pu.active) return;
        const colors: Record<string, string> = { shield: "#3b82f6", fuel: "#22c55e", magnet: "#f59e0b", slowmo: "#a855f7", lifebonus: "#ef4444" };
        ctx.globalAlpha = 0.15 + Math.sin(pu.pulse) * 0.08;
        ctx.fillStyle = colors[pu.type];
        ctx.beginPath(); ctx.arc(pu.x, pu.y, pu.size + 8 + Math.sin(pu.pulse) * 4, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      });

      particlesRef.current.forEach(p => { ctx.globalAlpha = p.life / p.maxLife; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2); ctx.fill(); });
      ctx.globalAlpha = 1;

      obstaclesRef.current.forEach(obs => {
        ctx.save(); ctx.translate(obs.x, obs.y); ctx.rotate(obs.angle);
        if (obs.type === "coin" || obs.type === "star") {
          const coinColor = obs.type === "star" ? "#a855f7" : "#FFD93D";
          ctx.fillStyle = coinColor; ctx.shadowColor = coinColor; ctx.shadowBlur = obs.type === "star" ? 20 : 12;
          ctx.beginPath(); ctx.arc(0, 0, obs.size * 0.55, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0; ctx.fillStyle = obs.type === "star" ? "#fff" : "#FFA500";
          ctx.font = `bold ${obs.size * 0.8}px sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(obs.type === "star" ? "★" : "$", 0, 0);
        } else {
          ctx.fillStyle = "#555"; ctx.strokeStyle = "#777"; ctx.lineWidth = 2;
          ctx.beginPath();
          const pts = 7;
          for (let i = 0; i < pts; i++) { const a = (i / pts) * Math.PI * 2; const r = obs.size * (0.8 + Math.sin(i * 3.7) * 0.25); i === 0 ? ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r) : ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r); }
          ctx.closePath(); ctx.fill(); ctx.stroke();
        }
        ctx.restore();
      });

      powerUpsRef.current.forEach(pu => {
        if (!pu.active) return;
        const icons: Record<string, string> = { shield: "🛡️", fuel: "⛽", magnet: "🧲", slowmo: "⏱️", lifebonus: "❤️" };
        ctx.font = `${pu.size * 1.5}px sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(icons[pu.type], pu.x, pu.y);
      });

      ctx.save(); ctx.translate(rocket.x, rocket.y); ctx.rotate(rocket.thrusting ? -0.12 : 0);
      if (rocket.shield) { ctx.strokeStyle = "rgba(96,165,250,0.7)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = "rgba(96,165,250,0.08)"; ctx.fill(); }
      ctx.fillStyle = rocket.color; ctx.beginPath(); ctx.moveTo(0, -22); ctx.bezierCurveTo(10, -10, 10, 15, 0, 18); ctx.bezierCurveTo(-10, 15, -10, -10, 0, -22); ctx.fill();
      ctx.fillStyle = "#A8D8EA"; ctx.beginPath(); ctx.arc(0, -5, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#CC5500"; ctx.beginPath(); ctx.moveTo(-8, 10); ctx.lineTo(-16, 20); ctx.lineTo(-6, 16); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(8, 10); ctx.lineTo(16, 20); ctx.lineTo(6, 16); ctx.closePath(); ctx.fill();
      if (rocket.thrusting && rocket.fuel > 0) { ctx.fillStyle = "#FFD93D"; ctx.shadowColor = "#FF6B35"; ctx.shadowBlur = 20; ctx.beginPath(); ctx.moveTo(-5, 18); ctx.lineTo(0, 30 + Math.random() * 10); ctx.lineTo(5, 18); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0; }
      ctx.restore();

      const hudAlpha = gameState.slowmo ? 0.6 : 0.65;
      ctx.fillStyle = `rgba(0,0,0,${hudAlpha})`; ctx.fillRect(8, 8, 220, 100);
      ctx.fillStyle = "white"; ctx.font = "bold 14px monospace"; ctx.textAlign = "left";
      ctx.fillText(`Score: ${gameState.score}`, 16, 28);
      ctx.fillText(`Level: ${gameState.level}`, 16, 48);
      ctx.fillText(`Lives: ${Array.from({ length: Math.max(0, gameState.lives) }).map(() => "❤️").join("")}`, 16, 68);
      if (gameState.combo > 1) { ctx.fillStyle = "#fbbf24"; ctx.fillText(`Combo: ${gameState.combo}x 🔥`, 16, 88); }

      ctx.fillStyle = `rgba(0,0,0,${hudAlpha})`; ctx.fillRect(8, 108, 140, 14);
      ctx.fillStyle = rocket.fuel > 30 ? "#22c55e" : rocket.fuel > 15 ? "#eab308" : "#ef4444";
      ctx.fillRect(8, 108, (rocket.fuel / 100) * 140, 14);
      ctx.fillStyle = "white"; ctx.font = "9px monospace"; ctx.fillText("FUEL", 150, 118);

      if (gameState.slowmo) { ctx.fillStyle = "rgba(168,85,247,0.3)"; ctx.fillRect(8, 126, 140, 12); ctx.fillStyle = "#a855f7"; ctx.font = "9px monospace"; ctx.fillText("SLOW-MO ✨", 12, 135); }
      if (rocket.shield) { ctx.fillStyle = "rgba(59,130,246,0.3)"; ctx.fillRect(8, 140, 100, 12); ctx.fillStyle = "#60a5fa"; ctx.font = "9px monospace"; ctx.fillText("SHIELD 🛡️", 12, 149); }

      ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = "10px monospace"; ctx.textAlign = "right";
      ctx.fillText("WASD/Arrows • W=thrust • P=pause", W - 12, H - 10);

      animRef.current = requestAnimationFrame(gameLoop);
    };

    animRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animRef.current);
  }, [gameState.started, gameState.paused, gameState.gameOver, gameState.score, gameState.level, gameState.lives, gameState.highScore, gameState.combo, gameState.slowmo, initStars, spawnObstacles, spawnPowerUp]);

  useEffect(() => {
    const handlePause = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P" || e.key === "Escape") {
        if (gameState.started && !gameState.gameOver) setGameState(prev => ({ ...prev, paused: !prev.paused }));
      }
      if (e.key === "r" || e.key === "R") { if (gameState.gameOver) resetGame(); }
    };
    window.addEventListener("keydown", handlePause);
    return () => window.removeEventListener("keydown", handlePause);
  }, [gameState, resetGame]);

  const canvasWidth = 640;
  const canvasHeight = 520;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a1a", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "monospace", color: "white", padding: "0.75rem" }}>
      <div style={{ width: "100%", maxWidth: 660, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", padding: "0.5rem 1rem", background: "rgba(255,255,255,0.04)", borderRadius: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 26 }}>🚀</span>
          <div>
            <span style={{ fontSize: "1rem", fontWeight: 700 }}>Rocket Game v3</span>
            <span style={{ marginLeft: 8, fontSize: 11, color: "#888" }}>Level {gameState.level} · Best: {gameState.highScore}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowBot(!showBot)} style={{ background: showBot ? "#FF6B35" : "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "7px 14px", color: "white", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}>🤖 AI Copilot</button>
          <button onClick={resetGame} style={{ background: "#FF6B35", border: "none", borderRadius: 10, padding: "7px 16px", color: "white", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}>{gameState.started ? "🔄 Restart" : "🎮 Start"}</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 660 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} style={{ borderRadius: 14, border: "2px solid rgba(255,255,255,0.08)", display: "block" }} />

          {!gameState.started && !gameState.gameOver && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,26,0.93)", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: 56 }}>🚀</span>
              <h1 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Rocket Game v3</h1>
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", lineHeight: 1.9 }}>
                <p>🎮 <b>WASD</b> / <b>Arrow Keys</b> to move</p>
                <p>⬆️ <b>W / ↑</b> to thrust upward</p>
                <p>💰 Collect <b>$</b> coins (+10) & <b>★</b> stars (+30)</p>
                <p>💀 Avoid <b>asteroids</b> — grab 🛡️ shield!</p>
                <p>⏱️ Power-ups: 🛡️ ⛽ ⏱️ ❤️ 🧲</p>
                <p>⭐ Clear all → <b>next level</b></p>
              </div>
              <button onClick={resetGame} style={{ background: "#FF6B35", border: "none", borderRadius: 14, padding: "13px 38px", color: "white", fontSize: "1rem", fontWeight: 700, cursor: "pointer", marginTop: "0.5rem" }}>LAUNCH 🚀</button>
            </div>
          )}

          {gameState.paused && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,26,0.9)", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
              <span style={{ fontSize: 48 }}>⏸️</span>
              <h2 style={{ fontSize: "1.4rem" }}>PAUSED</h2>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>Press P or ESC to resume</p>
              <button onClick={() => setGameState(prev => ({ ...prev, paused: false }))} style={{ background: "#FF6B35", border: "none", borderRadius: 12, padding: "11px 30px", color: "white", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer" }}>Resume</button>
            </div>
          )}

          {gameState.gameOver && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,26,0.93)", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: 48 }}>💥</span>
              <h2 style={{ fontSize: "1.4rem", color: "#FF6B35" }}>GAME OVER</h2>
              <p style={{ fontSize: "1.1rem" }}>Score: <b>{gameState.score}</b></p>
              {gameState.score >= gameState.highScore && gameState.score > 0 && <p style={{ color: "#fbbf24", fontSize: "0.9rem" }}>🏆 NEW HIGH SCORE!</p>}
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>Best: {gameState.highScore} · Level {gameState.level}</p>
              <button onClick={resetGame} style={{ background: "#FF6B35", border: "none", borderRadius: 12, padding: "11px 30px", color: "white", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", marginTop: "0.5rem" }}>Play Again 🚀</button>
            </div>
          )}
        </div>

        {showBot && (
          <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "0.75rem", display: "flex", flexDirection: "column", maxHeight: canvasHeight }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>🤖</span>
              <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>AI Copilot</span>
              <span style={{ marginLeft: "auto", background: "#22c55e", color: "white", fontSize: "0.6rem", padding: "2px 8px", borderRadius: 100, fontWeight: 600 }}>Online</span>
            </div>
            <div style={{ flex: 1, overflowY: "auto", background: "rgba(0,0,0,0.25)", borderRadius: 10, padding: "0.6rem", marginBottom: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {botMessages.length === 0 && <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.75rem", textAlign: "center", marginTop: 40 }}>Ask about score, controls, power-ups... 🤖</p>}
              {botMessages.map((msg, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.from === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "85%", background: msg.from === "user" ? "#FF6B35" : "rgba(255,255,255,0.1)", color: "white", borderRadius: msg.from === "user" ? "10px 10px 2px 10px" : "10px 10px 10px 2px", padding: "6px 12px", fontSize: "0.75rem", lineHeight: 1.5 }}>{msg.text}</div>
                  <span style={{ fontSize: 9, color: "#555", marginTop: 2 }}>{msg.time}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input value={botInput} onChange={e => setBotInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") sendBotMessage(botInput); }} placeholder="Ask me anything..." style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "8px 12px", color: "white", fontSize: "0.8rem", outline: "none" }} />
              <button onClick={() => sendBotMessage(botInput)} style={{ background: "#FF6B35", border: "none", borderRadius: 8, padding: "8px 14px", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem" }}>Send</button>
            </div>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.65rem", marginTop: 6, textAlign: "center" }}>Try: "what's my score?", "tip", "how do I play?"</p>
          </div>
        )}
      </div>
      <p style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.65rem", marginTop: "0.75rem" }}>🚀 Rocket Game v3 · Power-ups · Levels · AI Copilot · Particle Effects</p>
    </div>
  );
}
