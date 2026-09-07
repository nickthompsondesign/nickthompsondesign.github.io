import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Settings2, RotateCcw, Pencil } from "lucide-react";

const STORAGE_KEY = "trumps-tracker-state-v1";

const SUIT_CYCLE = [
  { symbol: "♥", name: "Hearts", css: "red" },
  { symbol: "♠", name: "Spades", css: "black" },
  { symbol: "♦", name: "Diamonds", css: "red" },
  { symbol: "♣", name: "Clubs", css: "black" },
  { symbol: "NT", name: "No Trumps", css: "gold" },
];

function defaultTrumpOrder() {
  return Array.from({ length: 13 }, (_, i) => SUIT_CYCLE[i % 5]);
}
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function randomTrumpOrder() {
  const blocks = [shuffle([...SUIT_CYCLE]), shuffle([...SUIT_CYCLE]), shuffle([...SUIT_CYCLE])];
  return blocks.flat().slice(0, 13);
}

const DEFAULT_PLAYERS = [
  { id: "p1", name: "Nick" },
  { id: "p2", name: "Iona" },
];

export default function TrumpsTracker() {
  const [players, setPlayers] = useState(DEFAULT_PLAYERS);
  const [scores, setScores] = useState({});
  const [currentRound, setCurrentRound] = useState(13);
  const [scoringRule, setScoringRule] = useState("standard10");
  const [trumpOrder, setTrumpOrder] = useState(defaultTrumpOrder());
  const [loaded, setLoaded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingScore, setEditingScore] = useState(null); // playerId currently overriding score
  const [showClearModal, setShowClearModal] = useState(false);
  const [randomiseOnClear, setRandomiseOnClear] = useState(true);

  function suitForRound(round) {
    return trumpOrder[13 - round];
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY, false);
        if (res && res.value) {
          const data = JSON.parse(res.value);
          if (data.players) setPlayers(data.players);
          if (data.scores) setScores(data.scores);
          if (data.currentRound) setCurrentRound(data.currentRound);
          if (data.scoringRule) setScoringRule(data.scoringRule);
          if (data.trumpOrder) setTrumpOrder(data.trumpOrder);
        }
      } catch (e) {
        // nothing saved yet
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(async () => {
      try {
        await window.storage.set(
          STORAGE_KEY,
          JSON.stringify({ players, scores, currentRound, scoringRule, trumpOrder }),
          false
        );
      } catch (e) {
        console.error("save failed", e);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [players, scores, currentRound, scoringRule, trumpOrder, loaded]);

  function updateCell(round, playerId, field, value) {
    setScores((prev) => {
      const roundData = { ...(prev[round] || {}) };
      const cell = { ...(roundData[playerId] || {}) };
      cell[field] = value;
      roundData[playerId] = cell;
      return { ...prev, [round]: roundData };
    });
  }

  function computeScore(cell) {
    if (!cell) return null;
    if (cell.manual !== undefined && cell.manual !== "") return Number(cell.manual);
    const { estimate, actual } = cell;
    if (estimate === undefined || estimate === "" || actual === undefined || actual === "")
      return null;
    const e = Number(estimate);
    const a = Number(actual);
    const hit = e === a;
    if (scoringRule === "standard10") return hit ? 10 : a;
    if (scoringRule === "standard5") return hit ? 5 + a : 0;
    if (scoringRule === "tricksOnly") return a;
    return null;
  }

  function totalFor(playerId) {
    let total = 0;
    Object.keys(scores).forEach((r) => {
      const s = computeScore(scores[r][playerId]);
      if (s !== null) total += s;
    });
    return total;
  }

  function addPlayer() {
    const id = "p" + Date.now();
    setPlayers((prev) => [...prev, { id, name: "Player " + (prev.length + 1) }]);
  }
  function removePlayer(id) {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }
  function renamePlayer(id, name) {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  }

  async function confirmClear() {
    const nextTrumpOrder = randomiseOnClear ? randomTrumpOrder() : trumpOrder;
    setScores({});
    setCurrentRound(13);
    setTrumpOrder(nextTrumpOrder);
    setShowClearModal(false);
    try {
      await window.storage.set(
        STORAGE_KEY,
        JSON.stringify({ players, scores: {}, currentRound: 13, scoringRule, trumpOrder: nextTrumpOrder }),
        false
      );
    } catch (e) {}
  }

  const rounds = Array.from({ length: 13 }, (_, i) => 13 - i);
  const suit = suitForRound(currentRound);
  const ranked = [...players].sort((a, b) => totalFor(b.id) - totalFor(a.id));

  const tricksAccounted = players.reduce((sum, p) => {
    const a = scores[currentRound]?.[p.id]?.actual;
    return sum + (a === undefined || a === "" ? 0 : Number(a));
  }, 0);
  const tricksOk = tricksAccounted === currentRound;

  return (
    <div className="tt-app">
      <style>{`
        .tt-app {
          --felt: #12362A;
          --felt-dark: #0B241C;
          --panel: #163F31;
          --cream: #F5EFE0;
          --ink: #1E1B14;
          --muted: #A9C2B4;
          --gold: #C9A15A;
          --red: #C1503E;
          --black: #E7E2D2;
          font-family: 'IBM Plex Sans', sans-serif;
          background: radial-gradient(ellipse at top, var(--felt) 0%, var(--felt-dark) 100%);
          color: var(--cream);
          min-height: 100%;
          padding: 18px 14px 40px;
          box-sizing: border-box;
        }
        .tt-app * { box-sizing: border-box; }
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

        .tt-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
        .tt-title { font-family:'Fraunces',serif; font-size:22px; font-weight:600; letter-spacing:0.3px; color:var(--cream); }
        .tt-iconbtn { background:transparent; border:1px solid rgba(245,239,224,0.25); color:var(--cream); width:34px; height:34px; border-radius:8px; display:flex; align-items:center; justify-content:center; }

        .tt-leaderboard { display:flex; gap:8px; overflow-x:auto; padding-bottom:4px; margin-bottom:18px; }
        .tt-chip { flex:0 0 auto; background:var(--panel); border-radius:10px; padding:8px 12px; display:flex; align-items:center; gap:8px; border:1px solid rgba(245,239,224,0.08); }
        .tt-chip .rank { font-family:'Fraunces',serif; color:var(--gold); font-size:13px; }
        .tt-chip .name { font-size:13px; font-weight:500; }
        .tt-chip .score { font-family:'Fraunces',serif; font-size:15px; color:var(--cream); }

        .tt-round-card { background:var(--panel); border:1px solid rgba(201,161,90,0.35); border-radius:16px; padding:14px 10px; display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
        .tt-navbtn { background:transparent; border:none; color:var(--muted); width:38px; height:38px; display:flex; align-items:center; justify-content:center; border-radius:8px; }
        .tt-navbtn:disabled { opacity:0.25; }
        .tt-round-center { text-align:center; flex:1; }
        .tt-round-num { font-family:'Fraunces',serif; font-size:44px; line-height:1; font-weight:600; }
        .tt-round-suit { font-size:26px; margin-top:2px; }
        .tt-round-suit.red { color:var(--red); }
        .tt-round-suit.black { color:var(--black); }
        .tt-round-suit.gold { color:var(--gold); font-size:16px; font-weight:600; letter-spacing:1px; }
        .tt-round-label { font-size:12px; color:var(--muted); margin-top:4px; }

        .tt-tricks-check { text-align:center; font-size:12px; color:var(--muted); margin-bottom:16px; }
        .tt-tricks-check.ok { color:#8FD3A6; }
        .tt-tricks-check.off { color:#E0A56F; }

        .tt-player-row { background:var(--panel); border-radius:12px; padding:10px 12px; margin-bottom:8px; display:flex; align-items:center; gap:10px; border:1px solid rgba(245,239,224,0.06); }
        .tt-player-name { background:transparent; border:none; color:var(--cream); font-size:14px; font-weight:500; width:64px; padding:2px 0; border-bottom:1px solid transparent; }
        .tt-player-name:focus { outline:none; border-bottom:1px solid var(--gold); }
        .tt-fields { display:flex; align-items:center; gap:8px; flex:1; justify-content:flex-end; }
        .tt-field { display:flex; flex-direction:column; align-items:center; }
        .tt-field label { font-size:9px; text-transform:uppercase; letter-spacing:0.6px; color:var(--muted); margin-bottom:2px; }
        .tt-field input { width:42px; background:var(--felt-dark); border:1px solid rgba(245,239,224,0.15); color:var(--cream); border-radius:6px; padding:5px 0; text-align:center; font-size:14px; }
        .tt-field input:focus { outline:none; border-color:var(--gold); }
        .tt-roundscore { font-family:'Fraunces',serif; font-size:17px; width:38px; text-align:right; color:var(--gold); }
        .tt-roundscore button { background:none; border:none; color:inherit; font:inherit; padding:0; cursor:pointer; }

        .tt-addplayer { width:100%; background:transparent; border:1px dashed rgba(245,239,224,0.3); color:var(--muted); border-radius:12px; padding:10px; display:flex; align-items:center; justify-content:center; gap:6px; font-size:13px; margin-bottom:18px; }

        .tt-history-toggle { width:100%; background:transparent; border:none; color:var(--gold); font-size:13px; padding:8px; text-align:center; text-decoration:underline; text-underline-offset:3px; }

        .tt-history-wrap { overflow-x:auto; margin-top:10px; margin-bottom:18px; border-radius:12px; border:1px solid rgba(245,239,224,0.1); }
        .tt-history-table { border-collapse:collapse; width:100%; font-size:12px; }
        .tt-history-table th, .tt-history-table td { padding:7px 9px; text-align:left; white-space:nowrap; border-bottom:1px solid rgba(245,239,224,0.08); }
        .tt-history-table th { color:var(--muted); font-weight:500; font-size:11px; }
        .tt-history-table tr.active { background:rgba(201,161,90,0.12); }
        .tt-history-table tr:active { background:rgba(201,161,90,0.2); }

        .tt-settings { background:var(--panel); border-radius:14px; padding:14px; margin-bottom:18px; border:1px solid rgba(245,239,224,0.1); }
        .tt-settings h3 { font-family:'Fraunces',serif; font-size:15px; margin:0 0 8px; font-weight:600; }
        .tt-settings select { width:100%; background:var(--felt-dark); color:var(--cream); border:1px solid rgba(245,239,224,0.2); border-radius:8px; padding:8px; font-size:13px; margin-bottom:10px; }
        .tt-settings .hint { font-size:11px; color:var(--muted); margin:-4px 0 10px; }
        .tt-settings-player { display:flex; justify-content:space-between; align-items:center; padding:6px 0; font-size:13px; border-bottom:1px solid rgba(245,239,224,0.06); }
        .tt-settings-player button { background:none; border:none; color:var(--red); display:flex; align-items:center; }
        .tt-reset { width:100%; margin-top:8px; background:transparent; border:1px solid rgba(193,80,62,0.5); color:#E0A56F; border-radius:8px; padding:8px; font-size:12px; display:flex; align-items:center; justify-content:center; gap:6px; }

        .tt-modal-overlay { position:fixed; inset:0; background:rgba(11,36,28,0.75); display:flex; align-items:center; justify-content:center; padding:20px; z-index:50; }
        .tt-modal { background:var(--panel); border:1px solid rgba(201,161,90,0.4); border-radius:16px; padding:20px; max-width:340px; width:100%; }
        .tt-modal h3 { font-family:'Fraunces',serif; font-size:17px; margin:0 0 8px; font-weight:600; }
        .tt-modal p { font-size:13px; color:var(--muted); margin:0 0 14px; line-height:1.4; }
        .tt-modal label.tt-checkbox { display:flex; align-items:flex-start; gap:8px; font-size:12px; color:var(--cream); margin-bottom:16px; cursor:pointer; line-height:1.4; }
        .tt-modal label.tt-checkbox input { margin-top:2px; }
        .tt-modal-actions { display:flex; gap:8px; }
        .tt-modal-actions button { flex:1; padding:10px; border-radius:8px; font-size:13px; cursor:pointer; }
        .tt-modal-cancel { background:transparent; border:1px solid rgba(245,239,224,0.25); color:var(--cream); }
        .tt-modal-confirm { background:#C1503E; border:1px solid #C1503E; color:var(--cream); font-weight:600; }
      `}</style>

      <div className="tt-header">
        <div className="tt-title">Trumps</div>
        <button className="tt-iconbtn" onClick={() => setShowSettings((s) => !s)}>
          <Settings2 size={16} />
        </button>
      </div>

      <div className="tt-leaderboard">
        {ranked.map((p, i) => (
          <div className="tt-chip" key={p.id}>
            <span className="rank">{i + 1}</span>
            <span className="name">{p.name}</span>
            <span className="score">{totalFor(p.id)}</span>
          </div>
        ))}
      </div>

      {showSettings && (
        <div className="tt-settings">
          <h3>Scoring rule</h3>
          <select value={scoringRule} onChange={(e) => setScoringRule(e.target.value)}>
            <option value="standard10">Exact bid = +10, miss = actual tricks</option>
            <option value="standard5">Exact bid = 5 + tricks, miss = 0</option>
            <option value="tricksOnly">Tricks won only, no bonus</option>
          </select>
          <div className="hint">
            Tap any round score (the gold number) to type in your own value instead — that always wins over the formula.
          </div>
          <h3>Players</h3>
          {players.map((p) => (
            <div className="tt-settings-player" key={p.id}>
              <span>{p.name}</span>
              {players.length > 2 && (
                <button onClick={() => removePlayer(p.id)}>
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          <button className="tt-reset" onClick={() => setShowClearModal(true)}>
            <RotateCcw size={13} /> Clear all rounds
          </button>
        </div>
      )}

      <div className="tt-round-card">
        <button className="tt-navbtn" onClick={() => setCurrentRound((r) => Math.min(13, r + 1))} disabled={currentRound >= 13}>
          <ChevronLeft size={20} />
        </button>
        <div className="tt-round-center">
          <div className="tt-round-num">{currentRound}</div>
          <div className={`tt-round-suit ${suit.css}`}>{suit.symbol}</div>
          <div className="tt-round-label">
            {suit.name} · Round {14 - currentRound} of 13
          </div>
        </div>
        <button className="tt-navbtn" onClick={() => setCurrentRound((r) => Math.max(1, r - 1))} disabled={currentRound <= 1}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className={`tt-tricks-check ${tricksAccounted === 0 ? "" : tricksOk ? "ok" : "off"}`}>
        Tricks played: {tricksAccounted} / {currentRound}
      </div>

      {players.map((p) => {
        const cell = scores[currentRound]?.[p.id] || {};
        const roundScore = computeScore(cell);
        const isEditing = editingScore === p.id;
        return (
          <div className="tt-player-row" key={p.id}>
            <input
              className="tt-player-name"
              value={p.name}
              onChange={(e) => renamePlayer(p.id, e.target.value)}
            />
            <div className="tt-fields">
              <div className="tt-field">
                <label>Est</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={currentRound}
                  value={cell.estimate ?? ""}
                  onChange={(e) => updateCell(currentRound, p.id, "estimate", e.target.value)}
                />
              </div>
              <div className="tt-field">
                <label>Actual</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={currentRound}
                  value={cell.actual ?? ""}
                  onChange={(e) => updateCell(currentRound, p.id, "actual", e.target.value)}
                />
              </div>
              <div className="tt-roundscore">
                {isEditing ? (
                  <input
                    type="number"
                    autoFocus
                    style={{ width: 40, textAlign: "right", background: "transparent", border: "none", color: "inherit", fontFamily: "inherit", fontSize: "inherit" }}
                    defaultValue={cell.manual ?? roundScore ?? ""}
                    onBlur={(e) => {
                      updateCell(currentRound, p.id, "manual", e.target.value);
                      setEditingScore(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.target.blur();
                    }}
                  />
                ) : (
                  <button onClick={() => setEditingScore(p.id)}>
                    {roundScore !== null ? (roundScore > 0 ? "+" : "") + roundScore : "—"}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <button className="tt-addplayer" onClick={addPlayer}>
        <Plus size={14} /> Add player
      </button>

      <button className="tt-history-toggle" onClick={() => setShowHistory((s) => !s)}>
        {showHistory ? "Hide" : "Show"} full scoreboard
      </button>

      {showHistory && (
        <div className="tt-history-wrap">
          <table className="tt-history-table">
            <thead>
              <tr>
                <th>Rnd</th>
                {players.map((p) => (
                  <th key={p.id}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rounds.map((r) => {
                const s = suitForRound(r);
                return (
                  <tr key={r} className={r === currentRound ? "active" : ""} onClick={() => setCurrentRound(r)}>
                    <td>
                      <span className={s.css === "gold" ? "" : undefined} style={{ color: s.css === "red" ? "var(--red)" : s.css === "gold" ? "var(--gold)" : "var(--black)" }}>
                        {s.symbol}
                      </span>{" "}
                      {r}
                    </td>
                    {players.map((p) => {
                      const c = scores[r]?.[p.id];
                      const sc = computeScore(c);
                      return (
                        <td key={p.id}>
                          {c?.estimate ?? "–"}/{c?.actual ?? "–"} {sc !== null ? `(${sc})` : ""}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showClearModal && (
        <div className="tt-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowClearModal(false); }}>
          <div className="tt-modal">
            <h3>Start a new game?</h3>
            <p>This clears every player's estimate and actual score for all 13 rounds. This can't be undone.</p>
            <label className="tt-checkbox">
              <input type="checkbox" checked={randomiseOnClear} onChange={(e) => setRandomiseOnClear(e.target.checked)} />
              <span>Randomise the trump order too — still suit, suit, suit, suit, no trump in each block of 5, just shuffled, so no trump can land anywhere within its block.</span>
            </label>
            <div className="tt-modal-actions">
              <button className="tt-modal-cancel" onClick={() => setShowClearModal(false)}>Cancel</button>
              <button className="tt-modal-confirm" onClick={confirmClear}>Clear rounds</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
