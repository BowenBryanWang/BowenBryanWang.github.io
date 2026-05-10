// Centralized data for the homepage. All hrefs are placeholders the user
// will fill in later (paper PDF, code repo, dataset URL, author info).

export const PAPER = {
  title: 'CUA-Gym',
  subtitle:
    'Scaling Verifiable Training Environments and Tasks for Computer-Use Agents',
  tagline:
    'Co-generated task–environment–reward tuples for computer-use RL, grounded in real-world economic activity.',
  // TODO: confirm per-author affiliation marks; current marks are placeholders.
  // Affiliation indices: 1 = HKU, 2 = Qwen, 3 = UCSD, 4 = THU
  authors: [
    { name: 'Bowen Wang', aff: '1,2' },
    { name: 'Dunjie Lu', aff: '1,2' },
    { name: 'Junli Wang', aff: '3' },
    { name: 'Tianyi Bai', aff: '2' },
    { name: 'Shixuan Liu', aff: '2' },
    { name: 'Zhipeng Zhang', aff: '2' },
    { name: 'Haiquan Wang', aff: '2' },
    { name: 'Hao Hu', aff: '4' },
    { name: 'Shuai Bai', aff: '2' },
    { name: 'Dayiheng Liu', aff: '2' },
    { name: 'Que Shen', aff: '2' },
    { name: 'Junyang Lin', aff: '2' },
    { name: 'Tao Yu', aff: '1' },
  ],
  affiliations: [
    { mark: '1', name: 'The University of Hong Kong' },
    { mark: '2', name: 'Qwen Team, Alibaba' },
    { mark: '3', name: 'University of California, San Diego' },
    { mark: '4', name: 'Tsinghua University' },
  ],
  links: {
    paper: '#',
    arxiv: '#',
    code: 'https://github.com/BowenBryanWang/CUA-Gym-Websites',
    dataset: '#',
    apps: 'https://cua-gym-asana.xlang.ai',
  },
  venue: 'Preprint · 2026',
};

// Mocks grouped roughly by category. Slugs are the live cua-gym-{slug}.xlang.ai
// subdomains. Order within groups is alphabetical.
export const APP_GROUPS: Array<{ name: string; slugs: string[] }> = [
  {
    name: 'Communication & Social',
    slugs: [
      'discord', 'dingtalk', 'facebook', 'feishu', 'gmail', 'instagram',
      'linkedin', 'microsoft-teams', 'outlook-web', 'pinterest', 'reddit',
      'slack', 'twitter', 'wechat', 'weibo', 'xiaohongshu', 'zhihu',
      'zoom-web',
    ],
  },
  {
    name: 'Productivity & Documents',
    slugs: [
      'airtable', 'asana', 'canvas-lms', 'figma', 'google-calendar',
      'google-docs', 'google-drive', 'google-sheets', 'jira', 'lattice',
      'linear', 'lucidchart', 'miro', 'monday', 'notion', 'openreview',
      'trello',
    ],
  },
  {
    name: 'Development & Cloud',
    slugs: [
      'aws-console', 'azure', 'aliyun', 'circleci', 'cloudflare', 'datadog',
      'github', 'gitlab', 'postman', 'sentry', 'vercel', 'wandb',
    ],
  },
  {
    name: 'E-commerce & Travel',
    slugs: [
      'amazon', 'amazon-seller', 'booking-com', 'ebay', 'expedia', 'instacart',
      'shopify-admin', 'taobao-seller', 'tripadvisor', 'uber-eats',
      'woocommerce',
    ],
  },
  {
    name: 'Finance & Enterprise',
    slugs: [
      'bamboohr', 'california-tax', 'clio', 'coinbase', 'contractbook',
      'docusign', 'expensify', 'greenhouse', 'gusto', 'hubspot',
      'hubspot-marketing', 'paypal', 'quickbooks', 'robinhood', 'salesforce',
      'sap', 'servicenow', 'stripe-dashboard', 'tradingview', 'visa-portal-ds160',
      'workday',
    ],
  },
  {
    name: 'Analytics & Marketing',
    slugs: [
      'amplitude', 'google-ads', 'google-analytics', 'hotjar', 'klaviyo',
      'looker-studio', 'mailchimp', 'meta-ads', 'mixpanel', 'tableau',
    ],
  },
  {
    name: 'Other',
    slugs: [
      '12306', 'adp', 'epic-health', 'google-flights', 'pacs-viewer',
      'usa-gov', 'westlaw', 'youtube', 'zendesk', 'zillow',
    ],
  },
];

