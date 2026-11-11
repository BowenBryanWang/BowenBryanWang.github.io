/**
 * Faithful HTML reproduction of the CUA-Gym data synthesis pipeline
 * (paper Figure 1). Three modules on transparent canvas:
 *   1) Cream Task & Task-Generation cards (left)
 *   2) Dark Orchestrator with Generator + Discriminator (center)
 *   3) Cream Filter card + tuple output (right)
 */
import katex from 'katex';

const C = {
  bg: '#1F2127',
  panel: '#2A2C32',
  panelDeep: '#22242A',
  panelHead: '#15161A',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.14)',
  ink: '#E8E2D5',
  inkSoft: '#A09A8E',
  inkFaint: '#6B6760',
  amber: '#E8C273',     // $ commands
  amberSoft: '#C99B45',
  cyan: '#7BB7C9',      // > prompts
  pink: '#E07A86',
  red: '#D85959',
  redDeep: '#7A1F1F',
  green: '#7DAB7B',
  greenSoft: '#3D6E3F',
  hl: 'rgba(232,195,115,0.18)',  // task term highlight
};

export default function PipelineFigure() {
  return (
    <div
      className="font-system"
      style={{
        backgroundColor: 'transparent',
        color: '#1B1816',
      }}
    >
      <div className="grid grid-cols-12 gap-3 p-3">
        {/* ─────────── LEFT: cream Task + Task-Generation modules ─────────── */}
        <div className="col-span-12 lg:col-span-3 flex flex-col relative">
          <h3
            className="text-[12px] font-semibold tracking-tight pb-1.5 mb-3"
            style={{
              color: '#1B1816',
              borderBottom: '1px solid rgba(27,24,22,0.12)',
            }}
          >
            Data Synthesis Pipeline
          </h3>

          <TaskCard />
          <GenToTaskConnector />
          <TaskGenerationCard />

          <LeftToCenterArrow />
        </div>

        {/* ─────────── CENTER: Orchestrator ─────────── */}
        <div className="col-span-12 lg:col-span-6">
          <Card head="Orchestrator" headColor="#E8C273">
            {/* Top row: 3 sub-columns */}
            <div className="grid grid-cols-12 gap-3 p-3 text-[11.5px]">
              {/* Col A: 3 stacked $-commands */}
              <div className="col-span-4 space-y-2.5">
                <Cmd>Loading <InlineTag color="#7BB7C9">Task</InlineTag></Cmd>
                <Cmd>Loading <InlineTag color="#E8C273">Context</InlineTag></Cmd>
                <div>
                  <Cmd>Label <InlineTag color="#E07A86">Properties</InlineTag></Cmd>
                  <ul className="ml-5 mt-1 space-y-0.5 text-[10.5px]" style={{ color: C.inkSoft }}>
                    <li>· difficulty</li>
                    <li>· domain</li>
                    <li>· involved apps</li>
                  </ul>
                </div>
              </div>

              {/* Col B: VM screenshots */}
              <div className="col-span-4">
                <Cmd>Prepare VM environments</Cmd>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  <ScreenshotMini src="/figures/cua-gym/asset_1.png" />
                  <ScreenshotMini src="/figures/cua-gym/asset_1.png" />
                </div>
              </div>

              {/* Col C: agent loop with Python syntax highlighting */}
              <div className="col-span-4">
                <Cmd>Spawn Agent Loop</Cmd>
                <AgentLoopCode />
              </div>
            </div>

            {/* Generator + Discriminator side by side */}
            <div className="relative px-3 pb-3 pt-1 grid grid-cols-2 gap-3">
              <SubCard title="Generator" titleColor="#E8946F">
                <PromptStep prompt=">">
                  Loading <b>Task</b> and <b>Skills</b>
                </PromptStep>
                <PromptStep prompt=">">
                  Build envs from <Tag amber>initial_setup.py</Tag> &amp;{' '}
                  <Tag amber>golden_patch.py</Tag>
                </PromptStep>

                <div className="mt-1.5 mb-1.5 grid grid-cols-2 gap-1.5">
                  <ScreenshotLabeled
                    src="/figures/cua-gym/asset_2.png"
                    label="Initial Env"
                    labelColor={C.cyan}
                  />
                  <ScreenshotLabeled
                    src="/figures/cua-gym/asset_3.png"
                    label="Golden Env"
                    labelColor={C.amber}
                  />
                </div>

                <PromptStep prompt=">" muted>
                  Revise &amp; retry if rejected
                </PromptStep>
              </SubCard>

              <SubCard title="Discriminator" titleColor="#7BB7C9">
                <PromptStep prompt=">">
                  Loading <b>Task</b> and <b>Reward Skills</b>
                </PromptStep>
                <PromptStep prompt="">Decompose rewarding criteria</PromptStep>
                <ul className="ml-3 mt-1 mb-1.5 space-y-0.5 text-[10px]" style={{ color: C.inkSoft }}>
                  <li>· emails exist in Sent...</li>
                  <li>· reward email content match template...</li>
                  <li>· recipients match Notion DB...</li>
                </ul>
                <PromptStep prompt=">">
                  Draft <Tag amber>reward.py</Tag> &amp; verify in real envs.
                </PromptStep>

                <div className="mt-1 grid grid-cols-2 gap-1.5">
                  <ScreenshotLabeled src="/figures/cua-gym/asset_2.png" overlay="x" />
                  <ScreenshotLabeled src="/figures/cua-gym/asset_3.png" overlay="check" />
                </div>

                <PromptStep prompt=">" muted>
                  If not <i>fullfilled</i> ⟶ feedback &amp; retry
                </PromptStep>
              </SubCard>

              {/* Information Isolation barrier between G and D */}
              <InfoIsolation />
            </div>
          </Card>
        </div>

        {/* ─────────── RIGHT: cream Filter + minimal Output ─────────── */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-3">
          <CreamCard title="Filter" dotColor="#E07A86">
            <div className="space-y-3">
              {/* LLM Majority Voting with progress bars */}
              <div>
                <CreamHead>LLM Majority Voting</CreamHead>
                <ul className="mt-2 space-y-1.5">
                  {[
                    { label: 'consistency', score: 92 },
                    { label: 'executability', score: 88 },
                    { label: 'hack-risk', score: 95 },
                    { label: 'clarity', score: 90 },
                    { label: 'difficulty', score: 76 },
                  ].map((row) => (
                    <ProgressRow key={row.label} {...row} />
                  ))}
                </ul>
              </div>

              <div
                className="pt-2.5"
                style={{ borderTop: '1px dashed rgba(31,42,26,0.18)' }}
              >
                <CreamHead>Teacher Model Rollouts</CreamHead>
                <div className="mt-2 mb-2">
                  <img
                    src="/figures/cua-gym/asset_4.png"
                    alt="State action chain"
                    className="block w-full h-auto"
                  />
                </div>
                <ul className="space-y-0.5 text-[10.5px]" style={{ color: '#3F3D33' }}>
                  <li className="flex items-baseline gap-1.5">
                    <span style={{ color: '#A09A8E' }}>·</span>
                    <span>
                      Calculate <Math tex="\cos(t,\, r)" />
                    </span>
                  </li>
                  <li className="flex items-baseline gap-1.5">
                    <span style={{ color: '#A09A8E' }}>·</span>
                    <span>
                      Check <Math tex="\mathrm{reward}_{\mathrm{log}}" />
                    </span>
                  </li>
                  <li className="flex items-baseline gap-1.5">
                    <span style={{ color: '#A09A8E' }}>·</span>
                    <span>
                      Use VLM-as-a-judge to review <Math tex="s_n" />
                    </span>
                  </li>
                  <li className="flex items-baseline gap-1.5">
                    <span style={{ color: '#A09A8E' }}>·</span>
                    <span>Alignment check</span>
                  </li>
                </ul>
                <div
                  className="mt-2 inline-flex items-center gap-1.5 font-semibold text-[12px]"
                  style={{ color: '#1F6E3F' }}
                >
                  <Check color="#1F6E3F" /> Pass
                </div>
              </div>
            </div>
          </CreamCard>

          {/* Minimal output */}
          <div className="px-1 pt-1 pb-2 flex items-center justify-center">
            <div className="text-[15px]" style={{ color: '#1B1816' }}>
              <Math tex="\mathcal{D} = \{(t,\, s,\, r)\}" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Math helper (KaTeX)
// ─────────────────────────────────────────────────────────────────────────────

function Math({ tex, display = false }: { tex: string; display?: boolean }) {
  const html = katex.renderToString(tex, {
    displayMode: display,
    throwOnError: false,
    output: 'html',
  });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cream-themed Filter card + atoms
// ─────────────────────────────────────────────────────────────────────────────

function CreamCard({
  title,
  dotColor,
  children,
}: {
  title: string;
  dotColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg overflow-hidden relative"
      style={{
        backgroundColor: '#FBF6E6',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.04), 0 6px 16px -10px rgba(0,0,0,0.5)',
      }}
    >
      <div
        className="px-3 pt-2 pb-1.5 flex items-center gap-1.5"
        style={{ color: '#5C5651' }}
      >
        <span className="block size-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
        <span className="font-mono uppercase tracking-[0.18em] text-[9px]">
          {title}
        </span>
      </div>
      <div className="px-3 pb-3 text-[11.5px]" style={{ color: '#1F2A1A' }}>
        {children}
      </div>
    </div>
  );
}

function CreamHead({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-mono uppercase tracking-[0.16em] text-[9.5px]"
      style={{ color: '#5C5651' }}
    >
      &gt; {children}
    </div>
  );
}

function ProgressRow({ label, score }: { label: string; score: number }) {
  return (
    <li>
      <div className="flex items-baseline justify-between">
        <span className="text-[10.5px]" style={{ color: '#1F2A1A' }}>
          {label}
        </span>
        <span
          className="font-mono text-[9.5px] tabular-nums"
          style={{ color: '#5C5651' }}
        >
          {score}
        </span>
      </div>
      <div
        className="mt-0.5 h-[3px] rounded-full overflow-hidden"
        style={{ backgroundColor: 'rgba(31,42,26,0.10)' }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{
            width: `${score}%`,
            backgroundColor: '#E07A86',
          }}
        />
      </div>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Cards
// ─────────────────────────────────────────────────────────────────────────────

// macOS-Terminal style traffic lights
const TRAFFIC = { red: '#FF5F57', yellow: '#FEBC2E', green: '#28C840' };

const CODE_FONT = 'var(--font-mono)';

function Card({
  head,
  headColor = '#E8C273',
  children,
}: {
  head: string;
  headColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        backgroundColor: C.panel,
        boxShadow: `inset 0 0 0 1px ${C.border}, 0 6px 18px -8px rgba(0,0,0,0.5)`,
        fontFamily: CODE_FONT,
      }}
    >
      <div
        className="relative px-3 py-2 flex items-center"
        style={{
          background: 'linear-gradient(180deg, #2C2E34 0%, #232529 100%)',
          color: C.ink,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <span className="flex items-center gap-[5px] absolute left-3">
          <span className="block size-[10px] rounded-full" style={{ backgroundColor: TRAFFIC.red }} />
          <span className="block size-[10px] rounded-full" style={{ backgroundColor: TRAFFIC.yellow }} />
          <span className="block size-[10px] rounded-full" style={{ backgroundColor: TRAFFIC.green }} />
        </span>
        <span
          className="mx-auto text-[11.5px] font-semibold tracking-tight"
          style={{ color: headColor, fontFamily: CODE_FONT }}
        >
          {head}
        </span>
      </div>
      <div style={{ fontFamily: CODE_FONT }}>{children}</div>
    </div>
  );
}

function SubCard({
  title,
  titleColor = '#E8C273',
  children,
}: {
  title: string;
  titleColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-md overflow-hidden relative"
      style={{
        backgroundColor: C.panelDeep,
        boxShadow: `inset 0 0 0 1px ${C.border}`,
        fontFamily: CODE_FONT,
      }}
    >
      <div
        className="relative px-2.5 py-1.5 flex items-center"
        style={{
          background: 'linear-gradient(180deg, #2A2C32 0%, #202126 100%)',
          color: C.ink,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <span className="flex items-center gap-[4px] absolute left-2.5">
          <span className="block size-[8px] rounded-full" style={{ backgroundColor: TRAFFIC.red }} />
          <span className="block size-[8px] rounded-full" style={{ backgroundColor: TRAFFIC.yellow }} />
          <span className="block size-[8px] rounded-full" style={{ backgroundColor: TRAFFIC.green }} />
        </span>
        <span
          className="mx-auto text-[10.5px] font-semibold tracking-tight"
          style={{ color: titleColor, fontFamily: CODE_FONT }}
        >
          {title}
        </span>
      </div>
      <div className="p-2 space-y-0.5 text-[10.5px]" style={{ color: C.ink }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Python syntax-highlighted code block (One Dark palette)
// ─────────────────────────────────────────────────────────────────────────────

const PY = {
  kw: '#C678DD',
  fn: '#61AFEF',
  ident: '#E06C75',
  builtin: '#D19A66',
  punc: '#ABB2BF',
  comment: '#5C6370',
  text: '#ABB2BF',
};

function AgentLoopCode() {
  const T = (color: string, text: React.ReactNode) => (
    <span style={{ color }}>{text}</span>
  );
  return (
    <pre
      className="text-[9.5px] leading-[1.65] mt-1.5 p-2.5 rounded whitespace-pre overflow-x-auto"
      style={{
        backgroundColor: '#1B1D22',
        border: `1px solid ${C.border}`,
        fontFamily: CODE_FONT,
        color: PY.text,
      }}
    >
      {T(PY.kw, 'while')} {T(PY.kw, 'not')} {T(PY.ident, 'consensus')}{T(PY.punc, ':')}
{'\n    '}{T(PY.ident, 'g')} {T(PY.punc, '=')} {T(PY.fn, 'generator')}{T(PY.punc, '.')}{T(PY.fn, 'run')}{T(PY.punc, '()')}
{'\n    '}{T(PY.ident, 'reward')} {T(PY.punc, '=')} {T(PY.fn, 'discriminator')}{T(PY.punc, '.')}{T(PY.fn, 'run')}{T(PY.punc, '()')}
{'\n    '}{T(PY.kw, 'if')} {T(PY.kw, 'not')} {T(PY.fn, 'consensus')}{T(PY.punc, '.')}{T(PY.fn, 'check')}{T(PY.punc, '():')}
{'\n        '}{T(PY.builtin, 'retry')}
{'\n    '}{T(PY.kw, 'return')} {T(PY.punc, '(')}{T(PY.ident, 'task')}{T(PY.punc, ',')} {T(PY.ident, 'setup')}{T(PY.punc, ',')} {T(PY.ident, 'reward')}{T(PY.punc, ')')}
    </pre>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Atoms
// ─────────────────────────────────────────────────────────────────────────────

function H6({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-mono uppercase tracking-[0.16em] text-[10px] mb-2"
      style={{ color: C.inkSoft }}
    >
      {children}
    </div>
  );
}

function Hl({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-semibold not-italic"
      style={{
        color: C.amber,
        backgroundColor: C.hl,
        padding: '0 3px',
        borderRadius: 2,
      }}
    >
      {children}
    </span>
  );
}

function Cmd({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-baseline gap-1.5 leading-tight"
      style={{ fontFamily: CODE_FONT }}
    >
      <span className="font-mono" style={{ color: C.amber }}>
        $
      </span>
      <span style={{ color: C.ink }}>{children}</span>
    </div>
  );
}

function InlineTag({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <span
      className="font-mono text-[9.5px] px-1 py-px rounded-sm align-baseline ml-0.5"
      style={{
        backgroundColor: `${color}26`,
        color: color,
        border: `1px solid ${color}55`,
      }}
    >
      {children}
    </span>
  );
}

function PromptStep({
  prompt = '>',
  children,
  muted,
  bold,
  indent,
}: {
  prompt?: string;
  children: React.ReactNode;
  muted?: boolean;
  bold?: boolean;
  indent?: boolean;
}) {
  return (
    <div
      className={['flex items-baseline gap-1.5 leading-snug', indent ? 'pl-3' : ''].join(' ')}
      style={{ color: muted ? C.inkSoft : C.ink, opacity: muted ? 0.85 : 1 }}
    >
      {prompt ? (
        <span className="font-mono flex-none" style={{ color: C.cyan }}>
          {prompt}
        </span>
      ) : (
        <span className="w-2 flex-none" />
      )}
      <span className={bold ? 'font-semibold' : ''}>{children}</span>
    </div>
  );
}

function RunStep({
  prompt,
  command,
  tag,
  detail,
  detail2,
  last,
}: {
  prompt: string;
  command: string;
  tag: string;
  detail?: string;
  detail2?: string;
  last?: boolean;
}) {
  return (
    <div className={['relative pl-4', last ? '' : 'pb-3'].join(' ')}>
      <span
        className="absolute left-1 top-1.5 size-1.5 rounded-full"
        style={{ backgroundColor: C.cyan }}
      />
      {!last && (
        <span
          className="absolute left-[7px] top-3 bottom-0 w-px"
          style={{ backgroundColor: C.border }}
        />
      )}
      <div className="text-[11.5px] leading-snug">
        <span className="font-mono" style={{ color: C.cyan }}>
          {prompt}
        </span>{' '}
        <span style={{ color: C.ink }}>{command}</span>{' '}
        <Tag amber>{tag}</Tag>
      </div>
      {detail && (
        <div className="text-[10px] mt-0.5 leading-snug italic" style={{ color: C.inkFaint }}>
          {detail}
        </div>
      )}
      {detail2 && (
        <div className="text-[10px] leading-snug italic" style={{ color: C.inkFaint }}>
          {detail2}
        </div>
      )}
    </div>
  );
}

function Tag({
  children,
  amber,
}: {
  children: React.ReactNode;
  amber?: boolean;
}) {
  return (
    <span
      className="font-mono text-[10.5px] px-1 py-px rounded-sm"
      style={
        amber
          ? {
              backgroundColor: 'rgba(232,195,115,0.14)',
              color: C.amber,
              border: `1px solid rgba(232,195,115,0.22)`,
            }
          : {
              backgroundColor: 'rgba(255,255,255,0.06)',
              color: C.ink,
              border: `1px solid ${C.border}`,
            }
      }
    >
      {children}
    </span>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono" style={{ color: C.ink }}>
      {children}
    </span>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre
      className="font-mono text-[9.5px] leading-[1.55] mt-1.5 p-2 rounded whitespace-pre overflow-x-auto"
      style={{
        backgroundColor: C.panelHead,
        color: C.ink,
        border: `1px solid ${C.border}`,
      }}
    >
{children}
    </pre>
  );
}

function ScreenshotMini({ src }: { src: string }) {
  return (
    <div
      className="rounded overflow-hidden"
      style={{
        aspectRatio: '4 / 3',
        backgroundColor: C.panelHead,
        border: `1px solid ${C.border}`,
      }}
    >
      <img src={src} alt="" loading="lazy" className="block w-full h-full object-cover" />
    </div>
  );
}

function ScreenshotLabeled({
  src,
  label,
  labelColor,
  overlay,
}: {
  src: string;
  label?: string;
  labelColor?: string;
  overlay?: 'x' | 'check';
}) {
  return (
    <div className="relative">
      <div
        className="rounded overflow-hidden"
        style={{
          aspectRatio: '16 / 9',
          backgroundColor: C.panelHead,
          border: `1px solid ${C.border}`,
        }}
      >
        <img src={src} alt="" loading="lazy" className="block w-full h-full object-cover" />
      </div>
      {label && (
        <div
          className="absolute -bottom-1.5 left-1.5 px-1 py-0 font-mono text-[9px] rounded-sm"
          style={{
            backgroundColor: C.panelHead,
            color: labelColor ?? C.amber,
            border: `1px solid ${C.border}`,
          }}
        >
          {label}
        </div>
      )}
      {overlay === 'x' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="text-[28px] font-bold leading-none"
            style={{ color: C.red, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
          >
            ×
          </div>
        </div>
      )}
      {overlay === 'check' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M5 14 L11 20 L23 7"
              stroke={C.green}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))' }}
            />
          </svg>
        </div>
      )}
    </div>
  );
}

function Check({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="translate-y-[1px]">
      <path
        d="M2 6 4.5 8.5 9 3"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Left column: cream Task card + Task-Generation card
// ─────────────────────────────────────────────────────────────────────────────

const SERIF = '"Times New Roman", "Liberation Serif", Times, serif';

function TaskCard() {
  return (
    <div
      className="relative rounded-lg p-3"
      style={{
        backgroundColor: '#FBF6E6',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.04), 0 6px 16px -10px rgba(0,0,0,0.5)',
      }}
    >
      <div
        className="flex items-center gap-1.5 mb-1.5"
        style={{ color: '#5C5651' }}
      >
        <span
          className="block size-1.5 rounded-full"
          style={{ backgroundColor: '#E8C273' }}
        />
        <span className="font-mono uppercase tracking-[0.18em] text-[9px]">
          Task
        </span>
      </div>

      <div
        className="leading-snug text-[11.5px]"
        style={{ fontFamily: SERIF, color: '#1F2A1A' }}
      >
        <p>
          <span className="font-bold" style={{ color: '#7A3514' }}>
            Task:
          </span>{' '}
          <i>
            Can you please send an email to each client listed in the opened
            Notion page using the template from Gmail? You should attach their
            transactions in the <b>&apos;clients.xlsx&apos;</b> table on desktop.
          </i>
        </p>
        <p
          className="mt-2 text-[11px]"
          style={{ color: '#3F3D33', fontFamily: SERIF }}
        >
          <span className="font-bold" style={{ color: '#7A3514' }}>
            Context:
          </span>{' '}
          There should be 10 clients in the Notion database page, each with
          email listed, and an existing email template in the &apos;Sent&apos; folder of
          Gmail. The spreadsheet <b>&apos;clients.xlsx&apos;</b> is a complete document
          containing all clients during 2024 Q1–2025 Q4…
        </p>
      </div>

      {/* Notch for incoming arrow from below */}
      <span
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 size-2 rotate-45"
        style={{
          backgroundColor: '#FBF6E6',
          borderRight: '1px solid rgba(0,0,0,0.06)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
        aria-hidden="true"
      />
    </div>
  );
}

function TaskGenerationCard() {
  const branches = [
    {
      label: 'web_search',
      lines: [
        { tone: 'cmd', text: 'Searching on Reddit' },
        { tone: 'detail', text: '"how do people use gmail…"' },
        { tone: 'result', text: '↳ 14 threads · 3 saved' },
      ],
    },
    {
      label: 'Documents',
      lines: [
        { tone: 'cmd', text: 'Reading Notion docs' },
        { tone: 'detail', text: '+ Gmail templates' },
        { tone: 'result', text: '↳ 9 docs scanned' },
      ],
    },
    {
      label: 'assets/',
      lines: [
        { tone: 'cmd', text: 'Reading prepared assets' },
        { tone: 'detail', text: 'images / pdfs / tables' },
        { tone: 'result', text: '↳ clients.xlsx loaded' },
      ],
    },
  ];

  return (
    <div
      className="relative rounded-lg p-2.5"
      style={{
        backgroundColor: '#FBF6E6',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.04), 0 6px 16px -10px rgba(0,0,0,0.5)',
      }}
    >
      <div
        className="flex items-center justify-between mb-2"
        style={{ color: '#5C5651' }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="block size-1.5 rounded-full"
            style={{ backgroundColor: '#7BB7C9' }}
          />
          <span className="font-mono uppercase tracking-[0.18em] text-[9px]">
            Task Generation
          </span>
        </div>
        <span
          className="font-mono text-[9px] tracking-widest"
          style={{ color: '#A09A8E' }}
        >
          parallel · 3
        </span>
      </div>

      {/* Three branches */}
      <div className="grid grid-cols-3 gap-1">
        {branches.map((b, i) => (
          <Branch key={i} {...b} />
        ))}
      </div>
    </div>
  );
}

// Tree-shaped connector that sits between TaskGenerationCard (below) and
// TaskCard (above): three lines rise from the 3 branch column centres and
// converge into a single arrow pointing up at the bottom of the Task card.
function GenToTaskConnector() {
  return (
    <div className="relative h-7" aria-hidden="true">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 300 28"
        preserveAspectRatio="none"
      >
        {/* 3 lines from bottom (3 branch centres at x=50, 150, 250) up to a single
            convergence point at x=150 y=8, then a single trunk to top */}
        <path
          d="M50 28 L50 18 L150 12 L150 4"
          fill="none" stroke="#A09A8E" strokeWidth="0.9" strokeDasharray="3 3"
        >
          <animate attributeName="stroke-dashoffset" from="6" to="0" dur="1.8s" repeatCount="indefinite" />
        </path>
        <path
          d="M150 28 L150 4"
          fill="none" stroke="#A09A8E" strokeWidth="0.9" strokeDasharray="3 3"
        >
          <animate attributeName="stroke-dashoffset" from="6" to="0" dur="1.8s" repeatCount="indefinite" />
        </path>
        <path
          d="M250 28 L250 18 L150 12 L150 4"
          fill="none" stroke="#A09A8E" strokeWidth="0.9" strokeDasharray="3 3"
        >
          <animate attributeName="stroke-dashoffset" from="6" to="0" dur="1.8s" repeatCount="indefinite" />
        </path>
        {/* arrow head pointing up at top */}
        <path
          d="M146 6 L150 0 L154 6"
          fill="none" stroke="#A09A8E" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function Branch({
  label,
  lines,
}: {
  label: string;
  lines: { tone: string; text: string }[];
}) {
  return (
    <div
      className="rounded-md px-1.5 py-1.5 relative"
      style={{
        backgroundColor: 'rgba(31,33,39,0.04)',
        border: '1px solid rgba(31,33,39,0.08)',
      }}
    >
      <div className="flex items-center gap-1 mb-0.5">
        <span
          className="block size-1 rounded-full"
          style={{ backgroundColor: '#7BB7C9' }}
        />
        <span
          className="font-mono text-[9px]"
          style={{ color: '#3F3D33' }}
        >
          {label}
        </span>
      </div>
      <ul className="space-y-0.5">
        {lines.map((l, i) => (
          <li
            key={i}
            className="text-[8.5px] leading-tight"
            style={{
              color:
                l.tone === 'cmd'
                  ? '#1F2A1A'
                  : l.tone === 'detail'
                  ? '#5C5651'
                  : '#7A6F5A',
              fontFamily:
                l.tone === 'detail'
                  ? `${SERIF}`
                  : 'var(--font-mono)',
              fontStyle: l.tone === 'detail' ? 'italic' : 'normal',
            }}
          >
            {l.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

function BranchConverger() {
  // Drawn over the 3 branches — converges to a single point + arrow.
  return (
    <svg
      className="absolute left-0 right-0 -bottom-7 w-full h-7 pointer-events-none"
      viewBox="0 0 300 28"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* 3 vertical drops then converge to center */}
      <path
        d="M50 0 L50 8 L150 16 L150 22"
        fill="none"
        stroke="#A09A8E"
        strokeWidth="0.8"
        strokeDasharray="2 3"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-10"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </path>
      <path
        d="M150 0 L150 22"
        fill="none"
        stroke="#A09A8E"
        strokeWidth="0.8"
        strokeDasharray="2 3"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-10"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </path>
      <path
        d="M250 0 L250 8 L150 16 L150 22"
        fill="none"
        stroke="#A09A8E"
        strokeWidth="0.8"
        strokeDasharray="2 3"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-10"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </path>
      {/* arrow head pointing up */}
      <path
        d="M146 26 L150 22 L154 26"
        fill="none"
        stroke="#A09A8E"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LeftToCenterArrow() {
  // From the right edge of the Task card area, fly an arrow into the center column.
  return (
    <div
      className="hidden lg:flex items-center absolute right-[-14px] top-[110px] pointer-events-none"
      aria-hidden="true"
    >
      <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
        <line
          x1="0"
          y1="7"
          x2="22"
          y2="7"
          stroke="#A09A8E"
          strokeWidth="0.9"
          strokeDasharray="3 3"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-12"
            dur="2s"
            repeatCount="indefinite"
          />
        </line>
        <path
          d="M20 3 L26 7 L20 11"
          fill="none"
          stroke="#A09A8E"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function InfoIsolation() {
  return (
    <div className="absolute inset-y-2 left-1/2 -translate-x-1/2 w-3 flex items-center justify-center pointer-events-none z-10">
      <svg
        viewBox="0 0 12 200"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <line
          x1="6" y1="0" x2="6" y2="200"
          stroke={C.red}
          strokeWidth="1"
          strokeDasharray="3 4"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0" to="-14"
            dur="1.6s"
            repeatCount="indefinite"
          />
        </line>
      </svg>
      <div
        className="absolute -rotate-90 origin-center whitespace-nowrap font-semibold text-[9px] tracking-[0.3em] uppercase px-1.5 py-0.5 rounded-sm"
        style={{
          backgroundColor: C.bg,
          color: C.red,
          border: `1px solid ${C.border}`,
        }}
      >
        Information Isolation
      </div>
    </div>
  );
}
