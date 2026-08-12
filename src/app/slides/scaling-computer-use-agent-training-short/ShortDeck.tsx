'use client'

import SlidesDeck, { type Slide } from '../_shared/SlidesDeck'
import { FrameContext } from '../cua-gym/lib/remotion-shim'

import { EnvironmentScaling } from '../cua-gym/components/EnvironmentScaling'
import {
  ParetoFinding,
  TrainingShiftFinding,
} from '../cua-gym/components/ParetoFinding'
import { ResultsScene } from '../cua-gym/components/ResultsScene'
import { RewardScripter } from '../cua-gym/components/RewardScripter'

import {
  BackgroundOverviewSlide,
  CUAProExamplesSlide,
  PersonalIntroSlide,
  UDAExamplesSlide,
  WhatsNextCUAProUDASlide,
} from '../scaling-computer-use-agent-training/components/ResearchIntroSlides'

const asSlide = (Component: React.ComponentType) =>
  Component as unknown as Slide<never>['Component']

const SLIDES: Slide<never>[] = [
  {
    Component: asSlide(PersonalIntroSlide),
    frames: [60],
    label: 'Personal intro',
  },
  {
    Component: asSlide(BackgroundOverviewSlide),
    frames: [100],
    label: 'Background overview',
  },
  {
    Component: RewardScripter as unknown as Slide<never>['Component'],
    frames: [890],
    props: { titleOverride: 'CUA-Gym: Task Scaling' } as never,
    label: 'CUA-Gym task scaling',
  },
  {
    Component: EnvironmentScaling as unknown as Slide<never>['Component'],
    frames: [410],
    props: { titleOverride: 'CUA-Gym: Environment Scaling' } as never,
    label: 'CUA-Gym environment scaling',
  },
  {
    Component: ResultsScene as unknown as Slide<never>['Component'],
    frames: [90],
    label: 'CUA-Gym results',
  },
  {
    Component: ParetoFinding as unknown as Slide<never>['Component'],
    frames: [620],
    props: { titleOverride: 'Why we need Unified Digital Agents' } as never,
    label: 'OSWorld-2.0 steps',
  },
  {
    Component: asSlide(WhatsNextCUAProUDASlide),
    frames: [120],
    label: "What's next",
  },
  {
    Component: asSlide(CUAProExamplesSlide),
    frames: [90],
    label: 'CUA-Pro examples',
  },
  {
    Component: asSlide(UDAExamplesSlide),
    frames: [90],
    label: 'UDA-Gym examples',
  },
  {
    Component: asSlide(TrainingShiftFinding),
    frames: [360],
    label: 'CUA-Pro and UDA-Gym shifts',
  },
]

export default function ShortDeck({
  initialSlideIdx = 0,
}: {
  initialSlideIdx?: number
}) {
  return (
    <SlidesDeck
      slides={SLIDES}
      FrameContext={FrameContext}
      title="Scaling Computer-Use Agent Training"
      subtitle="Short version - Bowen Wang"
      initialSlideIdx={initialSlideIdx}
    />
  )
}
