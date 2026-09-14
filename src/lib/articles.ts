import glob from 'fast-glob'
import React from 'react'
import { StaticImageData } from 'next/image'
import computerArenaImage from '@/images/publications/arena.gif'
import opencuaImage from '@/images/publications/opencua.png'
import AutoTaskImage from '@/images/publications/autotask.png'
import IPMImage from '@/images/publications/IPM.png'
export interface MyArticle {
  title: string
  description: string
  publication: string | React.ReactNode
  author: string
  date: string
  link: string
  image?: StaticImageData | string
  url: {
    website?: string
    paper?: string
    code?: string
    dataset?: string
    environments?: string
    blog?: string
    slide?: string
  }
}

export interface TechnicalReport {
  year: string
  title: string
  authors: string
  url?: string
}

export const technicalReports: TechnicalReport[] = [
  {
    year: '2026',
    title: 'Qwen-CUA: Native Computer Use for (almost) Everything',
    authors: 'The Qwen Team, Alibaba Group.',
    url: 'https://arxiv.org/abs/2608.02352',
  },
  {
    year: '2026',
    title: 'Qwen 3.5, Qwen 3.6, Qwen 3.7',
    authors: 'The Qwen Team, Alibaba Group.',
  },
  {
    year: '2026',
    title: 'Kimi K2.5: Visual Agentic Intelligence',
    authors: 'The Kimi Team.',
    url: 'https://arxiv.org/abs/2602.02276',
  },
  {
    year: '2025',
    title: 'Kimi-VL Technical Report',
    authors: 'The Kimi Team.',
    url: 'https://arxiv.org/abs/2504.07491',
  },
]