export const ALL_APP_COUNT = APP_GROUPS.reduce((n, g) => n + g.slugs.length, 0);

export const RESULTS = {
  proprietary: [
    { model: 'Claude Sonnet 4.6', osworld: '72.9', webarena: '65.6' },
    { model: 'Claude Opus 4.7', osworld: '78.0', webarena: '—' },
    { model: 'GPT-5.5', osworld: '78.7', webarena: '—' },
  ],
  openSource: [
    { model: 'EvoCUA-8B', osworld: '46.1', webarena: '—' },
    { model: 'EvoCUA-32B', osworld: '56.7', webarena: '—' },
    { model: 'OpenCUA-32B', osworld: '34.8', webarena: '—' },
    { model: 'OpenCUA-72B', osworld: '45.0', webarena: '—' },
    { model: 'Step-GUI-8B', osworld: '40.2', webarena: '—' },
    { model: 'Kimi-K2.6', osworld: '73.1', webarena: '—' },
  ],
  ours: [
    { model: 'Qwen3.5-35B-A3B', osworld: '54.5', webarena: '40.8', baseline: true },
    { model: 'Qwen3.5-397B-A17B', osworld: '62.2', webarena: '54.0', baseline: true },
    { model: 'CUA-Gym-A3B', osworld: '62.1', webarena: '44.5', highlight: true },
    { model: 'CUA-Gym-A17B', osworld: '70.2', webarena: '56.0', highlight: true },
  ],
};

export const FINDINGS = [
  {
    label: 'i',
    lead: 'Scaling RL data raises the ceiling of RL training.',
    body:
      'Three RL runs on Qwen3.5-35B-A3B at 1.4K / 3K / 12K verified tuples separate along data scale and preserve their ordering throughout training. The 12K run departs from the SFT baseline (0.53) earliest and sustains a visibly higher band; the 3K and 1.4K runs both plateau closer to the baseline, and the 12K curve shows no inflection toward saturation. All three runs improve monotonically — no oscillation, no collapse, no reward–success decoupling — evidence that the information barrier delivers a reward signal stable enough to support training across the data scales we examine.',
  },
  {
    label: 'ii',
    lead: 'Environment diversity and data volume scale RL along non-substitutable axes.',
    body:
      'An RL-grade ablation over environments is prohibitive, so we evaluate this in a teacher-distillation setup: roll out Claude-Sonnet-4.6 on CUA-Gym tasks, retain only $r=1$ trajectories, and SFT a Qwen3.5-35B-A3B student on three settings — narrow (10 envs · 300 traj/env), mid (80 envs · 38 traj/env), broad (80 envs · 75 traj/env). Narrow→mid (env diversity at fixed 3K total) yields a modest improvement; mid→broad (trajectory volume at fixed 80-env coverage) yields a substantially larger one. Neither axis subsumes the other, and the broad student approaches the RL-trained 12K run despite using no RL infrastructure.',
  },
  {
    label: 'iii',
    lead: 'Emergent action batching under RL.',
    body:
      'A behavior we did not optimize for emerges during RL: average tool calls per model step rise from ~1 at SFT initialization to a stable 1.4–1.9 band, shortening effective trajectory length by 33–45% at matched task success. We attribute this to step-budget pressure under group-normalized advantage — trajectories that finish within budget earn higher relative reward. Inspection confirms the policy packs deterministic chains such as click(File)→click(Export)→click(PDF) into a single turn while holding back actions whose outcomes depend on non-deterministic state (network responses, dialogs requiring visual verification). The policy has internalized a coarse model of which actions safely admit batching, paralleling the spontaneous emergence of self-reflection in reasoning-focused RL.',
  },
];

export const BIBTEX = `@article{cuagym2026,
  title   = {CUA-Gym: Scaling Verifiable Training Environments
             and Tasks for Computer-Use Agents},
  author  = {Anonymous},
  journal = {arXiv preprint},
  year    = {2026},
}`;
