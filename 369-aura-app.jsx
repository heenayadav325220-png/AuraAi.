import { useState, useEffect, useRef } from "react";

// ─── PALETTE & CONSTANTS ────────────────────────────────────────────────────
const COLORS = {
  void: "#050508",
  deep: "#0a0a14",
  surface: "#10101e",
  panel: "#14141f",
  border: "#1e1e30",
  gold: "#c9a84c",
  goldLight: "#f0cc7a",
  goldGlow: "rgba(201,168,76,0.15)",
  violet: "#7b4fd4",
  violetGlow: "rgba(123,79,212,0.2)",
  aura: "#9b6ef3",
  auraGlow: "rgba(155,110,243,0.3)",
  teal: "#4ecdc4",
  text: "#e8e0ff",
  textDim: "#7a7499",
  textFaint: "#3a3558",
};

const AFFIRMATIONS = [
  "Energy flows where attention goes. Focus on your growth today.",
  "You are the architect of your own reality. Build with intention.",
  "Every thought you plant today blooms into tomorrow's harvest.",
  "The universe conspires in favor of those who dare to believe.",
  "Your consistency is creating momentum beyond what you can see.",
];

// ─── STYLES ─────────────────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById("aura-styles")) return;
  const style = document.createElement("style");
  style.id = "aura-styles";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Raleway:ital,wght@0,300;0,400;0,500;1,300&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body { background: #050508; }

    .aura-root {
      font-family: 'Raleway', sans-serif;
      background: #050508;
      color: #e8e0ff;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      overflow-x: hidden;
    }

    .aura-root::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        radial-gradient(ellipse 60% 40% at 50% 0%, rgba(123,79,212,0.12) 0%, transparent 70%),
        radial-gradient(ellipse 40% 30% at 100% 80%, rgba(201,168,76,0.06) 0%, transparent 60%),
        radial-gradient(ellipse 30% 20% at 0% 60%, rgba(78,205,196,0.05) 0%, transparent 60%);
      pointer-events: none;
      z-index: 0;
    }

    .stars {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }

    .star {
      position: absolute;
      border-radius: 50%;
      background: white;
      animation: twinkle var(--dur, 3s) ease-in-out infinite var(--delay, 0s);
    }

    @keyframes twinkle {
      0%, 100% { opacity: var(--min-op, 0.1); transform: scale(1); }
      50% { opacity: var(--max-op, 0.7); transform: scale(1.3); }
    }

    .aura-shell {
      width: 100%;
      max-width: 420px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 1;
      background: linear-gradient(180deg, rgba(10,10,20,0.97) 0%, rgba(5,5,8,0.99) 100%);
      border-left: 1px solid #1e1e30;
      border-right: 1px solid #1e1e30;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 20px 14px;
      border-bottom: 1px solid #1e1e30;
      background: rgba(10,10,20,0.9);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .header-title {
      font-family: 'Cinzel', serif;
      font-size: 13px;
      letter-spacing: 3px;
      color: #c9a84c;
      text-transform: uppercase;
    }

    .icon-btn {
      width: 36px; height: 36px;
      border-radius: 50%;
      border: 1px solid #1e1e30;
      background: #10101e;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      font-size: 15px;
      transition: border-color 0.2s, background 0.2s;
      color: #7a7499;
    }

    .icon-btn:hover { border-color: #c9a84c; background: rgba(201,168,76,0.1); }

    .screen {
      flex: 1;
      padding: 24px 20px 120px;
      display: flex;
      flex-direction: column;
      gap: 22px;
      animation: fadeIn 0.4s ease;
    }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    .aura-circle-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      padding: 10px 0 4px;
    }

    .aura-orbit {
      position: relative;
      width: 160px;
      height: 160px;
    }

    .aura-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      animation: spinRing var(--s, 8s) linear infinite var(--rev, normal);
      border: 1px solid transparent;
    }

    .ring-1 { border-top-color: rgba(201,168,76,0.6); border-right-color: rgba(201,168,76,0.2); --s: 6s; }
    .ring-2 { inset: 8px; border-bottom-color: rgba(155,110,243,0.5); border-left-color: rgba(155,110,243,0.2); --s: 9s; --rev: reverse; }
    .ring-3 { inset: 18px; border-top-color: rgba(78,205,196,0.4); --s: 12s; }

    @keyframes spinRing { to { transform: rotate(360deg); } }

    .aura-core {
      position: absolute;
      inset: 28px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, rgba(201,168,76,0.25) 0%, rgba(123,79,212,0.35) 40%, rgba(78,205,196,0.15) 80%, transparent 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Cinzel', serif;
      font-size: 11px;
      letter-spacing: 1.5px;
      color: #f0cc7a;
      box-shadow: 0 0 30px rgba(123,79,212,0.4), 0 0 60px rgba(123,79,212,0.15), inset 0 0 20px rgba(201,168,76,0.1);
      animation: pulseCore 3s ease-in-out infinite;
    }

    @keyframes pulseCore {
      0%, 100% { box-shadow: 0 0 30px rgba(123,79,212,0.4), 0 0 60px rgba(123,79,212,0.15), inset 0 0 20px rgba(201,168,76,0.1); }
      50% { box-shadow: 0 0 50px rgba(123,79,212,0.6), 0 0 80px rgba(123,79,212,0.25), inset 0 0 30px rgba(201,168,76,0.2); }
    }

    .streak-badge {
      display: flex;
      align-items: center;
      gap: 7px;
      background: linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.05));
      border: 1px solid rgba(201,168,76,0.25);
      border-radius: 20px;
      padding: 7px 16px;
      font-size: 13px;
      color: #f0cc7a;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .greeting { text-align: center; padding: 0 10px; }

    .greeting-name {
      font-family: 'Cinzel', serif;
      font-size: 11px;
      letter-spacing: 3px;
      color: #7a7499;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .greeting-line { font-size: 15px; font-style: italic; font-weight: 300; color: #e8e0ff; line-height: 1.5; }

    .thought-card {
      background: linear-gradient(135deg, rgba(123,79,212,0.08), rgba(201,168,76,0.04));
      border: 1px solid rgba(123,79,212,0.2);
      border-radius: 14px;
      padding: 18px 20px;
      position: relative;
      overflow: hidden;
    }

    .thought-card::before {
      content: '✦';
      position: absolute;
      top: -8px; right: 16px;
      font-size: 48px;
      color: rgba(123,79,212,0.08);
      line-height: 1;
    }

    .thought-label {
      font-family: 'Cinzel', serif;
      font-size: 9px;
      letter-spacing: 3px;
      color: #9b6ef3;
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    .thought-text { font-size: 14px; font-weight: 300; font-style: italic; line-height: 1.6; color: #e8e0ff; }

    .report-card {
      background: #14141f;
      border: 1px solid #1e1e30;
      border-radius: 14px;
      padding: 18px 20px;
    }

    .report-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }

    .report-label { font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: 3px; color: #c9a84c; text-transform: uppercase; }

    .report-badge { font-size: 11px; color: #4ecdc4; background: rgba(78,205,196,0.1); border: 1px solid rgba(78,205,196,0.2); border-radius: 10px; padding: 3px 10px; font-weight: 500; }

    .report-text { font-size: 13px; font-weight: 300; line-height: 1.6; color: #7a7499; }

    .report-stat { display: flex; align-items: center; gap: 10px; margin-top: 14px; padding-top: 14px; border-top: 1px solid #1e1e30; }

    .stat-bar-wrap { flex: 1; height: 4px; background: #1e1e30; border-radius: 2px; overflow: hidden; }

    .stat-bar-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, #7b4fd4, #c9a84c); animation: fillBar 1.2s ease-out forwards; }

    @keyframes fillBar { from { width: 0; } }

    .stat-pct { font-family: 'Cinzel', serif; font-size: 13px; color: #f0cc7a; min-width: 38px; text-align: right; }

    .journal-intro { text-align: center; padding: 4px 0 0; }

    .journal-intro-title { font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 3px; color: #c9a84c; text-transform: uppercase; margin-bottom: 6px; }

    .journal-intro-sub { font-size: 13px; font-weight: 300; color: #7a7499; }

    .session-block { display: flex; flex-direction: column; gap: 12px; }

    .session-header { display: flex; align-items: center; gap: 12px; }

    .session-number { font-family: 'Cinzel', serif; font-size: 28px; font-weight: 700; line-height: 1; min-width: 36px; }

    .s-morning .session-number { color: #c9a84c; text-shadow: 0 0 20px rgba(201,168,76,0.4); }
    .s-afternoon .session-number { color: #9b6ef3; text-shadow: 0 0 20px rgba(155,110,243,0.4); }
    .s-night .session-number { color: #4ecdc4; text-shadow: 0 0 20px rgba(78,205,196,0.4); }

    .session-meta { flex: 1; }

    .session-title { font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 2px; }

    .s-morning .session-title { color: #c9a84c; }
    .s-afternoon .session-title { color: #9b6ef3; }
    .s-night .session-title { color: #4ecdc4; }

    .session-desc { font-size: 11px; color: #7a7499; font-weight: 300; }

    .session-reps { font-size: 11px; color: #3a3558; display: flex; gap: 3px; flex-wrap: wrap; justify-content: flex-end; max-width: 60px; }

    .rep-dot { width: 6px; height: 6px; border-radius: 50%; background: #1e1e30; transition: background 0.3s; }

    .rep-dot.filled { background: #c9a84c; }
    .s-afternoon .rep-dot.filled { background: #9b6ef3; }
    .s-night .rep-dot.filled { background: #4ecdc4; }

    .journal-input {
      width: 100%;
      background: #10101e;
      border: 1px solid #1e1e30;
      border-radius: 10px;
      padding: 14px 16px;
      color: #e8e0ff;
      font-family: 'Raleway', sans-serif;
      font-size: 14px;
      font-weight: 300;
      resize: none;
      outline: none;
      transition: border-color 0.3s, box-shadow 0.3s;
      min-height: 72px;
      line-height: 1.5;
    }

    .s-morning .journal-input:focus { border-color: rgba(201,168,76,0.4); box-shadow: 0 0 0 3px rgba(201,168,76,0.06); }
    .s-afternoon .journal-input:focus { border-color: rgba(155,110,243,0.4); box-shadow: 0 0 0 3px rgba(155,110,243,0.06); }
    .s-night .journal-input:focus { border-color: rgba(78,205,196,0.4); box-shadow: 0 0 0 3px rgba(78,205,196,0.06); }

    .journal-input::placeholder { color: #3a3558; font-style: italic; }

    .ai-feedback {
      background: linear-gradient(135deg, rgba(123,79,212,0.1), rgba(78,205,196,0.05));
      border: 1px solid rgba(123,79,212,0.25);
      border-radius: 12px;
      padding: 16px 18px;
      animation: fadeIn 0.5s ease;
    }

    .ai-feedback-label {
      font-family: 'Cinzel', serif;
      font-size: 9px;
      letter-spacing: 3px;
      color: #9b6ef3;
      text-transform: uppercase;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ai-dot { width: 6px; height: 6px; border-radius: 50%; background: #9b6ef3; animation: pulseCore 1.5s ease-in-out infinite; }

    .ai-corrected { font-size: 14px; font-style: italic; font-weight: 400; color: #f0cc7a; line-height: 1.6; margin-bottom: 10px; }

    .ai-comment { font-size: 12px; font-weight: 300; color: #7a7499; }

    .ai-status-tag { display: inline-block; font-size: 10px; font-family: 'Cinzel', serif; letter-spacing: 1px; padding: 3px 10px; border-radius: 10px; margin-bottom: 10px; }

    .tag-perfect { background: rgba(78,205,196,0.1); border: 1px solid rgba(78,205,196,0.3); color: #4ecdc4; }
    .tag-improved { background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.3); color: #c9a84c; }

    .submit-btn {
      width: 100%;
      padding: 16px;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, #7b4fd4 0%, #9b6ef3 50%, rgba(201,168,76,0.8) 100%);
      color: white;
      font-family: 'Cinzel', serif;
      font-size: 12px;
      letter-spacing: 3px;
      text-transform: uppercase;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.15s, box-shadow 0.3s;
      box-shadow: 0 4px 24px rgba(123,79,212,0.3);
      position: relative;
      overflow: hidden;
    }

    .submit-btn:hover { opacity: 0.92; box-shadow: 0 6px 32px rgba(123,79,212,0.5); }
    .submit-btn:active { transform: scale(0.98); }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .loading-spinner {
      display: inline-block;
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      vertical-align: middle;
      margin-right: 8px;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .bottom-nav {
      position: sticky;
      bottom: 0;
      display: flex;
      background: rgba(10,10,20,0.97);
      backdrop-filter: blur(16px);
      border-top: 1px solid #1e1e30;
      z-index: 20;
    }

    .nav-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 12px 0 10px;
      cursor: pointer;
      transition: color 0.2s;
      color: #3a3558;
      font-size: 11px;
      font-weight: 400;
      letter-spacing: 0.5px;
      border: none;
      background: none;
    }

    .nav-item.active { color: #c9a84c; }
    .nav-item:hover:not(.active) { color: #7a7499; }

    .nav-icon { font-size: 20px; line-height: 1; }

    .nav-active-bar {
      position: absolute;
      top: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #c9a84c, transparent);
      border-radius: 0 0 2px 2px;
      transition: left 0.3s ease;
      width: 25%;
    }

    .insights-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .insight-card {
      background: #14141f;
      border: 1px solid #1e1e30;
      border-radius: 14px;
      padding: 16px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .insight-card.full { grid-column: 1 / -1; }

    .insight-icon { font-size: 22px; }

    .insight-val { font-family: 'Cinzel', serif; font-size: 22px; font-weight: 600; color: #f0cc7a; }

    .insight-key { font-size: 11px; color: #7a7499; font-weight: 300; letter-spacing: 0.5px; }

    .divider { height: 1px; background: #1e1e30; border-radius: 1px; }

    .sound-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .sound-card {
      background: #14141f;
      border: 1px solid #1e1e30;
      border-radius: 14px;
      padding: 18px 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
    }

    .sound-card:hover { border-color: rgba(201,168,76,0.3); background: rgba(201,168,76,0.03); }
    .sound-card.playing { border-color: #c9a84c; background: rgba(201,168,76,0.06); }

    .sound-icon { font-size: 28px; }

    .sound-name { font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 2px; color: #7a7499; text-align: center; text-transform: uppercase; }

    .sound-card.playing .sound-name { color: #c9a84c; }

    .sound-bar-wrap { display: flex; align-items: flex-end; gap: 2px; height: 16px; }

    .sound-bar { width: 3px; border-radius: 2px; background: #1e1e30; min-height: 3px; }

    .sound-card.playing .sound-bar {
      background: #c9a84c;
      animation: soundWave var(--d, 0.8s) ease-in-out infinite alternate var(--del, 0s);
    }

    @keyframes soundWave { from { height: 3px; } to { height: var(--h, 14px); } }
  `;
  document.head.appendChild(style);
};

// ─── STAR FIELD ─────────────────────────────────────────────────────────────
function Stars() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    dur: (Math.random() * 3 + 2).toFixed(1),
    delay: (Math.random() * 4).toFixed(1),
    minOp: (Math.random() * 0.1 + 0.05).toFixed(2),
    maxOp: (Math.random() * 0.5 + 0.3).toFixed(2),
  }));
  return (
    <div className="stars">
      {stars.map((s) => (
        <div
          key={s.id}
          className="star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            "--dur": `${s.dur}s`,
            "--delay": `${s.delay}s`,
            "--min-op": s.minOp,
            "--max-op": s.maxOp,
          }}
        />
      ))}
    </div>
  );
}

function AuraCircle({ streak }) {
  return (
    <div className="aura-circle-wrap">
      <div className="aura-orbit">
        <div className="aura-ring ring-1" />
        <div className="aura-ring ring-2" />
        <div className="aura-ring ring-3" />
        <div className="aura-core">AURA</div>
      </div>
      <div className="streak-badge">🔥 {streak} Day Streak</div>
    </div>
  );
}

function HomeScreen({ userData }) {
  const affirmation = AFFIRMATIONS[Math.floor(Date.now() / 86400000) % AFFIRMATIONS.length];
  return (
    <div className="screen">
      <AuraCircle streak={userData.streak_count} />
      <div className="greeting">
        <div className="greeting-name">Welcome Back, {userData.name}</div>
        <div className="greeting-line">Your focus creates your reality.</div>
      </div>
      <div className="thought-card">
        <div className="thought-label">✦ AI Thought of the Day</div>
        <div className="thought-text">"{affirmation}"</div>
      </div>
      <div className="report-card">
        <div className="report-header">
          <div className="report-label">⬡ Weekly Insight</div>
          <div className="report-badge">{userData.weekly_report.dominant_emotion}</div>
        </div>
        <div className="report-text">{userData.weekly_report.summary}</div>
        <div className="report-stat">
          <span style={{ fontSize: 12, color: "#7a7499" }}>Positivity</span>
          <div className="stat-bar-wrap">
            <div className="stat-bar-fill" style={{ width: "92%" }} />
          </div>
          <span className="stat-pct">92%</span>
        </div>
      </div>
      <div className="divider" />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {userData.preferred_angel_numbers.map((n) => (
          <div key={n} style={{ padding: "6px 14px", borderRadius: 20, border: "1px solid #1e1e30", fontSize: 13, color: "#7a7499", background: "#10101e", fontFamily: "'Cinzel', serif", letterSpacing: 1 }}>
            {n}
          </div>
        ))}
        <div style={{ fontSize: 12, color: "#3a3558", fontStyle: "italic" }}>Your angel numbers</div>
      </div>
    </div>
  );
}

function JournalScreen({ existingEntry }) {
  const [morning, setMorning] = useState(existingEntry?.morning_inputs?.[0] || "");
  const [afternoon, setAfternoon] = useState("");
  const [night, setNight] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const activeInput = morning || afternoon || night;

  const callAI = async () => {
    if (!activeInput.trim()) return;
    setLoading(true);
    setAiFeedback(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are the Elite AI Mindset Coach inside 'The 369 Aura App'. Analyze the manifestation sentence and respond ONLY with valid JSON, no markdown, no preamble.

Rules:
1. If it contains negative words (e.g., 'not', 'don't', 'fail', 'try', 'hope', 'can't', 'won't', 'never'), rewrite it into a powerful, present-tense positive affirmation.
2. If already highly positive and powerful, congratulate them and return the original.
3. Keep tone sharp, inspiring, elite.

Return exactly this JSON:
{"original_status":"needs_improvement OR perfect","corrected_text":"The optimized positive sentence","coach_comment":"A short 1-sentence motivational feedback","sentiment_score":0.95}`,
          messages: [{ role: "user", content: `User's manifestation: "${activeInput}"` }],
        }),
      });
      const data = await response.json();
      const raw = data.content?.map((b) => b.text || "").join("") || "{}";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setAiFeedback(parsed);
      setSubmitted(true);
    } catch (e) {
      setAiFeedback({ original_status: "perfect", corrected_text: activeInput, coach_comment: "Keep shining. Trust the process.", sentiment_score: 0.9 });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const sessions = [
    { cls: "s-morning", num: "3", title: "Morning", desc: "Write 3 times — plant the seed", reps: 3, val: morning, set: setMorning, placeholder: "What is your primary focus for today?" },
    { cls: "s-afternoon", num: "6", title: "Afternoon", desc: "Write 6 times — amplify the signal", reps: 6, val: afternoon, set: setAfternoon, placeholder: "Amplify your intention here..." },
    { cls: "s-night", num: "9", title: "Night", desc: "Write 9 times — anchor the reality", reps: 9, val: night, set: setNight, placeholder: "Anchor your realization as if it is already done..." },
  ];

  return (
    <div className="screen">
      <div className="journal-intro">
        <div className="journal-intro-title">The Manifestation Zone</div>
        <div className="journal-intro-sub">3 · 6 · 9 — Nikola Tesla's sacred sequence</div>
      </div>
      {sessions.map((s) => {
        const filled = s.val.trim().length > 0;
        return (
          <div key={s.num} className={`session-block ${s.cls}`}>
            <div className="session-header">
              <div className="session-number">{s.num}</div>
              <div className="session-meta">
                <div className="session-title">{s.title}</div>
                <div className="session-desc">{s.desc}</div>
              </div>
              <div className="session-reps">
                {Array.from({ length: s.reps }).map((_, i) => (
                  <div key={i} className={`rep-dot ${filled ? "filled" : ""}`} />
                ))}
              </div>
            </div>
            <textarea
              className="journal-input"
              placeholder={s.placeholder}
              value={s.val}
              onChange={(e) => { s.set(e.target.value); setSubmitted(false); setAiFeedback(null); }}
              rows={3}
            />
          </div>
        );
      })}

      {aiFeedback && (
        <div className="ai-feedback">
          <div className="ai-feedback-label"><div className="ai-dot" />Elite AI Coach Analysis</div>
          <div className={`ai-status-tag ${aiFeedback.original_status === "perfect" ? "tag-perfect" : "tag-improved"}`}>
            {aiFeedback.original_status === "perfect" ? "✓ Perfect Alignment" : "⬆ Optimized for Power"}
          </div>
          <div className="ai-corrected">"{aiFeedback.corrected_text}"</div>
          <div className="ai-comment">{aiFeedback.coach_comment}</div>
          {aiFeedback.sentiment_score && (
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, color: "#7a7499" }}>Vibrational score</span>
              <div className="stat-bar-wrap" style={{ flex: 1 }}>
                <div className="stat-bar-fill" style={{ width: `${Math.round(aiFeedback.sentiment_score * 100)}%` }} />
              </div>
              <span className="stat-pct" style={{ fontSize: 11 }}>{Math.round(aiFeedback.sentiment_score * 100)}%</span>
            </div>
          )}
        </div>
      )}

      {existingEntry?.ai_feedback && !aiFeedback && (
        <div className="ai-feedback">
          <div className="ai-feedback-label"><div className="ai-dot" />Today's Saved Analysis</div>
          <div className="ai-corrected">"{existingEntry.morning_inputs[0]}"</div>
          <div className="ai-comment">{existingEntry.ai_feedback}</div>
        </div>
      )}

      <button className="submit-btn" onClick={callAI} disabled={loading || !activeInput.trim()}>
        {loading ? (<><span className="loading-spinner" />Channeling AI Coach...</>) : submitted ? "✦ Re-Analyze Manifestation" : "Submit to Cloud AI Coach"}
      </button>
    </div>
  );
}

function SoundsScreen() {
  const [playing, setPlaying] = useState(null);
  const sounds = [
    { id: "hz528", icon: "🎵", name: "528 Hz Love" },
    { id: "rain", icon: "🌧", name: "Cosmic Rain" },
    { id: "tibetan", icon: "🔔", name: "Tibetan Bowls" },
    { id: "om", icon: "🕉", name: "Om Chants" },
    { id: "crystal", icon: "💎", name: "Crystal Tones" },
    { id: "ocean", icon: "🌊", name: "Ocean Waves" },
  ];
  const barHeights = [10, 14, 8, 16, 12, 7, 14, 10, 16, 8];

  return (
    <div className="screen">
      <div className="journal-intro">
        <div className="journal-intro-title">Frequency Library</div>
        <div className="journal-intro-sub">Tune your energy field to higher vibrations</div>
      </div>
      <div className="sound-grid">
        {sounds.map((s) => (
          <div key={s.id} className={`sound-card ${playing === s.id ? "playing" : ""}`} onClick={() => setPlaying(playing === s.id ? null : s.id)}>
            <div className="sound-icon">{s.icon}</div>
            <div className="sound-name">{s.name}</div>
            <div className="sound-bar-wrap">
              {barHeights.map((h, i) => (
                <div key={i} className="sound-bar" style={{ height: playing === s.id ? undefined : h, "--h": `${h}px`, "--d": `${0.4 + i * 0.08}s`, "--del": `${i * 0.06}s` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      {playing && (
        <div className="thought-card" style={{ textAlign: "center" }}>
          <div className="thought-label">Now Playing</div>
          <div className="thought-text">{sounds.find((s) => s.id === playing)?.icon} {sounds.find((s) => s.id === playing)?.name}</div>
          <div style={{ fontSize: 12, color: "#7a7499", marginTop: 8, fontStyle: "italic" }}>Allow the vibration to align your energy field...</div>
        </div>
      )}
    </div>
  );
}

function InsightsScreen({ userData }) {
  return (
    <div className="screen">
      <div className="journal-intro">
        <div className="journal-intro-title">Your Aura Intelligence</div>
        <div className="journal-intro-sub">Week 23 · 2026 · Progress Analysis</div>
      </div>
      <div className="insights-grid">
        {[
          { icon: "🔥", val: userData.streak_count, key: "Day Streak" },
          { icon: "⚡", val: "92%", key: "Positivity Score" },
          { icon: "🎯", val: "0.95", key: "Aura Alignment" },
          { icon: "🧠", val: "47", key: "Total Sessions" },
        ].map((c) => (
          <div key={c.key} className="insight-card">
            <div className="insight-icon">{c.icon}</div>
            <div className="insight-val">{c.val}</div>
            <div className="insight-key">{c.key}</div>
          </div>
        ))}
        <div className="insight-card full">
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: 3, color: "#c9a84c", textTransform: "uppercase", marginBottom: 10 }}>⬡ Weekly Summary</div>
          <div style={{ fontSize: 13, fontWeight: 300, color: "#7a7499", lineHeight: 1.7 }}>{userData.weekly_report.summary}</div>
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#7a7499" }}>Dominant Energy</span>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: "#4ecdc4", background: "rgba(78,205,196,0.1)", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 10, padding: "3px 12px" }}>{userData.weekly_report.dominant_emotion}</span>
          </div>
        </div>
      </div>
      <div>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: 3, color: "#c9a84c", textTransform: "uppercase", marginBottom: 12 }}>⬡ 7-Day Positivity Trend</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
          {[72, 80, 88, 76, 92, 89, 95].map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: "100%", height: `${v * 0.58}%`, background: `linear-gradient(180deg, #9b6ef3, #7b4fd4)`, borderRadius: "3px 3px 0 0", opacity: 0.5 + i * 0.07 }} />
              <div style={{ fontSize: 10, color: "#3a3558" }}>{["M","T","W","T","F","S","S"][i]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AuraApp() {
  useEffect(() => { injectStyles(); }, []);
  const [tab, setTab] = useState("home");

  const userData = {
    name: "Champ",
    streak_count: 14,
    preferred_angel_numbers: ["11:11", "777", "369"],
    weekly_report: {
      summary: "Your focus this week was 92% positive. Massive alignment detected in your career and development goals. Keep pushing.",
      dominant_emotion: "Determined",
    },
  };

  const existingEntry = {
    morning_inputs: ["I am building a top-level mobile application successfully."],
    ai_sentiment_score: 0.95,
    ai_feedback: "Excellent high-vibrational alignment. Focus remains sharp.",
  };

  const navItems = [
    { id: "home", icon: "◎", label: "Aura" },
    { id: "journal", icon: "✦", label: "369 Journal" },
    { id: "sounds", icon: "♫", label: "Sounds" },
    { id: "insights", icon: "⬡", label: "Insights" },
  ];

  const navIndex = navItems.findIndex((n) => n.id === tab);

  return (
    <div className="aura-root">
      <Stars />
      <div className="aura-shell">
        <div className="header">
          <button className="icon-btn">◎</button>
          <span className="header-title">The Aura App</span>
          <button className="icon-btn">⚙</button>
        </div>

        {tab === "home" && <HomeScreen userData={userData} />}
        {tab === "journal" && <JournalScreen existingEntry={existingEntry} />}
        {tab === "sounds" && <SoundsScreen />}
        {tab === "insights" && <InsightsScreen userData={userData} />}

        <nav className="bottom-nav" style={{ position: "relative" }}>
          <div className="nav-active-bar" style={{ left: `${navIndex * 25}%` }} />
          {navItems.map((n) => (
            <button key={n.id} className={`nav-item ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
