import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════
// STORAGE LAYER — IndexedDB-like via localStorage
// ═══════════════════════════════════════════════════════════
const DB = {
  get: (key) => { try { return JSON.parse(localStorage.getItem("rta_" + key)); } catch { return null; } },
  set: (key, val) => { try { localStorage.setItem("rta_" + key, JSON.stringify(val)); } catch {} },
  update: (key, patch) => { const old = DB.get(key) || {}; DB.set(key, { ...old, ...patch }); }
};

// ═══════════════════════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════════════════════
const T = {
  bg: "#0a0a0f",
  surface: "#13131a",
  card: "#1a1a24",
  border: "#2a2a3a",
  accent1: "#ff6b35",
  accent2: "#f7c59f",
  accent3: "#00d4aa",
  accent4: "#7b61ff",
  text: "#f0f0f5",
  muted: "#8888aa",
  grad1: "linear-gradient(135deg, #ff6b35 0%, #f7c59f 50%, #ff6b35 100%)",
  grad2: "linear-gradient(135deg, #7b61ff 0%, #00d4aa 100%)",
  grad3: "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%)",
  gradCard: "linear-gradient(135deg, #1a1a24 0%, #13131a 100%)",
};

// ═══════════════════════════════════════════════════════════
// FREQUENCY GENERATOR
// ═══════════════════════════════════════════════════════════
const FREQS = [
  { hz: 174, name: "Fondamento", desc: "Riduce dolore e stress", color: "#ff6b35" },
  { hz: 285, name: "Campo Energetico", desc: "Riorganizza i tessuti", color: "#f7c59f" },
  { hz: 396, name: "Liberazione", desc: "Libera paura e colpa", color: "#ff4757" },
  { hz: 417, name: "Cambiamento", desc: "Facilita il cambiamento", color: "#ffa502" },
  { hz: 432, name: "Armonia Universale", desc: "Accordatura naturale", color: "#00d4aa" },
  { hz: 528, name: "Trasformazione DNA", desc: "Amore e riparazione", color: "#2ed573" },
  { hz: 639, name: "Connessione", desc: "Relazioni e armonia", color: "#1e90ff" },
  { hz: 741, name: "Risveglio", desc: "Intuizione e soluzione", color: "#7b61ff" },
  { hz: 852, name: "Ordine Spirituale", desc: "Ritorno all'ordine", color: "#eccc68" },
  { hz: 963, name: "Connessione Divina", desc: "Coscienza pura", color: "#ff6b9d" },
];

function useAudio() {
  const ctxRef = useRef(null);
  const oscillatorRef = useRef(null);