export const myarticles = [
  {
    author:
      'Mengqi Yuan, Zilong Zhou, Xinzhuang Xiong, Weiming Wu, Jiayang Sun, Jiamin Song, Kaiqian Cui, Bowen Wang, Haoyuan Wu, Yitong Li, Dunjie Lu, Haikong Lu, Qi Zhen, Xinyuan Wang, Jiaqi Deng, Yuhao Yang, Cheng Chen, Boyuan Zheng, Alex Su, Xiao Yu, Hao Zou, Saaket Agashe, Xing Han Lu, Manpreet Kaur, Zhengyang Qi, Vincent Sunn Chen, Frederic Sala, Dayiheng Liu, Junyang Lin, Zhou Yu, Yu Su, Siva Reddy, Xin Eric Wang, Peng Qi, Tianbao Xie, Tao Yu',
    date: '2026-06',
    publication: 'ArXiv',
    title: 'OSWorld 2.0: Benchmarking Computer Use Agents on Long-Horizon Real-World Tasks',
    description:
      'OSWorld 2.0 evaluates computer-use agents on 108 long-horizon, real-world workflows spanning everyday and professional tasks.',
    link: 'True',
    url: {
      website: 'https://osworld-v1.xlang.ai/',
      paper: 'https://arxiv.org/abs/2606.29537',
      code: 'https://github.com/xlang-ai/OSWorld',
    },
  },
  {
    author:
      'Bowen Wang, Dunjie Lu, Junli Wang, Tianyi Bai, Shixuan Liu, Zhipeng Zhang, Haiquan Wang, Hao Hu, Tianbao Xie, Shuai Bai, Dayiheng Liu, Que Shen, Junyang Lin, Tao Yu',
    date: '2026-05',
    publication: React.createElement(
      'span',
      { className: 'inline-flex flex-wrap items-center gap-2' },
      React.createElement(
        'span',
        { className: 'inline-flex items-center gap-1' },
        React.createElement(
          'span',
          { className: 'text-sm font-semibold' },
          'ArXiv',
        ),
      ),
    ),
    title:
      'CUA-Gym: Scaling Verifiable Training Environments and Tasks for Computer-Use Agents',
    description:
      'CUA-Gym scales verifiable training environments and tasks for computer-use agents, providing data, code, and reusable environments for training and evaluation.',
    link: 'True',
    url: {
      website: 'https://cua-gym.xlang.ai',
      paper: 'https://huggingface.co/papers/2605.25624',
      dataset: 'https://huggingface.co/datasets/xlangai/CUA-Gym',
      code: 'https://github.com/xlang-ai/CUA-Gym',
      environments: 'https://github.com/xlang-ai/CUA-Gym-Hub',
      blog: '/blog/introducing-cua-gym',
      slide: '/slides/cua-gym',
    },
    image: '/figures/cua-gym/main_figure.png',
  },
  {
    author:
      'Bowen Wang*, Xinyuan Wang*, Jiaqi Deng*, Tianbao Xie, Ryan Li, Yanzhe Zhang, Zicheng Gong, Gavin Li, Toh Jing Hua, Ion Stoica, Wei-Lin Chiang, Diyi Yang, Yu Su, Yi Zhang, Zhiguo Wang, Victor Zhong, Tao Yu',
    date: '2025-08',
    publication: React.createElement(
      'span',
      { className: 'inline-flex flex-wrap items-center gap-2' },
      React.createElement(
        'span',
        { className: 'inline-flex items-center gap-1' },
        React.createElement(
          'span',
          { className: 'text-sm font-semibold' },
          "ICLR'26 ",
          React.createElement(
            'span',
            { className: 'font-bold' },
            '(Top 3%)',
          ),
        ),
      ),
    ),
    title:
      'Computer Agent Arena: Evaluating Computer-Use Agents via Crowdsourcing from Real Users',
    description:
      'This work introduces Computer Agent Arena, a large-scale crowdsourcing framework for rigorously evaluating computer-use agents with real users across diverse, realistic tasks.',
    link: 'True',
    url: {
      website: 'https://arena.xlang.ai',
      paper: 'https://openreview.net/pdf?id=3x4SDbXbgl',
    },
    image: computerArenaImage,
  },
  {
    author:
      'Xinyuan Wang*, Bowen Wang*, Dunjie Lu, Junlin Yang, Tianbao Xie, Junli Wang, Jiaqi Deng, Xiaole Guo, Yiheng Xu, Chen Henry Wu, Zhennan Shen, Zhuokai Li, Ryan Li, Xiaochuan Li, Junda Chen, Boyuan Zheng, Peihang Li, Fangyu Lei, Ruisheng Cao, Yeqiao Fu, Dongchan Shin, Martin Shin, Jiariu Hu, Yuyan Wang, Jixuan Chen, Yuxiao Ye, Danyang Zhang, Yipu Wang, Heng Wang, Diyi Yang, Victor Zhong, Y. Charles, Zhilin Yang, Tao Yu',
    date: '2025-08',
    publication: React.createElement(
      'span',
      { className: 'inline-flex flex-wrap items-center gap-2' },
      React.createElement(
        'span',
        { className: 'inline-flex items-center gap-1' },
        React.createElement(
          'span',
          { className: 'text-sm font-semibold' },
          "NeurIPS'25 ",
        ),
        React.createElement(
          'span',
          { className: 'text-sm font-semibold text-red-600 dark:text-red-400' },
          '(Spotlight)',
        ),
      ),
      React.createElement(
        'span',
        { className: 'inline-flex items-center gap-1' },
        React.createElement(
          'span',
          { className: 'text-sm font-semibold' },
          "COLM'25 AIA Workshop ",
        ),
        React.createElement(
          'span',
          { className: 'text-sm font-semibold text-red-600 dark:text-red-400' },
          '(Best Paper Award)',
        ),
      ),
    ),
    title: 'OpenCUA: Open Foundations for Computer-Use Agents',
    description:
      'OpenCUA presents a comprehensive open foundation for computer-use agents, including large-scale datasets, benchmarks, and models tailored for operating real-world GUIs.',
    link: 'True',
    url: {
      website: 'https://opencua.xlang.ai',
      paper: 'https://arxiv.org/abs/2508.09123',
      code: 'https://github.com/xlang-ai/OpenCUA',
    },
    image: opencuaImage,
  },
  {
    author:
      'Bowen Wang*, Lihang Pan*, Chun Yu, Yuxuan Chen, Xiangyu Zhang, Yuanchun Shi',
    date: '2023-10',
    publication: 'ArXiv',
    title:
      'AutoTask: Executing Arbitrary Voice Commands by Exploring and Learning from Mobile GUI',
    description:
      'This paper presents AutoTask, a VCI capable of automating any task in any mobile application without configuration or modification from developers or end users. AutoTask executes VCIs on mobile (i.e. Android smartphones) by exploring and learning from UIs.',
    link: 'True',
    url: {
      paper: 'https://arxiv.org/abs/2312.16062',
    },
    image: AutoTaskImage,
  },
  {
    author:
      'Tian Huang, Chun Yu, Weinan Shi, Bowen Wang, David Yang, Yihao Zhu, Zhaoheng Li, Yuanchun Shi',
    date: '2023-02',
    publication: "IMWUT 22'",
    title:
      'Interaction Proxy Manager: Semantic Model Generation and Run-time Support for Reconstructing Ubiquitous User Interfaces of Mobile Services',
    description:
      'This paper introduces the Interaction Proxy, enabling mobile apps to adapt to new devices without a complete rebuild. Key contributions include the UIAD model and the IPManager tool, streamlining integration across platforms like mobile-smartwatch and mobile-vehicle.',
    link: 'True',
    url: {
      paper: 'https://dl.acm.org/doi/abs/10.1145/3610929',
    },
    image: IPMImage,
  },
]
