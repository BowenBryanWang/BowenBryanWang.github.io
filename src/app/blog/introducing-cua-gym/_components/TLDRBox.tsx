const POST_LINKS = {
  project: 'https://cua-gym.xlang.ai',
  code: 'https://github.com/BowenBryanWang/CUA-Gym-Websites',
  paper: '#',
};

export default function TLDRBox() {
  return (
    <aside className="mt-6 mb-4 rounded-xl border border-amber-200/60 bg-amber-50/40 dark:border-amber-900/30 dark:bg-amber-950/20 px-7 py-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg leading-none">⭐</span>
        <span className="font-mono text-[11px] uppercase tracking-widest text-amber-800 dark:text-amber-400 font-semibold">
          TL;DR
        </span>
      </div>

      <div className="prose-research text-[14px] leading-relaxed">
        <p>
          Building RLVR training data for GUI agents is hard — there is no
          natural corpus, no universal verifier, and real applications are
          inaccessible at rollout scale. We built <strong>CUA-Gym</strong>:{' '}
          <strong>32,122 verified (task, environment, reward) tuples</strong>{' '}
          across <strong>110 desktop and web environments</strong>, generated
          entirely by an automated co-generation pipeline with no human
          annotation per tuple.
        </p>

        <p className="mt-3 font-medium text-ink">Key Results:</p>
        <ul className="mt-1.5 space-y-1.5 list-none pl-0">
          <li className="flex gap-2">
            <span className="text-amber-700 dark:text-amber-400 mt-0.5 shrink-0">▸</span>
            <span>
              <strong>OSWorld-Verified:</strong> CUA-Gym-A3B lifts
              Qwen3.5-35B-A3B from 54.5 → <strong>62.1</strong>; CUA-Gym-A17B
              lifts 397B-A17B from 62.2 → <strong>70.2</strong>.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-700 dark:text-amber-400 mt-0.5 shrink-0">▸</span>
            <span>
              <strong>Out-of-distribution transfer:</strong> Both checkpoints
              improve on WebArena despite zero WebArena tasks in training,
              validating the synthetic sandbox approach.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-700 dark:text-amber-400 mt-0.5 shrink-0">▸</span>
            <span>
              <strong>Emergent efficiency:</strong> RL training induces
              unprompted action batching, reducing effective trajectory length
              by <strong>33–45%</strong> at matched task success.
            </span>
          </li>
        </ul>

        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px]">
          <a
            href={POST_LINKS.project}
            target="_blank"
            rel="noreferrer"
            className="text-amber-700 underline decoration-amber-700/40 underline-offset-[3px] hover:decoration-amber-700 dark:text-amber-300 dark:decoration-amber-300/40"
          >
            ↗ Project page
          </a>
          <a
            href={POST_LINKS.code}
            target="_blank"
            rel="noreferrer"
            className="text-amber-700 underline decoration-amber-700/40 underline-offset-[3px] hover:decoration-amber-700 dark:text-amber-300 dark:decoration-amber-300/40"
          >
            ↗ Code
          </a>
          <span className="text-zinc-400 dark:text-zinc-600">
            ↗ Paper <span className="italic">(coming soon)</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
