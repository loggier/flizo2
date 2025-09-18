
"use client";

import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

const isNative = () => Capacitor.isNativePlatform();

export const storage = {
  async get(key: string): Promise<string | null> {
    if (isNative()) {
      const { value } = await Preferences.get({ key });
      return value ?? null;
    }
    if (typeof window === "undefined") return null;
    // For web, localStorage is preferred for persistence.
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  },

  async set(key: string, value: string, remember: boolean = true) {
    if (isNative()) {
      await Preferences.set({ key, value });
      return;
    }
    if (typeof window !== "undefined") {
      if (remember) {
        localStorage.setItem(key, value);
      } else {
        sessionStorage.setItem(key, value);
      }
    }
  },

  async remove(key: string) {
    if (isNative()) {
      await Preferences.remove({ key });
      return;
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  },

  async clearPreserving(keysToKeep: string[] = []) {
    if (isNative()) {
      // Preferences.clear() clears everything.
      // A more complex implementation would be needed to preserve keys.
      await Preferences.clear();
      return;
    }
    if (typeof window !== "undefined") {
      const snapshot: Record<string, string | null> = {};
      keysToKeep.forEach((k) => (snapshot[k] = localStorage.getItem(k)));
      
      localStorage.clear();
      sessionStorage.clear();
      
      keysToKeep.forEach((k) => {
        const v = snapshot[k];
        if (v !== null) localStorage.setItem(k, v);
      });
    }
  },
};
