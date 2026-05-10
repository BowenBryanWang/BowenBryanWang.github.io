import SectionTitle from './SectionTitle';

type Finding = {
  label: string;
  src: string;
  alt: string;
  caption: React.ReactNode;
  lead: string;
  body: string;
};

const FINDINGS: Finding[] = [
  {
    label: 'i',
    src: '/figures/cua-gym/data_scale_horizontal_t.png',
    alt: 'Data scaling curves',
    caption: (
      <>
        <strong>Figure 5.</strong> OSWorld-Verified score and training reward
        vs. RL step on Qwen3.5-35B-A3B across three data scales (1.4K / 3K /
        12K verified tuples), initialized from the same SFT checkpoint.
      </>
    ),
    lead: 'More data, cleaner signal.',
    body: 'We ran three RL experiments at 1.4K, 3K, and 12K tuples to check whether the automated pipeline was producing reward hacking. It was not. Training reward and OSWorld success tracked together across all three scales with no oscillation or collapse, and the 12K curve was still climbing at the end of training. The information barrier was doing its job.',
  },
  {
    label: 'ii',
    src: '/figures/cua-gym/env_scale_t.png',
    alt: 'Environment scaling',
    caption: (
      <>
        <strong>Figure 6.</strong> OSWorld-Verified score under teacher
        distillation across environment counts. The broad setting
        (80 envs, 75 trajectories each) outperforms the narrow setting
        (10 envs, 300 each) despite 4x fewer trajectories per environment.
      </>
    ),
    lead: 'Environments and trajectories are not interchangeable.',
    body: 'The question we wanted to answer was whether expanding to 110 environments was worth the engineering cost, or whether we could have gotten the same gains by just generating more trajectories from fewer apps. The answer was clear: environment diversity and trajectory volume improve performance along distinct axes. You cannot trade one for the other. This retroactively justified a lot of the work we put into building the mock application suite.',
  },
  {
    label: 'iii',
    src: '/figures/cua-gym/tc_per_step_t.png',
    alt: 'Emergent action batching',
    caption: (
      <>
        <strong>Figure 7.</strong> Average tool calls per model step and
        effective trajectory length during RL training on CUA-Gym-A3B.
        The policy shifts from roughly 1 call per step at SFT initialization
        to a stable 1.4 to 1.9 band under RL.
      </>
    ),
    lead: 'The model learned to be efficient without being asked.',
    body: 'Partway through training, we noticed the policy was packing multiple actions into single turns — clicking through a sequence of menus in one step rather than one at a time. We never optimized for this explicitly. It emerged because RL with group-normalized rewards penalizes long trajectories relative to shorter ones that achieve the same outcome. The result was a 33 to 45 percent reduction in effective trajectory length at matched task success. It is a small reminder that RL optimizes what you measure, and sometimes finds shortcuts you did not anticipate.',
  },
];

export default function Findings() {
  return (
    <section className="pb-20">
      <div className="container-prose">
        <SectionTitle label="Findings" />
        <div className="prose-research mb-10">
          <p>
            Three things stood out from the analysis beyond the headline
            numbers. They each answer a question we were genuinely uncertain
            about going in.
          </p>
        </div>
      </div>

      <div className="relative left-1/2 -translate-x-1/2 w-[min(82rem,95vw)] px-2 sm:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-12">
          {FINDINGS.map((f) => (
            <FindingColumn key={f.label} f={f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FindingColumn({ f }: { f: Finding }) {
  return (
    <article className="flex flex-col">
      <figure className="m-0">
        <div className="rounded-md overflow-hidden p-3 flex items-center justify-center" style={{ minHeight: 200 }}>
          <img
            src={f.src}
            alt={f.alt}
            loading="lazy"
            className="block w-full h-auto max-h-72 object-contain"
          />
        </div>
        <figcaption className="mt-2 text-[12px] leading-[1.65] text-ink-soft px-1">
          {f.caption}
        </figcaption>
      </figure>

      <div className="flex items-baseline gap-3 mt-6 mb-3">
        <span className="display-italic text-oxblood text-[2rem] leading-none select-none">
          {f.label}.
        </span>
        <span className="h-px flex-1 bg-rule" />
      </div>

      <div className="prose-research">
        <p>
          <strong>{f.lead}</strong>{' '}{f.body}
        </p>
      </div>
    </article>
  );
}
