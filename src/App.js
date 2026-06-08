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
  const gainRef = useRef(null);
  const [playing, setPlaying] = useState(null);
  const [vol, setVol] = useState(0.3);

  const play = useCallback((hz) => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
    if (playing === hz) { setPlaying(null); return; }
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = ctxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(hz, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    oscillatorRef.current = osc;
    gainRef.current = gain;
    setPlaying(hz);
  }, [playing, vol]);

  const stop = useCallback(() => {
    if (oscillatorRef.current) { oscillatorRef.current.stop(); oscillatorRef.current = null; }
    setPlaying(null);
  }, []);

  const changeVol = useCallback((v) => {
    setVol(v);
    if (gainRef.current && ctxRef.current) gainRef.current.gain.setValueAtTime(v, ctxRef.current.currentTime);
  }, []);

  return { play, stop, playing, vol, changeVol };
}

// ═══════════════════════════════════════════════════════════
// OFFLINE AI BRAIN
// ═══════════════════════════════════════════════════════════
function offlineAI(message, profile, history) {
  const msg = message.toLowerCase();
  const name = profile?.name || "Viaggiatore";
  const avgEnergy = history.slice(-7).reduce((s, d) => s + (d.energia || 5), 0) / Math.max(history.slice(-7).length, 1);
  const avgSleep = history.slice(-7).reduce((s, d) => s + (d.sonno || 7), 0) / Math.max(history.slice(-7).length, 1);

  if (msg.includes("stanco") || msg.includes("energia") || msg.includes("sveglio")) {
    if (avgEnergy < 5) return `${name}, il tuo livello energetico medio degli ultimi giorni è basso (${avgEnergy.toFixed(1)}/10). Suggerisco: tisana di ginseng al mattino, frequenza 528Hz per 15 minuti, e una passeggiata di 20 minuti all'aria aperta. Stai dormendo in media ${avgSleep.toFixed(1)} ore — prova ad andare a letto 30 minuti prima.`;
    return `La tua energia è discreta. Per ottimizzarla: acqua con limone a digiuno, respirazione 4-7-8 al risveglio, e frequenza 432Hz come sottofondo durante il lavoro.`;
  }
  if (msg.includes("sonno") || msg.includes("dormir") || msg.includes("insonnia")) {
    return `Per migliorare il sonno naturalmente: tisana di valeriana e melissa 1h prima di dormire, frequenza 396Hz o 174Hz come sottofondo serale, e spegni gli schermi 45 minuti prima. La melatonina si produce meglio al buio completo.`;
  }
  if (msg.includes("tisana") || msg.includes("erbe")) {
    return `Le tisane più potenti per il benessere: 🌿 Mattino → Zenzero + limone + curcuma (anti-infiammatoria). 🌿 Pomeriggio → Verde matcha + menta (energia pulita). 🌿 Sera → Melissa + valeriana + camomilla (rilassamento profondo). 🌿 Digestione → Finocchio + anice + liquirizia.`;
  }
  if (msg.includes("frequen") || msg.includes("hz") || msg.includes("solfeggio")) {
    return `Le frequenze Solfeggio più utili per la tua situazione: 528Hz (riparazione e trasformazione — ottima al mattino), 432Hz (armonia — per lavoro e concentrazione), 174Hz (riduzione stress — prima di dormire). Usale con cuffie per massimizzare l'effetto.`;
  }
  if (msg.includes("alimenta") || msg.includes("cibo") || msg.includes("mangio")) {
    return `Per ottimizzare energia e vitalità con l'alimentazione: colazione ricca di proteine e grassi buoni (uova, avocado, noci). Riduci zuccheri raffinati che causano picchi glicemici. Integra curcuma, zenzero e pepe nero quotidianamente. Idratazione: minimo 2L di acqua al giorno.`;
  }
  if (msg.includes("medita") || msg.includes("respiro") || msg.includes("stress")) {
    return `Tecnica di respirazione 4-7-8: inspira per 4 secondi, trattieni per 7, espira per 8. Ripeti 4 volte. Abbinala alla frequenza 396Hz. Per la meditazione: inizia con solo 5 minuti al mattino appena sveglio, prima di guardare il telefono.`;
  }
  if (msg.includes("peso") || msg.includes("dimagrire") || msg.includes("forma")) {
    const w = profile?.peso;
    const h = profile?.altezza;
    if (w && h) {
      const bmi = (w / ((h / 100) ** 2)).toFixed(1);
      return `Il tuo BMI attuale è ${bmi}. Senza farmaci: digiuno intermittente 16:8 (mangia in una finestra di 8 ore), cammina 7000-10000 passi al giorno, elimina bevande zuccherate. L'acqua fredda al mattino accelera il metabolismo del 30%.`;
    }
    return `Per il peso: digiuno intermittente 16:8, camminata quotidiana, eliminare zuccheri aggiunti. Aggiorna il tuo profilo con peso e altezza per consigli più precisi.`;
  }
  return `Sono in modalità offline, ${name}. Ho elaborato ${history.length} giorni di dati su di te. Posso aiutarti su: energia, sonno, alimentazione, tisane, frequenze, respirazione, meditazione. Cosa ti serve?`;
}

