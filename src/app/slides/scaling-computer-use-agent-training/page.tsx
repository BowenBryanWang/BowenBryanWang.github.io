'use client'

import SlidesDeck, { type Slide } from '../_shared/SlidesDeck'
import { FrameContext } from '../cua-gym/lib/remotion-shim'

import { Banner } from '../cua-gym/components/Banner'
import { BackgroundIntro } from '../cua-gym/components/BackgroundIntro'
import { ComputerUseTask } from '../cua-gym/components/ComputerUseTask'
import { RewardScripter } from '../cua-gym/components/RewardScripter'
import { EnvironmentScaling } from '../cua-gym/components/EnvironmentScaling'
import { HowToScaleEnvs } from '../cua-gym/components/HowToScaleEnvs'
import { DatasetResults } from '../cua-gym/components/DatasetResults'
import { TrainingDetails } from '../cua-gym/components/TrainingDetails'
import { ResultsScene } from '../cua-gym/components/ResultsScene'
import { ScalingResults } from '../cua-gym/components/ScalingResults'
import { TerminalUsageFinding } from '../cua-gym/components/TerminalUsageFinding'
import { CLIHarnessEval } from '../cua-gym/components/CLIHarnessEval'
import { ParetoFinding } from '../cua-gym/components/ParetoFinding'
import { UnifiedAgent } from '../cua-gym/components/UnifiedAgent'

import {
  AgentNetDatasetSlide,
  OpenCUAQuestion,
  OpenCUAResultsSlide,
  OpenCUATrainingSlide,
  ThesisMap,
  TitleSlide,
} from './components/ResearchIntroSlides'
import {
  IndustrialExperienceRLSlide,
  IndustrialExperienceScalingSlide,
  IndustrialFoundationTimelineSlide,
  IndustrialTrainingSectionSlide,
  WhatsNextSlide,
} from './components/IndustrialTrainingSlides'

const asSlide = (Component: React.ComponentType) =>
  Component as unknown as Slide<never>['Component']

type BannerVariant = { variant?: 'intro' | 'outro' | 'teaser' }
const asBanner = <T,>(c: T) =>
  c as unknown as React.ComponentType<BannerVariant>

const SLIDES: Slide<never>[] = [
  {
    Component: asSlide(TitleSlide),
    frames: [30, 110],
    label: 'Title',
  },
  {
    Component: asSlide(ThesisMap),
    frames: [48, 118],
    label: 'Research arc',
  },
  {
    Component: asSlide(OpenCUAQuestion),
    frames: [40, 90, 140],
    label: 'Scaling data is not enough',
  },
  {
    Component: asSlide(AgentNetDatasetSlide),
    frames: [50],
    label: 'AgentNet data',
  },
  {
    Component: asSlide(OpenCUATrainingSlide),
    frames: [150],
    label: 'OpenCUA training recipe',
  },
  {
    Component: asSlide(OpenCUAResultsSlide),
    frames: [90],
    label: 'OpenCUA scaling result',
  },
  {
    Component: Banner as unknown as Slide<never>['Component'],
    frames: [30],
    label: 'CUA-Gym title',
  },
  {
    Component: BackgroundIntro as unknown as Slide<never>['Component'],
    frames: [65, 100, 135, 240],
    label: 'RLVR works elsewhere',
  },
  {
    Component: ComputerUseTask as unknown as Slide<never>['Component'],
    frames: [45, 110, 220],
    label: 'Take a real CUA task',
  },
  {
    Component: RewardScripter as unknown as Slide<never>['Component'],
    frames: [890],
    label: 'Reward scripter',
  },
  {
    Component: EnvironmentScaling as unknown as Slide<never>['Component'],
    frames: [80, 150, 220, 290, 410],
    label: 'Scaling environments',
  },
  {
    Component: HowToScaleEnvs as unknown as Slide<never>['Component'],
    frames: [260],
    label: 'How do we scale environments?',
  },
  {
    Component: DatasetResults as unknown as Slide<never>['Component'],
    frames: [75, 270, 600],
    label: 'CUA-Gym dataset',
  },
  {
    Component: TrainingDetails as unknown as Slide<never>['Component'],
    frames: [40, 130],
    label: 'Training details',
  },
  {
    Component: ResultsScene as unknown as Slide<never>['Component'],
    frames: [10, 90],
    label: 'CUA-Gym results',
  },
  {
    Component: ScalingResults as unknown as Slide<never>['Component'],
    frames: [100, 200],
    label: 'Both axes scale',
  },
  {
    Component: asBanner(Banner) as unknown as Slide<never>['Component'],
    frames: [30],
    props: { variant: 'outro' } as never,
    label: 'Try it out',
  },
  {
    Component: asSlide(IndustrialTrainingSectionSlide),
    frames: [30],
    label: 'Industrial computer-use agent training',
  },
  {
    Component: asSlide(IndustrialFoundationTimelineSlide),
    frames: [30],
    label: 'Industrial foundation model timeline',
  },
  {
    Component: asSlide(IndustrialExperienceScalingSlide),
    frames: [30],
    label: 'Industrial experiences: environment and data scaling',
  },
  {
    Component: asSlide(IndustrialExperienceRLSlide),
    frames: [30],
    label: 'Industrial experiences: RL and delivery',
  },
  {
    Component: asSlide(WhatsNextSlide),
    frames: [30],
    label: "What's Next?",
  },
  {
    Component: TerminalUsageFinding as unknown as Slide<never>['Component'],
    frames: [380],
    label: 'Unexpected: terminal-usage rises',
  },
  {
    Component: CLIHarnessEval as unknown as Slide<never>['Component'],
    frames: [60, 200, 350],
    label: 'CLI harness on OSWorld',
  },
  {
    Component: ParetoFinding as unknown as Slide<never>['Component'],
    frames: [30, 130, 230, 330, 410, 620],
    label: 'CLI sits on the Pareto frontier',
  },
  {
    Component: UnifiedAgent as unknown as Slide<never>['Component'],
    frames: [30, 110, 200, 290],
    label: 'Unified Digital Agent',
  },
]

export default function ScalingComputerUseAgentTrainingSlidesPage({
  initialSlideIdx = 0,
}: {
  initialSlideIdx?: number
}) {
  return (
    <SlidesDeck
      slides={SLIDES}
      FrameContext={FrameContext}
      title="Scaling Computer-Use Agent Training"
      subtitle="From OpenCUA to CUA-Gym - Bowen Wang"
      initialSlideIdx={initialSlideIdx}
    />
  )
}
