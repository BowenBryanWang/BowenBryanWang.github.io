import glob from 'fast-glob'
import React from 'react'
import { StaticImageData } from 'next/image'
import computerArenaImage from '@/images/publications/arena.gif'
import opencuaImage from '@/images/publications/opencua.png'
import KimiVLImage from '@/images/publications/kimi-vl.png'
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
  }
}


export const myarticles = [
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
          React.createElement('span', { className: 'text-sm font-semibold' }, "ICLR'26 "),
        )
      ),
      title:
        'Computer Agent Arena: Evaluating Computer-Use Agents via Crowdsourcing from Real Users',
      description:
        'This work introduces Computer Agent Arena, a large-scale crowdsourcing framework for rigorously evaluating computer-use agents with real users across diverse, realistic tasks.',
      link: 'True',
      url: {
        website: 'https://arena.xlang.ai',
      },
      image: computerArenaImage
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
          React.createElement('span', { className: 'text-sm font-semibold' }, "NeurIPS'25 "),
          React.createElement('span', { className: 'text-sm font-semibold text-red-600 dark:text-red-400' }, '(Spotlight)'),
        ),
        React.createElement(
          'span',
          { className: 'inline-flex items-center gap-1' },
          React.createElement('span', { className: 'text-sm font-semibold' }, "COLM'25 AIA Workshop "),
          React.createElement('span', { className: 'text-sm font-semibold text-red-600 dark:text-red-400' }, '(Best Paper Award)'),
        )
      ),
      title: 'OpenCUA: Open Foundations for Computer-Use Agents',
      description:
        'OpenCUA presents a comprehensive open foundation for computer-use agents, including large-scale datasets, benchmarks, and models tailored for operating real-world GUIs.',
      link: 'True',
      url: {
        website: "https://opencua.xlang.ai",
        paper: 'https://arxiv.org/abs/2508.09123',
        code: "https://github.com/xlang-ai/OpenCUA"
      },
      image: opencuaImage
    },
    {
      author:
        'Kimi Team: Angang Du, Bohong Yin, Bowei Xing, Bowen Qu, Bowen Wang, Cheng Chen, Chenlin Zhang, Chenzhuang Du, Chu Wei, Congcong Wang, Dehao Zhang, Dikang Du, Dongliang Wang, Enming Yuan, Enzhe Lu, Fang Li, Flood Sung, Guangda Wei, Guokun Lai, Han Zhu, Hao Ding, Hao Hu, Hao Yang, et al.',
      date: '2025-04',
      publication: 'Technical Report',
      title: 'Kimi-VL Technical Report',
      description:
        'Kimi-VL is a large-scale vision-language model technical report detailing the architecture, training pipeline, and multimodal capabilities of the Kimi-VL family.',
      link: 'True',
      url: {
        paper: 'https://arxiv.org/abs/2504.07491',
      },
      image: KimiVLImage
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
        paper: "https://arxiv.org/abs/2312.16062"
      },
      image: AutoTaskImage
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
        paper: 'https://dl.acm.org/doi/abs/10.1145/3610929'
      },
      image: IPMImage
    }
  ] 