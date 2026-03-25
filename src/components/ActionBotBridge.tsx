"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ActionBotConfig {
  externalUserId?: string;
  metadata?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

declare global {
  interface Window {
    actionbotConfig?: ActionBotConfig;
    actionbotWidget?: unknown;
  }
}

export default function ActionBotBridge({ userId, name, email, phone }: {
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    // Set actionbot config with user data
    if (typeof window !== "undefined") {
      window.actionbotConfig = {
        externalUserId: userId || "demo-user",
        metadata: {
          name: name || "Demo User",
          email: email || "demo@castle.app",
          phone: phone || "",
        },
      };
    }

    // Listen for custom events from the ActionBot widget
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      console.log("ActionBot event received:", detail);

      if (detail.event === "save_pg") {
        const saved: string[] = JSON.parse(localStorage.getItem("savedPGs") || "[]");
        const idx = saved.indexOf(detail.pgId);
        if (idx === -1) {
          saved.push(detail.pgId);
        } else {
          saved.splice(idx, 1);
        }
        localStorage.setItem("savedPGs", JSON.stringify(saved));
        console.log("Save toggled for PG:", detail.pgId);
      } else if (detail.event === "navigate" && detail.url) {
        router.push(detail.url);
      }
    };

    document.addEventListener("actionbot:custom_event", handler);
    return () => document.removeEventListener("actionbot:custom_event", handler);
  }, [userId, name, email, phone, router]);

  return null;
}
