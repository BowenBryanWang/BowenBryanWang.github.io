import glob from 'fast-glob'

export interface MyArticle {
  title: string
  description: string
  publication: string
  author: string
  date: string
  link: string
  url: string
}


export const myarticles = [
  
    {
      author:
        'Bowen Wang*, Lihang Pan*, Chun Yu, Yuxuan Chen, Xiangyu Zhang, Yuanchun Shi',
      date: '2023-10',
      publication: 'ArXiv',
      title:
        'AutoTask: Executing Arbitrary Voice Commands by Exploring and Learning from Mobile GUI',
      description:
        'This paper presents AutoTask, a VCI capable of automating any task in any mobile application without configuration or modification from developers or end users. AutoTask executes VCIs on mobile (i.e. Android smartphones) by exploring and learning from UIs.',
      link: 'False',
      url: '#',
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
      link: 'False',
      url: '#',
    }
  ] 