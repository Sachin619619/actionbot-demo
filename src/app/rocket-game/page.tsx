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
const LEADERBOARD_KEY = "actionbot_rocket_leaderboard";

export default function RocketGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0, highScore: 0, level: 1, lives: 3, gameOver: false,
    paused: false, started: false, combo: 0, slowmo: false,
  });
  const [showBot, setShowBot] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{score: number; level: number; date: string}[]>([]);
  const [botMessages, setBotMessages] = useState<{ from: string; text: string; time: string }[]>([]);
  const [botInput, setBotInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const msgIdRef = useRef(0);
  
  // Achievements
  const ACHIEVEMENTS = [
    { id: "first_coin", label: "First Coin!", emoji: "🪙", condition: (gs: GameState) => gs.score >= 10 },
    { id: "level_2", label: "Level Up!", emoji: "⭐", condition: (gs: GameState) => gs.level >= 2 },
    { id: "score_100", label: "Century!", emoji: "💯", condition: (gs: GameState) => gs.score >= 100 },
    { id: "combo_3", label: "Combo Master!", emoji: "🔥", condition: (gs: GameState) => gs.combo >= 3 },
    { id: "score_500", label: "High Flyer!", emoji: "🚀", condition: (gs: GameState) => gs.score >= 500 },
    { id: "level_5", label: "Space Ace!", emoji: "👑", condition: (gs: GameState) => gs.level >= 5 },
    { id: "no_hit", label: "Untouchable!", emoji: "💎", condition: (gs: GameState) => gs.lives === 3 && gs.score >= 50 },
  ];
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [showAchievement, setShowAchievement] = useState<{ label: string; emoji: string } | null>(null);
  const [confetti, setConfetti] = useState<{ id: number; x: number; color: string; delay: number; size: number }[]>([]);

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

  // Sound effects using Web Audio API
  const playSound = (type: "coin" | "explosion" | "powerup" | "levelup" | "achievement") => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      const sounds: Record<string, [number, number, number]> = {
        coin: [880, 0.1, 0.15],
        explosion: [150, 0.3, 0.2],
        powerup: [660, 0.15, 0.12],
        levelup: [523, 0.2, 0.15],
        achievement: [784, 0.3, 0.18],
      };
      const [freq, duration, vol] = sounds[type] || [440, 0.2, 0.1];
      oscillator.frequency.value = freq;
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(vol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) { /* audio not available */ }
  };

  const shareScore = () => {
    const text = `🚀 I scored ${gameState.score} points in Rocket Game! High Score: ${gameState.highScore}! Level ${gameState.level}! Can you beat me? #RocketGame #ActionBot`;
    if (navigator.share) {
      navigator.share({ title: "Rocket Game Score", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
      alert("Score copied to clipboard!");
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

  const saveScore = useCallback((score: number, level: number) => {
    try {
      const entry = { score, level, date: new Date().toLocaleDateString() };
      const existing = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]") as typeof entry[];
      const updated = [...existing.filter((e) => e.score < score), entry].sort((a, b) => b.score - a.score).slice(0, 10);
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
      setLeaderboard(updated);
    } catch {}
  }, []);

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

  const checkAchievements = useCallback((gs: GameState) => {
    ACHIEVEMENTS.forEach(ach => {
      if (!unlockedAchievements.includes(ach.id) && ach.condition(gs)) {
        setUnlockedAchievements(prev => {
          if (prev.includes(ach.id)) return prev;
          setShowAchievement({ label: ach.label, emoji: ach.emoji });
          playSound("achievement");
          // Spawn confetti
          const colors = ["#FF6B35", "#FFD93D", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"];
          const newConfetti = Array.from({ length: 30 }, (_, i) => ({
            id: Date.now() + i,
            x: Math.random() * 100,
            color: colors[Math.floor(Math.random() * colors.length)],
            delay: Math.random() * 0.5,
            size: Math.random() * 6 + 4,
          }));
          setConfetti(newConfetti);
          setTimeout(() => { setConfetti([]); setShowAchievement(null); }, 3000);
          return [...prev, ach.id];
        });
      }
    });
  }, [unlockedAchievements]);
  };

  const sendBotMessage = (input: string) => {
    const userMsg = input.trim();
    if (!userMsg) return;
    const response = getBotResponse(userMsg);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const tempId = msgIdRef.current++;
    setBotMessages(prev => [...prev, { from: "user", text: userMsg, time: timeStr }]);
    if (response === "RESTART_GAME") {
      setBotMessages(prev => [...prev, { from: "bot", text: "🔄 Restarting game...", time: timeStr }]);
      setTimeout(resetGame, 800);
      setBotInput("");
      return;
    }
    setIsTyping(true);
    setBotInput("");
    // Streaming effect
    const words = response.split(" ");
    let displayed = "";
    let wordIdx = 0;
    const streamInterval = setInterval(() => {
      if (wordIdx < words.length) {
        displayed += (displayed ? " " : "") + words[wordIdx];
        setBotMessages(prev => {
          const filtered = prev.filter(m => m.from !== "bot" || m.text !== "");
          const existing = filtered.find(m => (m as any).tempId === tempId);
          if (existing) {
            return filtered.map(m => (m as any).tempId === tempId ? { ...m, text: displayed } : m);
          }
          return [...filtered, { from: "bot", text: displayed, time: timeStr, tempId }];
        });
        wordIdx++;
      } else {
        clearInterval(streamInterval);
        setIsTyping(false);
      }
    }, 35);
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
  // Init speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setBotInput(transcript);
        setIsListening(false);
        setTimeout(() => sendBotMessage(transcript), 100);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      setRecognition(rec);
    }
  }, []);

  const startVoiceInput = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
    }
  };


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
            saveScore(prev.score, prev.level);
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
      if (e.key === "/") { e.preventDefault(); setShowPalette(true); }
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
          <button onClick={() => setShowPalette(true)} style={{ background: showPalette ? "#a855f7" : "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "7px 12px", color: "white", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }} title="Command Palette (press /)">⌘</button>
          <button onClick={() => { setShowBot(false); setShowLeaderboard(!showLeaderboard); }} style={{ background: showLeaderboard ? "#FF6B35" : "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "7px 14px", color: "white", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}>🏆</button>
          <button onClick={() => { setShowLeaderboard(false); setShowBot(!showBot); }} style={{ background: showBot ? "#FF6B35" : "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "7px 14px", color: "white", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}>🤖</button>
          <button onClick={resetGame} style={{ background: "#FF6B35", border: "none", borderRadius: 10, padding: "7px 16px", color: "white", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}>{gameState.started ? "🔄" : "🎮"}</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 660 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>

          {/* Command Palette */}
          {showPalette && (
            <div style={{
              position: "absolute", inset: 0,
              background: "rgba(10,10,26,0.97)",
              borderRadius: 14,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.875rem",
              zIndex: 35,
              padding: "1.5rem",
            }}>
              <div style={{ fontSize: 36 }}>⌘</div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Command Palette</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", maxWidth: 280 }}>
                {[
                  { key: "/", cmd: "Open command palette" },
                  { key: "P", cmd: "Pause / Resume game" },
                  { key: "R", cmd: "Restart (after game over)" },
                  { key: "B", cmd: "Toggle AI Copilot" },
                  { key: "Esc", cmd: "Close palette" },
                ].map(item => (
                  <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "7px 14px" }}>
                    <span style={{ background: "#a855f7", borderRadius: 6, padding: "2px 8px", fontSize: "0.75rem", fontWeight: 700, minWidth: 36, textAlign: "center" }}>{item.key}</span>
                    <span style={{ fontSize: "0.8rem" }}>{item.cmd}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowPalette(false)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "7px 18px", color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", cursor: "pointer", marginTop: 4 }}>Esc to close</button>
            </div>
          )}

          {/* Tutorial Modal */}
          {showTutorial && (
            <div style={{
              position: "absolute", inset: 0,
              background: "rgba(10,10,26,0.96)",
              borderRadius: 14,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              zIndex: 30,
              padding: "1.5rem",
            }}>
              <div style={{ fontSize: 40 }}>🚀</div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>How to Play</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", maxWidth: 280, textAlign: "left" }}>
                {[
                  { e: "⬆️", t: "Thrust", d: "W or Arrow Up — fight gravity!" },
                  { e: "⬅️➡️", t: "Move", d: "A/D or Left/Right arrows" },
                  { e: "💰", t: "Coins", d: "Collect coins (+10 pts each)" },
                  { e: "💀", t: "Avoid", d: "Stay away from asteroids!" },
                  { e: "🛡️", t: "Power-ups", d: "Shield, fuel, slow-mo gems!" },
                  { e: "⭐", t: "Level Up", d: "Clear all coins to advance!" },
                ].map(item => (
                  <div key={item.t} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ fontSize: "1.1rem", minWidth: 24 }}>{item.e}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.82rem" }}>{item.t}</div>
                      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>{item.d}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowTutorial(false)} style={{
                background: "#FF6B35", border: "none", borderRadius: 12,
                padding: "10px 28px", color: "white", fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", marginTop: "0.5rem",
              }}>Got it! 🚀</button>
            </div>
          )}

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
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: isListening ? "#ef4444" : "#22c55e", animation: isListening ? "listening 0.7s ease-in-out infinite" : "none" }} />
                <span style={{ background: isListening ? "#ef4444" : "#22c55e", color: "white", fontSize: "0.6rem", padding: "2px 8px", borderRadius: 100, fontWeight: 600 }}>{isListening ? "Listening..." : "Online"}</span>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", background: "rgba(0,0,0,0.25)", borderRadius: 10, padding: "0.6rem", marginBottom: 6, display: "flex", flexDirection: "column", gap: 6, scrollbarWidth: "thin" }}>
              {botMessages.length === 0 && <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.75rem", textAlign: "center", marginTop: 40 }}>Ask about score, controls, power-ups... 🤖</p>}
              {botMessages.map((msg, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.from === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "85%", background: msg.from === "user" ? "linear-gradient(135deg, #FF6B35, #FF8C42)" : "rgba(255,255,255,0.1)", color: "white", borderRadius: msg.from === "user" ? "10px 10px 2px 10px" : "10px 10px 10px 2px", padding: "6px 12px", fontSize: "0.75rem", lineHeight: 1.5, whiteSpace: "pre-wrap", animation: msg.from === "bot" ? "slideUp 0.3s ease" : "none" }}>{msg.text}</div>
                  <span style={{ fontSize: 9, color: "#555", marginTop: 2 }}>{msg.time}</span>
                </div>
              ))}
              {isTyping && (
                <div style={{ display: "flex", alignItems: "flex-start" }}>
                  <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "10px 10px 10px 2px", padding: "6px 12px", display: "flex", gap: 3 }}>
                    <span className="typing-dot" style={{ color: "#FF6B35", fontSize: "0.8rem" }}>●</span>
                    <span className="typing-dot" style={{ color: "#FF6B35", fontSize: "0.8rem", animationDelay: "0.2s" }}>●</span>
                    <span className="typing-dot" style={{ color: "#FF6B35", fontSize: "0.8rem", animationDelay: "0.4s" }}>●</span>
                  </div>
                </div>
              )}
            </div>
            {botMessages.length <= 1 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
                {["Score?", "Tip?", "High score?", "Fuel?"].map(s => (
                  <button key={s} onClick={() => sendBotMessage(s)} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 100, padding: "3px 10px", color: "rgba(255,255,255,0.6)", fontSize: "0.68rem", cursor: "pointer" }}>{s}</button>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input value={botInput} onChange={e => setBotInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") sendBotMessage(botInput); }} placeholder="Ask me anything..." style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "8px 12px", color: "white", fontSize: "0.8rem", outline: "none" }} />
              {recognition && (
                <button onClick={startVoiceInput} style={{ background: isListening ? "#ef4444" : "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "8px 10px", color: "white", cursor: "pointer", fontSize: "1rem", animation: isListening ? "listening 0.7s ease-in-out infinite" : "none" }} title="Voice input">🎤</button>
              )}
              <button onClick={() => sendBotMessage(botInput)} style={{ background: "#FF6B35", border: "none", borderRadius: 8, padding: "8px 14px", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem" }}>➤</button>
            </div>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.65rem", marginTop: 6, textAlign: "center" }}>💡 Context-aware: I know your score, fuel, lives, combo, shield!</p>
          </div>
        )}

        {showLeaderboard && (
          <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "0.75rem", display: "flex", flexDirection: "column", maxHeight: canvasHeight }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>🏆</span>
              <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>Leaderboard</span>
              <button onClick={() => setShowLeaderboard(false)} style={{ marginLeft: "auto", background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, padding: "4px 10px", color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
              {(() => {
                const allScores = [...leaderboard];
                if (gameState.score > 0) {
                  const exists = allScores.find(s => s.score === gameState.score);
                  if (!exists) allScores.push({ score: gameState.score, level: gameState.level, date: "Just now" });
                }
                return allScores.length === 0 ? (
                  <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.8rem", textAlign: "center", marginTop: 40 }}>Play a game to get on the leaderboard! 🏆</p>
                ) : allScores.sort((a, b) => b.score - a.score).slice(0, 10).map((entry, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: entry.score === gameState.score && gameState.started ? "rgba(255,107,53,0.2)" : "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 12px", border: entry.score === gameState.score && gameState.started ? "1px solid #FF6B35" : "1px solid transparent" }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: i === 0 ? "#fbbf24" : i === 1 ? "#d1d5db" : i === 2 ? "#cd7f32" : "#888", width: 24, textAlign: "center" }}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{entry.score.toLocaleString()} pts</div>
                      <div style={{ fontSize: 11, color: "#888" }}>Level {entry.level} · {entry.date}</div>
                    </div>
                  </div>
                ));
              })()}
            </div>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.65rem", marginTop: 8, textAlign: "center" }}>Top 10 scores · Saved locally</p>
          </div>
        )}
      </div>
      <p style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.65rem", marginTop: "0.75rem" }}>🚀 Rocket Game v3 · Power-ups · Levels · AI Copilot · Particle Effects</p>
    </div>
  );
}