// ═══════════════════════════════════════════════════════════
// CLAUDE API CALL
// ═══════════════════════════════════════════════════════════
async function callClaude(messages, profile, history) {
  const systemPrompt = `Sei l'IA di benessere dell'app "Road to Akasha". Il tuo nome è Akasha.
Utente: ${profile?.name || "Viaggiatore"}, ${profile?.eta || "??"} anni, peso ${profile?.peso || "??"}kg, altezza ${profile?.altezza || "??"}cm.
BMI: ${profile?.peso && profile?.altezza ? (profile.peso / ((profile.altezza / 100) ** 2)).toFixed(1) : "??"}
Obiettivo: ${profile?.obiettivo || "benessere generale"}
Ultimi 7 giorni — media energia: ${history.slice(-7).reduce((s, d) => s + (d.energia || 5), 0) / Math.max(history.slice(-7).length, 1) | 0}/10, media sonno: ${(history.slice(-7).reduce((s, d) => s + (d.sonno || 7), 0) / Math.max(history.slice(-7).length, 1)).toFixed(1)}h

Rispondi SEMPRE in italiano. Dai consigli PRATICI e NATURALI: frequenze (Hz specifici), tisane, alimentazione, respirazione, meditazione, cromoterapia, aromaterapia. MAI farmaci o medicine. Sii caldo, motivante, come un coach personale che conosce bene questa persona. Massimo 200 parole per risposta.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content }))
    })
  });
  const data = await response.json();
  return data.content?.[0]?.text || "Connessione persa. Riprova tra poco.";
}

// ═══════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════

function Btn({ children, onClick, style, variant = "primary", small }) {
  const base = {
    border: "none", borderRadius: small ? 10 : 14, cursor: "pointer",
    fontFamily: "'Nunito', sans-serif", fontWeight: 700,
    padding: small ? "8px 16px" : "14px 24px",
    fontSize: small ? 13 : 15, transition: "all 0.2s",
    letterSpacing: 0.3,
  };
  const variants = {
    primary: { background: T.grad1, color: "#fff" },
    secondary: { background: T.card, color: T.text, border: `1px solid ${T.border}` },
    ghost: { background: "transparent", color: T.accent1, border: `1px solid ${T.accent1}` },
    success: { background: "linear-gradient(135deg, #00d4aa, #2ed573)", color: "#fff" },
  };
  return <button style={{ ...base, ...variants[variant], ...style }} onClick={onClick}>{children}</button>;
}

function Card({ children, style, glow }) {
  return (
    <div style={{
      background: T.gradCard, borderRadius: 20, padding: 20,
      border: `1px solid ${T.border}`,
      boxShadow: glow ? `0 0 20px ${T.accent1}33` : "0 4px 20px #00000066",
      ...style
    }}>{children}</div>
  );
}

function Slider({ label, value, onChange, min = 1, max = 10, color = T.accent1 }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ color: T.muted, fontSize: 13 }}>{label}</span>
        <span style={{ color, fontWeight: 700, fontSize: 15 }}>{value}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color, cursor: "pointer" }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SCREENS
// ═══════════════════════════════════════════════════════════

function OnboardingScreen({ onDone }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: "", eta: "", peso: "", altezza: "", obiettivo: "energia e vitalità" });

  const steps = [
    {
      title: "Benvenuto nel\nViaggio",
      sub: "Road to Akasha è il tuo compagno di benessere personale. Inizia creando il tuo profilo.",
      field: null, cta: "Inizia il Viaggio"
    },
    { title: "Come ti chiami?", sub: "L'IA imparerà a conoscerti per nome.", field: "name", placeholder: "Il tuo nome", cta: "Avanti" },
    { title: "Quanti anni hai?", sub: "L'età aiuta a personalizzare i consigli.", field: "eta", placeholder: "Anni", type: "number", cta: "Avanti" },
    { title: "Il tuo peso", sub: "In chilogrammi. Puoi aggiornarlo ogni giorno.", field: "peso", placeholder: "kg", type: "number", cta: "Avanti" },
    { title: "La tua altezza", sub: "In centimetri.", field: "altezza", placeholder: "cm", type: "number", cta: "Avanti" },
    { title: "Il tuo obiettivo principale", sub: "Su cosa vuoi concentrarti?", field: "obiettivo", isSelect: true, cta: "Inizia →" },
  ];

  const cur = steps[step];
  const obiettivi = ["energia e vitalità", "perdere peso", "migliorare il sonno", "ridurre lo stress", "benessere generale 360°"];

  const next = () => {
    if (step < steps.length - 1) setStep(s => s + 1);
    else {
      DB.set("profile", { ...data, createdAt: new Date().toISOString() });
      DB.set("onboarded", true);
      onDone(data);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: 24,
      fontFamily: "'Nunito', sans-serif"
    }}>
      {/* Progress dots */}
      <div style={{ display: "flex", gap: 8, marginBottom: 40 }}>
        {steps.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 24 : 8, height: 8, borderRadius: 4,
            background: i <= step ? T.accent1 : T.border,
            transition: "all 0.3s"
          }} />
        ))}
      </div>

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 24, margin: "0 auto 16px",
          background: T.grad1, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36, boxShadow: `0 0 40px ${T.accent1}66`
        }}>✦</div>
        <div style={{ color: T.accent1, fontSize: 11, letterSpacing: 4, fontWeight: 700 }}>ROAD TO</div>
        <div style={{ color: T.text, fontSize: 26, fontWeight: 800, letterSpacing: 1 }}>AKASHA</div>
      </div>

      <Card style={{ width: "100%", maxWidth: 360 }}>
        <h2 style={{ color: T.text, fontSize: 22, fontWeight: 800, marginBottom: 8, whiteSpace: "pre-line", textAlign: "center" }}>
          {cur.title}
        </h2>
        <p style={{ color: T.muted, fontSize: 14, textAlign: "center", marginBottom: 24, lineHeight: 1.6 }}>
          {cur.sub}
        </p>

        {cur.field && !cur.isSelect && (
          <input
            type={cur.type || "text"}
            placeholder={cur.placeholder}
            value={data[cur.field]}
            onChange={e => setData({ ...data, [cur.field]: e.target.value })}
            style={{
              width: "100%", padding: "14px 16px", borderRadius: 12, border: `1px solid ${T.border}`,
              background: T.surface, color: T.text, fontSize: 16, marginBottom: 20,
              fontFamily: "'Nunito', sans-serif", boxSizing: "border-box", outline: "none"
            }}
          />
        )}

        {cur.isSelect && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {obiettivi.map(o => (
              <div key={o} onClick={() => setData({ ...data, obiettivo: o })} style={{
                padding: "12px 16px", borderRadius: 12, cursor: "pointer",
                border: `1px solid ${data.obiettivo === o ? T.accent1 : T.border}`,
                background: data.obiettivo === o ? `${T.accent1}22` : T.surface,
                color: data.obiettivo === o ? T.accent1 : T.text,
                fontSize: 14, fontWeight: data.obiettivo === o ? 700 : 400,
                transition: "all 0.2s"
              }}>{o}</div>
            ))}
          </div>
        )}

        <Btn onClick={next} style={{ width: "100%" }}>{cur.cta}</Btn>
      </Card>
    </div>
  );
}

function DashboardScreen({ profile, checkins, navigate }) {
  const today = checkins[checkins.length - 1];
  const bmi = profile?.peso && profile?.altezza
    ? (profile.peso / ((profile.altezza / 100) ** 2)).toFixed(1) : null;
  const bmiLabel = bmi < 18.5 ? "Sottopeso" : bmi < 25 ? "Normale" : bmi < 30 ? "Sovrappeso" : "Obesità";
  const bmiColor = bmi < 18.5 ? "#1e90ff" : bmi < 25 ? T.accent3 : bmi < 30 ? T.accent2 : "#ff4757";

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buongiorno";
    if (h < 18) return "Buon pomeriggio";
    return "Buonasera";
  };

  const weekEnergy = checkins.slice(-7).map((c, i) => ({ day: ["L","M","M","G","V","S","D"][i % 7], val: c.energia || 0 }));

  return (
    <div style={{ padding: "0 0 100px", fontFamily: "'Nunito', sans-serif" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        padding: "50px 24px 30px", position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: -40, right: -40, width: 200, height: 200,
          borderRadius: "50%", background: `${T.accent1}22`
        }} />
        <div style={{ color: T.muted, fontSize: 13 }}>{greet()},</div>
        <div style={{ color: T.text, fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
          {profile?.name || "Viaggiatore"} ✦
        </div>
        <div style={{ color: T.muted, fontSize: 12 }}>
          Il tuo viaggio verso Akasha continua
        </div>
      </div>

      <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { label: "Peso", val: `${profile?.peso || "--"} kg`, color: T.accent1 },
            { label: "BMI", val: bmi || "--", color: bmiColor, sub: bmiLabel },
            { label: "Giorni", val: checkins.length, color: T.accent3, sub: "di tracking" },
          ].map(s => (
            <Card key={s.label} style={{ padding: 14, textAlign: "center" }}>
              <div style={{ color: s.color, fontSize: 20, fontWeight: 800 }}>{s.val}</div>
              <div style={{ color: T.muted, fontSize: 11 }}>{s.label}</div>
              {s.sub && <div style={{ color: s.color, fontSize: 10, marginTop: 2 }}>{s.sub}</div>}
            </Card>
          ))}
        </div>

        {/* Today energy */}
        {today && (
          <Card glow>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ color: T.text, fontWeight: 700 }}>Oggi</span>
              <span style={{ color: T.muted, fontSize: 12 }}>{new Date().toLocaleDateString("it-IT")}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "⚡ Energia", val: today.energia, max: 10, color: T.accent1 },
                { label: "😴 Sonno", val: today.sonno, max: 10, color: T.accent4 },
                { label: "😊 Umore", val: today.umore, max: 10, color: T.accent3 },
                { label: "🏃 Attività", val: today.attivita, max: 10, color: T.accent2 },
              ].map(item => (
                <div key={item.label} style={{ background: T.surface, borderRadius: 12, padding: 10 }}>
                  <div style={{ color: T.muted, fontSize: 11, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ color: item.color, fontWeight: 800, fontSize: 18 }}>{item.val || "--"}<span style={{ fontSize: 10, color: T.muted }}>/10</span></div>
                  <div style={{ height: 3, background: T.border, borderRadius: 2, marginTop: 6 }}>
                    <div style={{ height: 3, width: `${((item.val || 0) / item.max) * 100}%`, background: item.color, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {!today && (
          <Card style={{ textAlign: "center", padding: 30 }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🌅</div>
            <div style={{ color: T.text, fontWeight: 700, marginBottom: 8 }}>Inizia il check-in di oggi</div>
            <div style={{ color: T.muted, fontSize: 13, marginBottom: 16 }}>Registra come stai per personalizzare i tuoi consigli</div>
            <Btn onClick={() => navigate("checkin")} small>Fai il check-in →</Btn>
          </Card>
        )}

        {/* Weekly energy chart */}
        {checkins.length > 1 && (
          <Card>
            <div style={{ color: T.text, fontWeight: 700, marginBottom: 14 }}>⚡ Energia — ultimi 7 giorni</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
              {checkins.slice(-7).map((c, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: "100%", borderRadius: "4px 4px 0 0",
                    height: `${((c.energia || 0) / 10) * 54}px`,
                    background: `linear-gradient(to top, ${T.accent1}, ${T.accent2})`,
                    minHeight: 3
                  }} />
                  <div style={{ color: T.muted, fontSize: 9 }}>{["L","M","M","G","V","S","D"][i]}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { icon: "🎵", label: "Frequenze", screen: "frequenze", color: T.accent4 },
            { icon: "🤖", label: "Parla con Akasha", screen: "ia", color: T.accent1 },
            { icon: "📖", label: "Il tuo Book", screen: "book", color: T.accent3 },
            { icon: "📊", label: "Progressi", screen: "progressi", color: T.accent2 },
          ].map(a => (
            <Card key={a.label} style={{ padding: 16, cursor: "pointer", textAlign: "center" }}
              onClick={() => navigate(a.screen)}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{a.icon}</div>
              <div style={{ color: a.color, fontSize: 13, fontWeight: 700 }}>{a.label}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function CheckinScreen({ profile, onSave }) {
  const today = new Date().toISOString().split("T")[0];
  const [data, setData] = useState({
    date: today, energia: 5, umore: 5, sonno: 7,
    attivita: 5, peso: profile?.peso || "", alimentazione: ""
  });
  const [saved, setSaved] = useState(false);

  const save = () => {
    const checkins = DB.get("checkins") || [];
    const existing = checkins.findIndex(c => c.date === today);
    if (existing >= 0) checkins[existing] = data;
    else checkins.push(data);
    DB.set("checkins", checkins);
    if (data.peso) DB.update("profile", { peso: Number(data.peso) });
    setSaved(true);
    onSave(checkins);
  };

  if (saved) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Nunito', sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
        <div style={{ color: T.text, fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Check-in salvato!</div>
        <div style={{ color: T.muted, fontSize: 14 }}>Akasha ha aggiornato il tuo profilo</div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "70px 16px 100px", fontFamily: "'Nunito', sans-serif" }}>
      <h2 style={{ color: T.text, fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Check-in 🌅</h2>
      <p style={{ color: T.muted, fontSize: 13, marginBottom: 24 }}>{new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}</p>

      <Card style={{ marginBottom: 16 }}>
        <Slider label="⚡ Livello Energia" value={data.energia} onChange={v => setData({ ...data, energia: v })} color={T.accent1} />
        <Slider label="😊 Umore" value={data.umore} onChange={v => setData({ ...data, umore: v })} color={T.accent3} />
        <Slider label="😴 Qualità Sonno" value={data.sonno} onChange={v => setData({ ...data, sonno: v })} color={T.accent4} />
        <Slider label="🏃 Attività Fisica" value={data.attivita} onChange={v => setData({ ...data, attivita: v })} color={T.accent2} />
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: T.text, fontWeight: 700, marginBottom: 12 }}>⚖️ Peso di oggi</div>
        <input type="number" placeholder={`${profile?.peso || "--"} kg`} value={data.peso}
          onChange={e => setData({ ...data, peso: e.target.value })}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, color: T.text, fontSize: 16, fontFamily: "'Nunito', sans-serif", boxSizing: "border-box", outline: "none" }} />
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ color: T.text, fontWeight: 700, marginBottom: 12 }}>🥗 Cosa hai mangiato oggi?</div>
        <textarea placeholder="Note sull'alimentazione..." value={data.alimentazione}
          onChange={e => setData({ ...data, alimentazione: e.target.value })}
          rows={3} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, color: T.text, fontSize: 14, fontFamily: "'Nunito', sans-serif", resize: "none", boxSizing: "border-box", outline: "none" }} />
      </Card>

      <Btn onClick={save} style={{ width: "100%" }}>Salva Check-in ✓</Btn>
    </div>
  );
}

function IAScreen({ia: <IAScreen profile={profile} checkins={checkins} navigate={navigate} />, }) {
  const [messages, setMessages] = useState(() => DB.get("chat_history") || [
    { role: "assistant", content: `Ciao ${profile?.name || "Viaggiatore"}! Sono Akasha, la tua guida nel viaggio verso il benessere. Ho già analizzato i tuoi ${checkins.length} giorni di dati. Come posso aiutarti oggi?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(!navigator.onLine);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    DB.set("chat_history", messages.slice(-50));
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      if (navigator.onLine) {
        const reply = await callClaude(newMsgs.slice(-10), profile, checkins);
        setMessages(m => [...m, { role: "assistant", content: reply }]);
        setOffline(false);
      } else {
        throw new Error("offline");
      }
    } catch {
      setOffline(true);
      const reply = offlineAI(input, profile, checkins);
      setMessages(m => [...m, { role: "assistant", content: reply, offline: true }]);
    }
    setLoading(false);
  };

  const suggestions = ["Cosa mi consiglia per avere più energia?", "Quale tisana mi fa bene oggi?", "Suggeriscimi una frequenza", "Come posso dormire meglio?"];

  return (
    <div{/* BACK BUTTON HEADER */}
<div style={{
  padding: "12px",
  background: T.surface,
  display: "flex",
  alignItems: "center",
  gap: 10,
  borderBottom: `1px solid ${T.border}`
}}>
  <button
    onClick={() => navigate("home")}
    style={{
      background: "transparent",
      border: "1px solid " + T.border,
      color: T.text,
      padding: "6px 10px",
      borderRadius: 8,
      cursor: "pointer"
    }}
  >
    ← Indietro
  </button>

  <div style={{ color: T.text, fontWeight: 700 }}>
    Akasha IA
  </div>
</div> style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Nunito', sans-serif", background: T.bg }}>
      {/* Header */}
      <div style={{ padding: "50px 20px 16px", background: T.surface, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 14, background: T.grad1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>✦</div>
          <div>
            <div style={{ color: T.text, fontWeight: 800 }}>Akasha IA</div>
            <div style={{ color: offline ? "#ffa502" : T.accent3, fontSize: 11 }}>{offline ? "● Modalità offline" : "● Online"}</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "80%", padding: "12px 16px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: m.role === "user" ? T.grad1 : T.card,
              color: T.text, fontSize: 14, lineHeight: 1.6,
              border: m.role === "assistant" ? `1px solid ${T.border}` : "none",
              boxShadow: m.offline ? `0 0 10px #ffa50233` : "none"
            }}>
              {m.offline && <div style={{ color: "#ffa502", fontSize: 10, marginBottom: 4 }}>● risposta offline</div>}
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 4, padding: "12px 16px" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent1, animation: `pulse 1s ${i * 0.2}s infinite` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div style={{ padding: "0 16px 8px", display: "flex", gap: 8, overflowX: "auto" }}>
          {suggestions.map(s => (
            <div key={s} onClick={() => setInput(s)} style={{
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 20,
              padding: "8px 14px", color: T.muted, fontSize: 12, whiteSpace: "nowrap", cursor: "pointer"
            }}>{s}</div>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "12px 16px 30px", background: T.surface, borderTop: `1px solid ${T.border}`, display: "flex", gap: 10 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Chiedi ad Akasha..."
          style={{ flex: 1, padding: "12px 16px", borderRadius: 20, border: `1px solid ${T.border}`, background: T.card, color: T.text, fontSize: 14, fontFamily: "'Nunito', sans-serif", outline: "none" }} />
        <button onClick={send} disabled={loading || !input.trim()} style={{
          width: 46, height: 46, borderRadius: 14, background: T.grad1, border: "none", cursor: "pointer", fontSize: 18
        }}>↑</button>
      </div>
    </div>
  );
}

function FrequenzeScreen() {
  const audio = useAudio();
  const [searching, setSearching] = useState(null);
  const [videos, setVideos] = useState({});

  const searchVideos = async (freq) => {
    setSearching(freq.hz);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Fornisci 3 link YouTube reali e verificati per la frequenza ${freq.hz}Hz - "${freq.name}". Rispondi SOLO con JSON: {"videos":[{"title":"...","url":"https://youtube.com/watch?v=...","duration":"..."}]}. Solo frequenze pure serie, niente musica commerciale.`
          }]
        })
      });
      const data = await response.json();
      const text = data.content?.[0]?.text || "{}";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setVideos(v => ({ ...v, [freq.hz]: parsed.videos || [] }));
    } catch {
      setVideos(v => ({ ...v, [freq.hz]: [{ title: "Cerca su YouTube: " + freq.hz + "Hz pure tone", url: `https://www.youtube.com/results?search_query=${freq.hz}hz+pure+tone+solfeggio`, duration: "vari" }] }));
    }
    setSearching(null);
  };

  return (
    <div style={{ padding: "70px 16px 100px", fontFamily: "'Nunito', sans-serif" }}>
      <h2 style={{ color: T.text, fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Frequenze Sonore 🎵</h2>
      <p style={{ color: T.muted, fontSize: 13, marginBottom: 24 }}>Genera toni puri o scopri video seri su YouTube</p>

      {audio.playing && (
        <Card glow style={{ marginBottom: 16, background: "linear-gradient(135deg, #1a1a2e, #0f3460)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ color: T.accent1, fontWeight: 800 }}>▶ {audio.playing} Hz</div>
              <div style={{ color: T.muted, fontSize: 12 }}>{FREQS.find(f => f.hz === audio.playing)?.name}</div>
            </div>
            <Btn onClick={audio.stop} variant="ghost" small>⏹ Stop</Btn>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: T.muted, fontSize: 12 }}>🔈</span>
            <input type="range" min="0" max="1" step="0.05" value={audio.vol}
              onChange={e => audio.changeVol(Number(e.target.value))}
              style={{ flex: 1, accentColor: T.accent1 }} />
            <span style={{ color: T.muted, fontSize: 12 }}>🔊</span>
          </div>
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {FREQS.map(freq => (
          <Card key={freq.hz}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: freq.color }} />
                  <span style={{ color: freq.color, fontWeight: 800, fontSize: 16 }}>{freq.hz} Hz</span>
                </div>
                <div style={{ color: T.text, fontWeight: 700, fontSize: 14 }}>{freq.name}</div>
                <div style={{ color: T.muted, fontSize: 12 }}>{freq.desc}</div>
              </div>
              <Btn onClick={() => audio.play(freq.hz)}
                variant={audio.playing === freq.hz ? "ghost" : "primary"} small>
                {audio.playing === freq.hz ? "⏸" : "▶"}
              </Btn>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={() => searchVideos(freq)} variant="secondary" small
                style={{ flex: 1, opacity: searching === freq.hz ? 0.6 : 1 }}>
                {searching === freq.hz ? "⏳ Cerco..." : "🎬 Video YouTube"}
              </Btn>
            </div>

            {videos[freq.hz] && (
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                {videos[freq.hz].map((v, i) => (
                  <a key={i} href={v.url} target="_blank" rel="noopener noreferrer" style={{
                    display: "block", padding: "10px 12px", borderRadius: 10,
                    background: T.surface, border: `1px solid ${T.border}`,
                    color: T.accent3, fontSize: 12, textDecoration: "none", lineHeight: 1.4
                  }}>
                    🎵 {v.title} {v.duration && <span style={{ color: T.muted }}>({v.duration})</span>}
                  </a>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function CalendarioScreen({ profile }) {
  const [view, setView] = useState("oggi");
  const [habits, setHabits] = useState(() => DB.get("habits") || []);
  const [goals, setGoals] = useState(() => DB.get("goals") || []);
  const [newHabit, setNewHabit] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const toggleHabit = (id) => {
    const updated = habits.map(h => {
      if (h.id !== id) return h;
      const done = h.done || [];
      return done.includes(today) ? { ...h, done: done.filter(d => d !== today) } : { ...h, done: [...done, today] };
    });
    setHabits(updated);
    DB.set("habits", updated);
  };

  const addHabit = () => {
    if (!newHabit.trim()) return;
    const updated = [...habits, { id: Date.now(), name: newHabit, done: [], createdAt: today }];
    setHabits(updated);
    DB.set("habits", updated);
    setNewHabit("");
  };

  const toggleGoal = (id) => {
    const updated = goals.map(g => g.id === id ? { ...g, done: !g.done } : g);
    setGoals(updated);
    DB.set("goals", updated);
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    const updated = [...goals, { id: Date.now(), name: newGoal, done: false, date: today }];
    setGoals(updated);
    DB.set("goals", updated);
    setNewGoal("");
  };

  const todayGoals = goals.filter(g => g.date === today);
  const weekGoals = goals.filter(g => g.date >= new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]);
  const weekDone = weekGoals.filter(g => g.done).length;

  return (
    <div style={{ padding: "70px 16px 100px", fontFamily: "'Nunito', sans-serif" }}>
      <h2 style={{ color: T.text, fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Obiettivi & Abitudini 📅</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["oggi", "settimana", "abitudini"].map(v => (
          <Btn key={v} onClick={() => setView(v)} variant={view === v ? "primary" : "secondary"} small style={{ flex: 1, textTransform: "capitalize" }}>{v}</Btn>
        ))}
      </div>

      {view === "oggi" && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ color: T.text, fontWeight: 700, marginBottom: 12 }}>Obiettivi di oggi</div>
            {todayGoals.length === 0 && <div style={{ color: T.muted, fontSize: 13, marginBottom: 12 }}>Nessun obiettivo per oggi. Aggiungine uno!</div>}
            {todayGoals.map(g => (
              <div key={g.id} onClick={() => toggleGoal(g.id)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
                borderBottom: `1px solid ${T.border}`, cursor: "pointer"
              }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${g.done ? T.accent3 : T.border}`, background: g.done ? T.accent3 : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, flexShrink: 0 }}>
                  {g.done ? "✓" : ""}
                </div>
                <span style={{ color: g.done ? T.muted : T.text, textDecoration: g.done ? "line-through" : "none", fontSize: 14 }}>{g.name}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <input value={newGoal} onChange={e => setNewGoal(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addGoal()}
                placeholder="Nuovo obiettivo..." style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, color: T.text, fontSize: 13, fontFamily: "'Nunito', sans-serif", outline: "none" }} />
              <Btn onClick={addGoal} small>+</Btn>
            </div>
          </Card>
        </div>
      )}

      {view === "settimana" && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ color: T.text, fontWeight: 700 }}>Questa settimana</div>
            <div style={{ color: T.accent3, fontWeight: 800 }}>{weekDone}/{weekGoals.length}</div>
          </div>
          <div style={{ height: 6, background: T.border, borderRadius: 3, marginBottom: 16 }}>
            <div style={{ height: 6, width: `${weekGoals.length ? (weekDone / weekGoals.length) * 100 : 0}%`, background: T.grad2, borderRadius: 3, transition: "width 0.4s" }} />
          </div>
          {weekGoals.map(g => (
            <div key={g.id} onClick={() => toggleGoal(g.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", cursor: "pointer" }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${g.done ? T.accent3 : T.border}`, background: g.done ? T.accent3 : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, flexShrink: 0 }}>{g.done ? "✓" : ""}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: g.done ? T.muted : T.text, fontSize: 13, textDecoration: g.done ? "line-through" : "none" }}>{g.name}</div>
                <div style={{ color: T.muted, fontSize: 10 }}>{g.date}</div>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <input value={newGoal} onChange={e => setNewGoal(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addGoal()}
              placeholder="Aggiungi obiettivo..." style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, color: T.text, fontSize: 13, fontFamily: "'Nunito', sans-serif", outline: "none" }} />
            <Btn onClick={addGoal} small>+</Btn>
          </div>
        </Card>
      )}

      {view === "abitudini" && (
        <Card>
          <div style={{ color: T.text, fontWeight: 700, marginBottom: 12 }}>Habit Tracker</div>
          {habits.map(h => {
            const streak = (() => {
              let s = 0, d = new Date();
              while (h.done?.includes(d.toISOString().split("T")[0])) { s++; d.setDate(d.getDate() - 1); }
              return s;
            })();
            const doneToday = h.done?.includes(today);
            return (
              <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
                <div onClick={() => toggleHabit(h.id)} style={{ width: 32, height: 32, borderRadius: 10, border: `2px solid ${doneToday ? T.accent3 : T.border}`, background: doneToday ? T.accent3 : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16 }}>
                  {doneToday ? "✓" : ""}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: T.text, fontSize: 14 }}>{h.name}</div>
                  <div style={{ color: T.accent2, fontSize: 11 }}>{streak > 0 ? `🔥 ${streak} giorni di fila` : "Inizia oggi!"}</div>
                </div>
                <div style={{ display: "flex", gap: 2 }}>
                  {Array(7).fill(0).map((_, i) => {
                    const d = new Date(); d.setDate(d.getDate() - 6 + i);
                    const ds = d.toISOString().split("T")[0];
                    return <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: h.done?.includes(ds) ? T.accent3 : T.border }} />;
                  })}
                </div>
              </div>
            );
          })}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <input value={newHabit} onChange={e => setNewHabit(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addHabit()}
              placeholder="Nuova abitudine..." style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, color: T.text, fontSize: 13, fontFamily: "'Nunito', sans-serif", outline: "none" }} />
            <Btn onClick={addHabit} small>+</Btn>
          </div>
        </Card>
      )}
    </div>
  );
}

function BookScreen({ profile, checkins useEffect(() => {
  if (active === "book") {
    setBook(DB.get("book"));
  }
}, [active]); }) {
  const [book, setBook] = useState(() => DB.get("book") || null);
  const [loading, setLoading] = useState(false);

  const generateBook = async () => {
    setLoading(true);
    const avgEnergy = checkins.slice(-14).reduce((s, d) => s + (d.energia || 5), 0) / Math.max(checkins.slice(-14).length, 1);
    const avgSleep = checkins.slice(-14).reduce((s, d) => s + (d.sonno || 7), 0) / Math.max(checkins.slice(-14).length, 1);
    const avgMood = checkins.slice(-14).reduce((s, d) => s + (d.umore || 5), 0) / Math.max(checkins.slice(-14).length, 1);
    const trend = checkins.length > 7 ? (checkins.slice(-3).reduce((s,d)=>s+(d.energia||5),0)/3 > checkins.slice(-7,-4).reduce((s,d)=>s+(d.energia||5),0)/3 ? "crescente" : "stabile") : "inizio viaggio";

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Crea il "Book di Akasha" per ${profile?.name}, ${profile?.eta || "??"} anni. Dati: energia media ${avgEnergy.toFixed(1)}/10, sonno medio ${avgSleep.toFixed(1)}h, umore medio ${avgMood.toFixed(1)}/10, trend: ${trend}, giorni tracciati: ${checkins.length}, obiettivo: ${profile?.obiettivo}.
Scrivi in italiano, come un libro personale diviso in sezioni:
1. 📊 IL TUO STATO ATTUALE
2. 🎯 I TUOI PATTERN
3. 🌿 PROTOCOLLO PERSONALIZZATO (tisane, frequenze, alimentazione)
4. 🚀 IL PROSSIMO STEP
Massimo 400 parole, tono ispirante e personale.`
          }]
        })
      });
      const data = await response.json();
      const content = data.content?.[0]?.text || "Errore nella generazione.";
      const newBook = { content, generatedAt: new Date().toISOString(), days: checkins.length };
      setBook(newBook);
      DB.set("book", newBook);
    } catch {
      setBook({ content: `📖 Book offline per ${profile?.name}:\n\nHai tracciato ${checkins.length} giorni. Connettiti per generare il tuo Book personalizzato completo.`, generatedAt: new Date().toISOString(), days: checkins.length });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "70px 16px 100px", fontFamily: "'Nunito', sans-serif" }}>
      <h2 style={{ color: T.text, fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Book di Akasha 📖</h2>
      <p style={{ color: T.muted, fontSize: 13, marginBottom: 20 }}>Il tuo diario personale scritto dall'IA</p>

      {!book && (
        <Card style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 50, marginBottom: 12 }}>📖</div>
          <div style={{ color: T.text, fontWeight: 700, marginBottom: 8 }}>Il tuo Book è vuoto</div>
          <div style={{ color: T.muted, fontSize: 13, marginBottom: 20 }}>Akasha analizzerà i tuoi dati e scriverà il tuo profilo di benessere personale</div>
          <Btn onClick={generateBook}>{loading ? "⏳ Scrittura in corso..." : "✦ Genera il mio Book"}</Btn>
        </Card>
      )}

      {book && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ color: T.muted, fontSize: 12 }}>
              Aggiornato: {new Date(book.generatedAt).toLocaleDateString("it-IT")} · {book.days} giorni
            </div>
            <Btn onClick={generateBook} variant="ghost" small>{loading ? "⏳" : "🔄 Aggiorna"}</Btn>
          </div>
          <Card style={{ lineHeight: 1.8 }}>
            {book.content.split("\n").map((line, i) => (
              <div key={i} style={{
                color: line.startsWith("##") || line.match(/^[1-4]\./) || line.includes("📊") || line.includes("🎯") || line.includes("🌿") || line.includes("🚀") ? T.accent1 : line ? T.text : T.muted,
                fontWeight: line.includes("📊") || line.includes("🎯") || line.includes("🌿") || line.includes("🚀") ? 800 : 400,
                fontSize: line.includes("📊") || line.includes("🎯") || line.includes("🌿") || line.includes("🚀") ? 16 : 14,
                marginTop: line.includes("📊") || line.includes("🎯") || line.includes("🌿") || line.includes("🚀") ? 16 : 0,
                minHeight: line ? "auto" : 8
              }}>{line || " "}</div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

function ProgressiScreen({ checkins, profile }) {
  const last30 = checkins.slice(-30);
  if (last30.length === 0) return (
    <div style={{ padding: "70px 16px", fontFamily: "'Nunito', sans-serif", textAlign: "center" }}>
      <div style={{ fontSize: 50, marginBottom: 12 }}>📊</div>
      <div style={{ color: T.text, fontWeight: 700 }}>Nessun dato ancora</div>
      <div style={{ color: T.muted, fontSize: 13, marginTop: 8 }}>Fai il check-in quotidiano per vedere i tuoi progressi</div>
    </div>
  );

  const metrics = [
    { key: "energia", label: "⚡ Energia", color: T.accent1 },
    { key: "umore", label: "😊 Umore", color: T.accent3 },
    { key: "sonno", label: "😴 Sonno", color: T.accent4 },
    { key: "attivita", label: "🏃 Attività", color: T.accent2 },
  ];

  const Chart = ({ metric }) => {
    const vals = last30.map(c => c[metric.key] || 0);
    const max = Math.max(...vals, 1);
    const avg = (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1);

    return (
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ color: T.text, fontWeight: 700 }}>{metric.label}</div>
          <div style={{ color: metric.color, fontWeight: 800 }}>Media: {avg}/10</div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 50 }}>
          {vals.map((v, i) => (
            <div key={i} style={{ flex: 1, borderRadius: "2px 2px 0 0", height: `${(v / max) * 48}px`, background: metric.color, opacity: 0.6 + (i / vals.length) * 0.4, minHeight: 2 }} />
          ))}
        </div>
      </Card>
    );
  };

  return (
    <div style={{ padding: "70px 16px 100px", fontFamily: "'Nunito', sans-serif" }}>
      <h2 style={{ color: T.text, fontSize: 22, fontWeight: 800, marginBottom: 4 }}>I tuoi Progressi 📈</h2>
      <p style={{ color: T.muted, fontSize: 13, marginBottom: 20 }}>Ultimi {last30.length} giorni di dati</p>
      {metrics.map(m => <Chart key={m.key} metric={m} />)}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// BOTTOM NAV
// ═══════════════════════════════════════════════════════════
function BottomNav({ active, navigate }) {
  const tabs = [
    { id: "home", icon: "⬡", label: "Home" },
    { id: "checkin", icon: "✦", label: "Check-in" },
    { id: "calendario", icon: "◈", label: "Obiettivi" },
    { id: "ia", icon: "◉", label: "Akasha" },
    { id: "frequenze", icon: "♫", label: "Suoni" },
  ];

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: T.surface, borderTop: `1px solid ${T.border}`,
      display: "flex", padding: "8px 0 16px",
      zIndex: 100
    }}>
      {tabs.map(t => (
        <div key={t.id} onClick={() => navigate(t.id)} style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          cursor: "pointer", padding: "4px 0"
        }}>
          <div style={{ fontSize: 20, color: active === t.id ? T.accent1 : T.muted, transition: "color 0.2s" }}>
            {t.icon}
          </div>
          <div style={{ fontSize: 9, color: active === t.id ? T.accent1 : T.muted, fontFamily: "'Nunito', sans-serif", fontWeight: active === t.id ? 700 : 400 }}>
            {t.label}
          </div>
          {active === t.id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: T.accent1 }} />}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [onboarded] = useState(() => DB.get("onboarded"));
  const [profile, setProfile] = useState(() => DB.get("profile") || {});
  const [checkins, setCheckins] = useState(() => DB.get("checkins") || []);
  const [screen, setScreen] = useState("home");

  const navigate = (s) => setScreen(s);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
      body { background: ${T.bg}; overflow-x: hidden; }
      ::-webkit-scrollbar { width: 0; }
      @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
      input[type=range] { height: 4px; }
    `;
    document.head.appendChild(style);
  }, []);

  if (!onboarded) return (
    <OnboardingScreen onDone={(p) => { setProfile(p); window.location.reload(); }} />
  );

  const screens = {
    home: <DashboardScreen profile={profile} checkins={checkins} navigate={navigate} />,
    checkin: <CheckinScreen profile={profile} onSave={setCheckins} />,
    calendario: <CalendarioScreen profile={profile} />,
    ia: <IAScreen profile={profile} checkins={checkins} />,
    frequenze: <FrequenzeScreen />,
    book: <BookScreen profile={profile} checkins={checkins} />,
    progressi: <ProgressiScreen checkins={checkins} profile={profile} />,
  };

  const noNav = ["ia"];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", maxWidth: 480, margin: "0 auto", position: "relative" }}>
      {screens[screen] || screens.home}
      {!noNav.includes(screen) && <BottomNav active={screen} navigate={navigate} />}
    </div>
  );
}
