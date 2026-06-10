'use client'

// CUA-Gym slide deck — directly reuses the Remotion video scene components.
// Each slide has multiple "steps" (overlay levels): the right arrow advances
// the step within a slide; once the last step is shown, another right arrow
// advances to the next slide. Step transitions animate the underlying
// useCurrentFrame() value smoothly so the video's natural reveal animations
// play through.
//
// All UI chrome (thumbnail rail, top bar, presentation mode, keyboard nav,
// URL deep-linking) lives in the generic ../_shared/SlidesDeck wrapper.

import SlidesDeck, { type Slide } from '../_shared/SlidesDeck'
import { FrameContext } from './lib/remotion-shim'

import { Banner } from './components/Banner'
import { BackgroundIntro } from './components/BackgroundIntro'
import { ComputerUseTask } from './components/ComputerUseTask'
import { RewardScripter } from './components/RewardScripter'
import { EnvironmentScaling } from './components/EnvironmentScaling'
import { HowToScaleEnvs } from './components/HowToScaleEnvs'
import { HowToCombine } from './components/HowToCombine'
import { TaskExample } from './components/TaskExample'
import { TerminalUsageFinding } from './components/TerminalUsageFinding'
import { CLIHarnessEval } from './components/CLIHarnessEval'
import { ParetoFinding } from './components/ParetoFinding'
import { UnifiedAgent } from './components/UnifiedAgent'
// import { QwenHiring } from './components/QwenHiring' // hidden — see slide registry
import { DatasetResults } from './components/DatasetResults'
import { TrainingDetails } from './components/TrainingDetails'
import { ResultsScene } from './components/ResultsScene'
import { ScalingResults } from './components/ScalingResults'

import 'katex/dist/katex.min.css'

// Banner accepts an optional variant prop — type alias for the registry.
type BannerVariant = { variant?: 'intro' | 'outro' | 'teaser' }
const asBanner = <T,>(c: T) =>
  c as unknown as React.ComponentType<BannerVariant>

const SLIDES: Slide<never>[] = [
  { Component: Banner as unknown as Slide<never>['Component'],
    frames: [30],
    label: 'Title' },

  { Component: BackgroundIntro as unknown as Slide<never>['Component'],
    frames: [65, 100, 135, 240],
    label: 'RLVR works elsewhere' },

  { Component: ComputerUseTask as unknown as Slide<never>['Component'],
    frames: [45, 110, 220],
    label: 'Take a real CUA task' },

  { Component: RewardScripter as unknown as Slide<never>['Component'],
    frames: [40, 130, 260, 340, 420, 520, 670, 760, 890],
    label: 'Coding-agent reward scripter' },

  { Component: EnvironmentScaling as unknown as Slide<never>['Component'],
    frames: [80, 150, 220, 290, 410],
    label: '110 environments' },

  { Component: HowToScaleEnvs as unknown as Slide<never>['Component'],
    frames: [60, 160, 260],
    label: 'How do we scale environments?' },

  { Component: HowToCombine as unknown as Slide<never>['Component'],
    frames: [30, 90, 200, 290],
    label: 'How do we combine environments and tasks?' },

  { Component: TaskExample as unknown as Slide<never>['Component'],
    frames: [60],
    label: 'Example of a CUA-Gym task' },

  { Component: DatasetResults as unknown as Slide<never>['Component'],
    frames: [75, 270, 600],
    label: 'Dataset: distribution / coverage / comparison' },

  // Paper §3 (training details) — trajectory-slicing scaffold.
  //   step 0: title + full figure (direct sliding-window vs slicing comparison)
  //   step 1: + three advantage notes (i. / ii. / iii.)
  { Component: TrainingDetails as unknown as Slide<never>['Component'],
    frames: [40, 130],
    label: 'Training details — scaffold' },

  { Component: ResultsScene as unknown as Slide<never>['Component'],
    frames: [10, 90],
    label: 'GSPO-train on Qwen3.5' },

  { Component: ScalingResults as unknown as Slide<never>['Component'],
    frames: [100, 200],
    label: 'Both axes scale' },

  { Component: asBanner(Banner) as unknown as Slide<never>['Component'],
    frames: [30],
    props: { variant: 'outro' } as never,
    label: 'Try it out' },

  { Component: asBanner(Banner) as unknown as Slide<never>['Component'],
    frames: [30],
    props: { variant: 'teaser' } as never,
    label: "And what's next?" },

  { Component: TerminalUsageFinding as unknown as Slide<never>['Component'],
    frames: [30, 120, 220, 300, 380],
    label: 'Unexpected: terminal-usage rises' },

  { Component: CLIHarnessEval as unknown as Slide<never>['Component'],
    frames: [60, 200, 350],
    label: 'CLI harness on OSWorld' },

  { Component: ParetoFinding as unknown as Slide<never>['Component'],
    frames: [30, 130, 230, 330, 410, 620],
    label: 'CLI sits on the Pareto frontier' },

  { Component: UnifiedAgent as unknown as Slide<never>['Component'],
    frames: [30, 110, 200, 290],
    label: 'Unified Digital Agent' },

  // Hidden — closing CTA for the Qwen team. Re-enable when ready to show.
  // { Component: QwenHiring as unknown as Slide<never>['Component'],
  //   frames: [30, 120, 220, 330],
  //   label: 'Qwen team is hiring' },
]

export default function CUAGymSlidesPage({
  initialSlideIdx = 0,
}: {
  initialSlideIdx?: number
}) {
  return (
    <SlidesDeck
      slides={SLIDES}
      FrameContext={FrameContext}
      title="CUA-Gym"
      subtitle="Scaling Training for Computer-Use Agents · Bowen Wang"
      initialSlideIdx={initialSlideIdx}
    />
  )
}
