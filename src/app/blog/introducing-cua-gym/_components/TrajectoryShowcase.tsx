'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TRAJECTORIES, type TrajData, type TrajStep } from '../_lib/trajectories_data';

/**
 * Three-module trajectory showcase placed at the top of the Results section.
 *  · Left   : initial_setup.py (Python syntax-highlighted, cream module).
 *  · Centre : task instruction → screenshot with input overlays
 *             (mouse click ring, keyboard kbd chord, TYPE caption);
 *             a thought-led step rail folds out from the right.
 *  · Right  : reward.py highlighted + score breakdown + total bar.
 *
 * Three tabs at the top let the reader flip through different tasks
 * (e-commerce mock, cross-app PDF, multi-app personal workflow), so the
 * coverage of CUA-Gym is visible at a glance.
 */

const CODE_FONT =
  'Consolas, "Cascadia Code", "JetBrains Mono", "SF Mono", ui-monospace, monospace';
const SHOT_W = 1920;
const SHOT_H = 1080;

// Pretty label per app domain mix
const TAB_LABELS: Record<string, { name: string; sub: string }> = {
  shopify_adv_005:    { name: 'E-commerce admin', sub: 'Shopify · vendor consolidation' },
  pdf_cross_009:      { name: 'Cross-app PDF',    sub: 'PDF · 47-step workflow' },
  xplat_personal_016: { name: 'Multi-app personal', sub: 'Gmail · Calc · Notion' },
};

export default function TrajectoryShowcase() {
  const [trajIdx, setTrajIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const traj = TRAJECTORIES[trajIdx];
  const step = traj.steps[stepIdx];

  // Auto-advance during playback
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    if (!playing) return;
    timerRef.current = window.setInterval(() => {
      setStepIdx((s) => {
        if (s >= traj.steps.length - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 1500);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [playing, traj.steps.length]);

  const reset = () => {
    setStepIdx(0);
    setPlaying(false);
  };

  const switchTraj = (i: number) => {
    setTrajIdx(i);
    setStepIdx(0);
    setPlaying(false);
  };

  // Score breakdown derived from reward (0 / partial / 1.0)
  const criteria = useMemo(() => deriveCriteria(traj), [traj]);

  return (
    <div className="font-system">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TRAJECTORIES.map((t, i) => {
          const meta = TAB_LABELS[t.id] || { name: t.id, sub: t.appType };
          const active = i === trajIdx;
          return (
            <button
              key={t.id}
              onClick={() => switchTraj(i)}
              className="text-left px-4 py-2 rounded-md border transition-all flex flex-col"
              style={
                active
                  ? {
                      borderColor: '#1B1816',
                      backgroundColor: '#1B1816',
                      color: '#F7F4ED',
                      boxShadow: '0 6px 18px -10px rgba(27,24,22,0.5)',
                    }
                  : {
                      borderColor: 'rgba(27,24,22,0.18)',
                      color: '#1B1816',
                    }
              }
            >
              <span className="flex items-center gap-2">
                <span
                  className="font-mono text-[10px] tracking-wider opacity-70"
                  style={{ color: active ? '#E8C273' : '#9C948A' }}
                >
                  TRAJECTORY {(i + 1).toString().padStart(2, '0')}
                </span>
                {Number(t.reward) >= 0.99 && (
                  <span
                    className="font-mono text-[9px] tracking-wider rounded px-1.5 py-px"
                    style={{
                      color: active ? '#1B1816' : '#1F6E3F',
                      backgroundColor: active ? '#A4D9A0' : 'rgba(31,110,63,0.10)',
                    }}
                  >
                    reward {t.reward.toFixed(2)}
                  </span>
                )}
              </span>
              <span className="text-[14px] font-semibold mt-0.5">{meta.name}</span>
              <span
                className="text-[11px] mt-0.5"
                style={{ color: active ? 'rgba(247,244,237,0.7)' : '#5C5651' }}
              >
                {meta.sub} · {t.steps.length} steps
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-3 items-stretch">
        {/* ── Left: setup.py ── */}
        <div className="col-span-12 lg:col-span-3 flex">
          <CreamModule label="initial_setup.py" dotColor="#7BB7C9">
            <PyCode code={traj.setupCode} />
          </CreamModule>
        </div>

        {/* ── Centre: task + screenshot + step rail ── */}
        <div className="col-span-12 lg:col-span-6 flex">
          <CreamModule label="Trajectory" dotColor="#E8C273">
            {/* Task instruction */}
            <div className="px-1 pb-3 border-b" style={{ borderColor: 'rgba(27,24,22,0.10)' }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="block size-1.5 rounded-full" style={{ backgroundColor: '#1B1816' }} />
                <span className="font-mono uppercase tracking-[0.18em] text-[9px] text-ink-soft">
                  Task Instruction
                </span>
                {traj.difficulty && (
                  <span
                    className="font-mono uppercase tracking-[0.16em] text-[9px] ml-auto px-1.5 rounded"
                    style={{
                      backgroundColor: difficultyColor(traj.difficulty).bg,
                      color: difficultyColor(traj.difficulty).fg,
                    }}
                  >
                    {traj.difficulty}
                  </span>
                )}
              </div>
              <p
                className="text-[11.5px] leading-snug italic px-3 py-2 rounded"
                style={{
                  fontFamily: '"Times New Roman", Times, serif',
                  backgroundColor: 'rgba(27,24,22,0.04)',
                  color: '#1B1816',
                }}
              >
                {traj.task}
              </p>
            </div>

            {/* Screenshot + thought */}
            <div className="flex-1 flex flex-col mt-3 min-h-0">
              <ScreenshotWithOverlay step={step} stepIdx={stepIdx} total={traj.steps.length} />
              <div className="mt-2 px-1 flex items-start gap-2 text-[11px] leading-snug">
                <span
                  className="font-mono uppercase tracking-[0.18em] text-[9px] mt-0.5 flex-none"
                  style={{ color: '#9C948A' }}
                >
                  Thought
                </span>
                <p style={{ color: '#1B1816' }} className="italic flex-1 line-clamp-3">
                  {step.thought || <span className="text-ink-faint not-italic">(no thought recorded)</span>}
                </p>
              </div>
            </div>

            {/* Playback controls */}
            <div className="mt-3 flex items-center justify-center gap-3 pb-1">
              <PlayBtn
                disabled={stepIdx === 0}
                onClick={() => { setStepIdx(Math.max(0, stepIdx - 1)); setPlaying(false); }}
                title="Previous"
              ><PrevIcon /></PlayBtn>
              <PlayBtn
                primary
                onClick={() => {
                  if (stepIdx >= traj.steps.length - 1) reset();
                  setPlaying((p) => !p);
                }}
                title={playing ? 'Pause' : 'Play'}
              >{playing ? <PauseIcon /> : <PlayIcon />}</PlayBtn>
              <PlayBtn
                disabled={stepIdx === traj.steps.length - 1}
                onClick={() => { setStepIdx(Math.min(traj.steps.length - 1, stepIdx + 1)); setPlaying(false); }}
                title="Next"
              ><NextIcon /></PlayBtn>
              <PlayBtn onClick={reset} title="Reset"><ResetIcon /></PlayBtn>
            </div>
          </CreamModule>
        </div>

        {/* ── Right: reward.py + score ── */}
        <div className="col-span-12 lg:col-span-3 flex">
          <CreamModule label="reward.py" dotColor="#E07A86">
            <PyCode code={traj.rewardCode} />
            <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(27,24,22,0.10)' }}>
              <div className="font-mono uppercase tracking-[0.18em] text-[9px] mb-2 text-ink-soft">
                Score breakdown
              </div>
              <ul className="space-y-1.5">
                {criteria.map((c, i) => (
                  <li key={i} className="flex items-center gap-2 text-[11px]">
                    {c.pass ? <Check color="#1F6E3F" /> : <Cross color="#B83D44" />}
                    <span style={{ color: '#1B1816' }}>{c.label}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(27,24,22,0.10)' }}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-mono uppercase tracking-[0.18em] text-[9px] text-ink-soft">
                    Total reward
                  </span>
                  <span
                    className="font-mono text-[14px] font-semibold tabular-nums"
                    style={{ color: '#1F6E3F' }}
                  >
                    {traj.reward.toFixed(2)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(27,24,22,0.10)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${traj.reward * 100}%`, backgroundColor: '#1F6E3F' }}
                  />
                </div>
              </div>
            </div>
          </CreamModule>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Score-breakdown derivation (best-effort, parses reward.py for criterion-like
// strings; falls back to a generic 4-tier breakdown).
// ─────────────────────────────────────────────────────────────────────────────

function deriveCriteria(traj: TrajData): { label: string; pass: boolean }[] {
  // try to extract any quoted criterion strings from reward.py docstrings/asserts
  const lines = traj.rewardCode.split('\n');
  const seen = new Set<string>();
  const out: { label: string; pass: boolean }[] = [];
  for (const ln of lines) {
    const m = ln.match(/['"]([A-Z][^'"]{15,90})['"]/);
    if (m && !seen.has(m[1])) {
      seen.add(m[1]);
      out.push({ label: m[1], pass: traj.reward >= 0.99 });
      if (out.length >= 4) break;
    }
  }
  if (out.length < 3) {
    // generic fallback
    return [
      { label: 'Initial state matches setup', pass: true },
      { label: 'Required UI changes applied', pass: traj.reward >= 0.5 },
      { label: 'Verification checks pass',    pass: traj.reward >= 0.99 },
      { label: 'Reward function returns 1.0', pass: traj.reward >= 0.99 },
    ];
  }
  return out;
}

function difficultyColor(d: string) {
  switch (d.toLowerCase()) {
    case 'hard':   return { bg: 'rgba(184,61,68,0.12)', fg: '#B83D44' };
    case 'medium': return { bg: 'rgba(232,194,115,0.20)', fg: '#A8771F' };
    case 'easy':   return { bg: 'rgba(31,110,63,0.12)', fg: '#1F6E3F' };
    default:       return { bg: 'rgba(27,24,22,0.06)', fg: '#5C5651' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Screenshot + input overlay
// ─────────────────────────────────────────────────────────────────────────────

function ScreenshotWithOverlay({
  step,
  stepIdx,
  total,
}: {
  step: TrajStep;
  stepIdx: number;
  total: number;
}) {
  const click = parseClick(step.action.kind, step.action.arg);
  const keys = step.action.kind === 'KEY' ? parseKey(step.action.arg) : [];
  const typed = step.action.kind === 'TYPE' ? parseType(step.action.arg) : '';

  return (
    <div
      className="relative rounded-md overflow-hidden border bg-paper-deep"
      style={{ borderColor: 'rgba(27,24,22,0.10)', aspectRatio: `${SHOT_W} / ${SHOT_H}` }}
    >
      {step.screenshot ? (
        <img
          src={step.screenshot}
          alt={`Step ${step.n}`}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-ink-faint italic text-sm">
          No screenshot
        </div>
      )}

      <div
        className="absolute top-2 left-2 px-2 py-0.5 rounded font-mono text-[10px] tracking-wider"
        style={{ backgroundColor: 'rgba(27,24,22,0.85)', color: '#F7F4ED' }}
      >
        step {(stepIdx + 1).toString().padStart(2, '0')} / {total}
      </div>
      <ActionChip kind={step.action.kind} />

      {click && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${(click.x / SHOT_W) * 100}%`,
            top: `${(click.y / SHOT_H) * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <span
            className="absolute rounded-full animate-ping"
            style={{
              width: 36, height: 36,
              left: -18, top: -18,
              border: '2px solid #D85959',
              opacity: 0.85,
            }}
          />
          <span
            className="block rounded-full"
            style={{
              width: 14, height: 14,
              backgroundColor: '#D85959',
              boxShadow: '0 0 0 2px #FFFFFF, 0 1px 4px rgba(0,0,0,0.4)',
              transform: 'translate(-50%, -50%)',
              position: 'absolute',
              left: 0, top: 0,
            }}
          />
        </div>
      )}

      {keys.length > 0 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none">
          {keys.map((k, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <Kbd>{k}</Kbd>
              {i < keys.length - 1 && <span style={{ color: '#FFFFFF', fontWeight: 700 }}>+</span>}
            </span>
          ))}
        </div>
      )}

      {typed && (
        <div
          className="absolute left-3 right-3 bottom-3 rounded font-mono text-[11.5px] px-3 py-1.5 flex items-center gap-2 pointer-events-none"
          style={{
            backgroundColor: 'rgba(20,17,13,0.85)',
            color: '#F2EAD0',
            backdropFilter: 'blur(2px)',
          }}
        >
          <span
            className="font-mono text-[8.5px] tracking-wider px-1 py-0.5 rounded font-bold flex-none"
            style={{ backgroundColor: '#3D6FA0', color: '#FFFFFF' }}
          >
            TYPE
          </span>
          <span className="truncate">{typed}</span>
          <span className="ml-1 opacity-60 inline-block animate-pulse">▍</span>
        </div>
      )}

      {step.action.kind === 'DONE' && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center pointer-events-none">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-[11px] font-semibold"
            style={{
              backgroundColor: 'rgba(31, 110, 63, 0.95)',
              color: '#FFFFFF',
              boxShadow: '0 4px 16px -4px rgba(31,110,63,0.6)',
            }}
          >
            <Check color="#FFFFFF" /> Task complete
          </div>
        </div>
      )}
    </div>
  );
}

function ActionChip({ kind }: { kind: string }) {
  const COLORS: Record<string, { bg: string; ink: string }> = {
    CLICK:      { bg: '#1B1816', ink: '#F7F4ED' },
    TYPE:       { bg: '#3D6FA0', ink: '#FFFFFF' },
    KEY:        { bg: '#7A4AC8', ink: '#FFFFFF' },
    SCREENSHOT: { bg: '#1F6E3F', ink: '#FFFFFF' },
    SCROLL:     { bg: '#5C5651', ink: '#FFFFFF' },
    DRAG:       { bg: '#5C5651', ink: '#FFFFFF' },
    MOVE:       { bg: '#9C948A', ink: '#FFFFFF' },
    WAIT:       { bg: '#9C948A', ink: '#FFFFFF' },
    DONE:       { bg: '#E07A86', ink: '#FFFFFF' },
    OTHER:      { bg: '#5C5651', ink: '#F7F4ED' },
  };
  const c = COLORS[kind] ?? COLORS.OTHER;
  return (
    <span
      className="absolute top-2 right-2 font-mono text-[9.5px] tracking-wider px-1.5 py-0.5 rounded font-bold"
      style={{ backgroundColor: c.bg, color: c.ink }}
    >
      {kind}
    </span>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-mono text-[10.5px] font-semibold px-2 py-1 rounded"
      style={{
        backgroundColor: '#FBF6E6',
        color: '#1B1816',
        border: '1px solid rgba(27,24,22,0.25)',
        boxShadow: '0 2px 0 rgba(27,24,22,0.35), 0 4px 8px -4px rgba(0,0,0,0.4)',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </span>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Cream module shell + Python syntax highlighting
// ─────────────────────────────────────────────────────────────────────────────

function CreamModule({
  label, dotColor, children,
}: {
  label: string;
  dotColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg p-3 flex flex-col w-full min-h-0"
      style={{
        backgroundColor: '#FBF6E6',
        boxShadow: '0 6px 16px -10px rgba(0,0,0,0.4)',
      }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span className="block size-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
        <span className="font-mono uppercase tracking-[0.18em] text-[9px]" style={{ color: '#5C5651' }}>
          {label}
        </span>
      </div>
      <div className="flex-1 flex flex-col min-h-0">{children}</div>
    </div>
  );
}

const PY_C = {
  text:     '#1B1816',
  comment:  '#998C75',
  string:   '#1F6E3F',
  keyword:  '#862D7A',
  builtin:  '#3D6FA0',
  decorator:'#D8714A',
  number:   '#D8714A',
  function: '#1F4E62',
};
const PY_KEYWORDS = new Set([
  'import','from','def','class','return','if','else','elif','for','while',
  'try','except','with','as','in','is','not','and','or','None','True','False',
  'pass','raise','finally','yield','lambda','global','nonlocal','assert',
  'break','continue','await','async',
]);
const PY_BUILTINS = new Set([
  'print','len','str','int','float','list','dict','tuple','range','open',
  'enumerate','zip','max','min','sum','abs','all','any','map','filter',
  'sorted','reversed','isinstance','type','object','Exception','os',
  'subprocess','pathlib','Path','Image','json','re','self','requests',
  'BeautifulSoup','time','datetime',
]);

function PyCode({ code }: { code: string }) {
  return (
    <pre
      className="font-mono text-[10px] leading-[1.55] p-2 rounded whitespace-pre overflow-auto flex-1 min-h-0"
      style={{
        backgroundColor: 'rgba(27,24,22,0.04)',
        border: '1px solid rgba(27,24,22,0.08)',
        fontFamily: CODE_FONT,
        color: PY_C.text,
        maxHeight: 360,
      }}
    >
      {code.split('\n').map((line, i) => (
        <div key={i}>{tokenize(line)}</div>
      ))}
    </pre>
  );
}

function tokenize(line: string): React.ReactNode[] {
  const RX = /(#[^\n]*)|("(?:\\.|[^"\\])*")|('(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)|(@\w+)|(\b[A-Za-z_][A-Za-z0-9_]*\b)|(\s+)|(.)/y;
  const out: React.ReactNode[] = [];
  let pos = 0;
  let key = 0;
  while (pos < line.length) {
    RX.lastIndex = pos;
    const m = RX.exec(line);
    if (!m) {
      out.push(<span key={key++}>{line.slice(pos)}</span>);
      break;
    }
    const text = m[0];
    let color = PY_C.text;
    if (m[1]) color = PY_C.comment;
    else if (m[2] || m[3]) color = PY_C.string;
    else if (m[4]) color = PY_C.number;
    else if (m[5]) color = PY_C.decorator;
    else if (m[6]) {
      if (PY_KEYWORDS.has(text)) color = PY_C.keyword;
      else if (PY_BUILTINS.has(text)) color = PY_C.builtin;
      else if (line.charAt(pos + text.length) === '(') color = PY_C.function;
    }
    if (color === PY_C.text) {
      out.push(<span key={key++}>{text}</span>);
    } else {
      out.push(<span key={key++} style={{ color }}>{text}</span>);
    }
    pos += text.length;
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Action arg parsing
// ─────────────────────────────────────────────────────────────────────────────

function parseClick(kind: string, arg?: string): { x: number; y: number } | null {
  if (kind !== 'CLICK' || !arg) return null;
  // Handle "[138, 291]", "(138, 291)", "138, 291"
  const m = arg.match(/(-?\d+)\s*,\s*(-?\d+)/);
  return m ? { x: +m[1], y: +m[2] } : null;
}
function parseKey(arg?: string): string[] {
  if (!arg) return [];
  return arg.split(/[+,]/).map((s) => s.trim()).filter(Boolean);
}
function parseType(arg?: string): string {
  if (!arg) return '';
  return arg.replace(/^["']|["']$/g, '').slice(0, 200);
}

// ─────────────────────────────────────────────────────────────────────────────
// Playback control buttons + small icons
// ─────────────────────────────────────────────────────────────────────────────

function PlayBtn({
  children, onClick, primary, disabled, title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="rounded-full flex items-center justify-center transition-all"
      style={{
        width: primary ? 38 : 30,
        height: primary ? 38 : 30,
        backgroundColor: primary ? '#1B1816' : '#FFFFFF',
        color: primary ? '#F7F4ED' : '#1B1816',
        border: primary ? 'none' : '1px solid rgba(27,24,22,0.15)',
        opacity: disabled ? 0.35 : 1,
        cursor: disabled ? 'default' : 'pointer',
        boxShadow: primary
          ? '0 4px 10px -4px rgba(27,24,22,0.45)'
          : '0 1px 2px rgba(27,24,22,0.08)',
      }}
    >
      {children}
    </button>
  );
}

function PrevIcon() { return <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M7 2 L4 5.5 L7 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function NextIcon() { return <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M4 2 L7 5.5 L4 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function PlayIcon() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 3 L11 7 L4 11 Z" fill="currentColor" /></svg>; }
function PauseIcon() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="3" y="2" width="2.5" height="9" fill="currentColor" /><rect x="7.5" y="2" width="2.5" height="9" fill="currentColor" /></svg>; }
function ResetIcon() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6 a 3.5 3.5 0 1 0 1 -2.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" /><path d="M3.5 1 L3.5 4 L6.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>; }
function Check({ color }: { color: string }) { return <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="flex-none"><path d="M2 6 L4.5 8.5 L9 3" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function Cross({ color }: { color: string }) { return <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="flex-none"><path d="M3 3 L8 8 M8 3 L3 8" stroke={color} strokeWidth="1.6" strokeLinecap="round" /></svg>; }