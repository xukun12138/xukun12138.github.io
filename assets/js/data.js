const SITE_DATA = {
  site: {
    title: "Kun Xu | Academic Homepage",
    url: "https://xukun12138.github.io/",
    repository: "https://github.com/xukun12138/xukun12138.github.io"
  },
  analytics: {
    // Set this after deploying analytics-worker, for example:
    // workerUrl: "https://xukun-homepage-analytics.YOUR_SUBDOMAIN.workers.dev"
    workerUrl: ""
  },
  profile: {
    name: "Kun Xu",
    chineseName: "许锟",
    role: "Ph.D. Student",
    affiliation: "Nanjing University of Aeronautics and Astronautics",
    department: "Cyberspace Security",
    location: "Nanjing, China / Milano, Italy",
    advisor: {
      name: "Prof. Yushu Zhang",
      url: "http://yushuzhang.cn/"
    },
    visitingSupervisor: {
      name: "Prof. Elena Ferrari",
      url: "https://dawsec.dicom.uninsubria.it/elena.ferrari/"
    },
    emails: [
      "xukun930@nuaa.edu.cn",
      "xukun930@gmail.com",
      "xukun12138@outlook.com"
    ],
    links: [
      { label: "Google Scholar", url: "https://scholar.google.com/citations?user=yDoybB0AAAAJ&hl=en" },
      { label: "ORCID", url: "https://orcid.org/0000-0002-1866-4433" },
      { label: "GitHub", url: "https://github.com/xukun12138" },
      { label: "DBLP", url: "https://dblp.org/pid/29/6948-19.html" },
      { label: "OpenReview", url: "https://openreview.net/profile?id=%7EKun_Xu10" },
      { label: "Semantic Scholar", url: "https://www.semanticscholar.org/author/Kun-Xu/2346642134" },
      { label: "LinkedIn", url: "https://www.linkedin.com/in/kun-xu-8b757b353/" },
      { label: "Zhihu", url: "https://www.zhihu.com/people/xu-kun-2016930" }
    ]
  },
  translations: {
    en: {
      "hero.eyebrow": "Ph.D. Student · Trustworthy AIGC",
      "hero.subtitle": "I study generative model security, uncertainty, and trustworthy AI, with a focus on concept-level risks in text-to-image generation and deepfake detection.",
      "hero.fact1": "Ph.D. at Cyberspace Security",
      "hero.fact2": "Visiting Ph.D. scholar in Italy",
      "hero.fact3": "Generative concept security",
      "about.title": "A research profile built around safer generative AI.",
      "about.p1": "I am a Ph.D. student at Nanjing University of Aeronautics and Astronautics, advised by Prof. Yushu Zhang. I am currently studying as a visiting Ph.D. scholar in Milano, Italy, under the supervision of Prof. Elena Ferrari.",
      "about.p2": "My work explores generative concept security, uncertainty analysis, causal analysis, personalized text-to-image generation, content toxicity detection, diffusion models, and foundation models.",
      "research.title": "Research themes",
      "research.subtitle": "A compact map of the topics that connect my current work.",
      "news.title": "Recent updates",
      "news.subtitle": "Selected milestones, submissions, talks, and awards.",
      "publications.title": "Journal articles and selected manuscripts",
      "publications.subtitle": "Filter by year, search by keyword, and copy BibTeX for each listed work.",
      "projects.title": "Research highlights",
      "projects.subtitle": "A more visual view of methods, artifacts, and active research directions.",
      "cv.title": "Academic timeline",
      "cv.subtitle": "A concise overview of my education, honors, academic service, and professional activities.",
      "contact.title": "Open to research conversations and collaboration.",
      "contact.subtitle": "If you are interested in generative model security, uncertainty, or trustworthy AI, feel free to reach out by email."
    },
    zh: {
      "hero.eyebrow": "博士生 · 可信 AIGC",
      "hero.subtitle": "我的研究关注生成模型安全、不确定性与可信人工智能，重点围绕文生图生成中的概念级风险、内容安全和深度伪造检测。",
      "hero.fact1": "网络空间安全博士生",
      "hero.fact2": "意大利米兰访问博士生",
      "hero.fact3": "生成式概念安全",
      "about.title": "围绕更安全的生成式人工智能展开研究。",
      "about.p1": "我是南京航空航天大学博士生，导师为张玉书教授。目前作为访问博士生在意大利米兰学习，由 Elena Ferrari 教授指导。",
      "about.p2": "我的研究方向包括生成式概念安全、不确定性分析、因果分析、个性化/定制化文生图生成、内容毒性检测、扩散模型和基础模型。",
      "research.title": "研究主题",
      "research.subtitle": "以下主题共同构成了我当前研究工作的主线。",
      "news.title": "近期动态",
      "news.subtitle": "论文投稿、接收、报告、访问和荣誉的精选记录。",
      "publications.title": "期刊论文与代表性稿件",
      "publications.subtitle": "支持按年份筛选、关键词搜索，并可复制 BibTeX。",
      "projects.title": "研究亮点",
      "projects.subtitle": "以更可视化的方式展示方法、成果和正在推进的研究方向。",
      "cv.title": "学术经历",
      "cv.subtitle": "教育背景、荣誉、学术服务和专业活动的简要概览。",
      "contact.title": "欢迎围绕研究问题和合作机会交流。",
      "contact.subtitle": "如果你对生成模型安全、不确定性或可信 AI 感兴趣，欢迎通过邮件联系。"
    }
  },
  stats: [
    {
      value: "4",
      label: { en: "Journal articles", zh: "期刊论文" },
      detail: { en: "TDSC, JCES, MTAP, TVCJ", zh: "覆盖 TDSC、JCES、MTAP、TVCJ" }
    },
    {
      value: "2023",
      label: { en: "Ph.D. start", zh: "博士入学" },
      detail: { en: "Nanjing University of Aeronautics and Astronautics", zh: "南京航空航天大学" }
    },
    {
      value: "2025",
      label: { en: "CSC scholarship", zh: "CSC 奖学金" },
      detail: { en: "Excellence Talent Program Scholarship", zh: "优秀人才项目奖学金" }
    },
    {
      value: "3",
      label: { en: "Core directions", zh: "核心方向" },
      detail: { en: "Security, uncertainty, trustworthy AI", zh: "安全、不确定性、可信 AI" }
    }
  ],
  researchThemes: [
    {
      title: { en: "Generative Model Security", zh: "生成模型安全" },
      summary: {
        en: "Concept-level detection and risk analysis for AIGC systems, especially text-to-image models.",
        zh: "面向 AIGC 系统，尤其是文生图模型，研究概念级检测与风险分析。"
      },
      keywords: ["AIGC", "T2I", "Diffusion", "Safety"],
      tone: "teal"
    },
    {
      title: { en: "Uncertainty and Calibration", zh: "不确定性与校准" },
      summary: {
        en: "Uncertainty analysis for concept-driven diffusion and model decisions under safety constraints.",
        zh: "研究概念驱动扩散模型中的不确定性，以及安全约束下的模型决策校准。"
      },
      keywords: ["Uncertainty", "Calibration", "Risk", "Reliability"],
      tone: "gold"
    },
    {
      title: { en: "Causal Concept Analysis", zh: "因果概念分析" },
      summary: {
        en: "Causal analysis of visual concepts, prompts, and generated content behavior.",
        zh: "围绕视觉概念、提示词与生成内容行为进行因果分析。"
      },
      keywords: ["Causality", "Concepts", "Foundation Models"],
      tone: "clay"
    },
    {
      title: { en: "Deepfake and Face Manipulation", zh: "深度伪造与人脸篡改" },
      summary: {
        en: "Forgery detection and defense methods for manipulated faces, depth cues, and facial motion.",
        zh: "面向人脸篡改、深度线索和面部运动的伪造检测与防御方法。"
      },
      keywords: ["Deepfake", "Forensics", "Adversarial Defense"],
      tone: "ink"
    }
  ],
  news: [
    {
      date: "Apr 2026",
      type: "Submission",
      title: "A research work manuscript on Causal Concept-Driven Diffusion has been submitted for peer review."
    },
    {
      date: "Apr 2026",
      type: "Accepted",
      title: "A research work manuscript on Malicious Concept Detection has been accepted by IEEE TDSC.",
      highlight: true
    },
    {
      date: "Apr 2026",
      type: "Submission",
      title: "A research work manuscript on Concept-Level Risk and Calibration has been submitted for peer review."
    },
    {
      date: "Feb 2026",
      type: "Submission",
      title: "A research work manuscript on Uncertainty in Concept-Driven Diffusion Model has been submitted for peer review."
    },
    {
      date: "Jan 2026",
      type: "Submission",
      title: "A research work manuscript on deepfake detection has been submitted for peer review."
    },
    {
      date: "Nov 2025",
      type: "Talk",
      title: "A talk with Prof. Pierangela Samarati and Prof. Vincenzo Piuri at the Università degli Studi di Milano.",
      links: [
        { label: "Prof. Samarati", url: "https://samarati.di.unimi.it/" },
        { label: "Prof. Piuri", url: "https://piuri.di.unimi.it/" }
      ]
    },
    {
      date: "Oct 2025",
      type: "Talk",
      title: "Minisymposium: Generative Concept Security in Trustworthy AIGC at the Università degli Studi dell'Insubria.",
      links: [
        { label: "Slides", url: "assets/pdf/Concept.pdf" }
      ]
    },
    {
      date: "Jul 2025",
      type: "Award",
      title: "Awarded the CSC Excellence Talent Program Scholarship.",
      links: [
        { label: "Letter", url: "assets/pdf/CongratulatoryLetter.pdf" }
      ]
    }
  ],
  publications: [
    {
      id: "tdsc-2026-concept-detection",
      year: 2026,
      type: "Journal",
      badge: "IEEE TDSC · CCF A",
      title: "Detecting Malicious Concepts Without Image Generation in AI-Generated Content (AIGC)",
      authors: ["Kun Xu", "Wenying Wen*", "Shuren Qi", "Tao Wang", "Yushu Zhang", "Yuming Fang"],
      venue: "IEEE Transactions on Dependable and Secure Computing",
      summary: "A concept-level detection approach for malicious concepts in AIGC that avoids generating potentially unsafe images before judgment.",
      selected: true,
      keywords: ["AIGC", "malicious concept detection", "diffusion", "safety"],
      links: [
        { label: "Paper", url: "https://ieeexplore.ieee.org/abstract/document/11494227" },
        { label: "Code", url: "https://github.com/xukun12138/ConceptQuickLook" }
      ],
      bibtex: "@article{xu2026detecting,\n  title={Detecting Malicious Concepts Without Image Generation in AI-Generated Content (AIGC)},\n  author={Xu, Kun and Wen, Wenying and Qi, Shuren and Wang, Tao and Zhang, Yushu and Fang, Yuming},\n  journal={IEEE Transactions on Dependable and Secure Computing},\n  year={2026}\n}"
    },
    {
      id: "jces-2025-face-defense",
      year: 2025,
      type: "Journal",
      badge: "JCES",
      title: "A Facial Manipulation Adversarial Defense Approach for Image Post-Processing",
      authors: ["Kun Xu", "Shuren Qi", "Yushu Zhang*", "Wenying Wen", "Hua Zhang"],
      venue: "Computer Engineering & Science",
      summary: "A defense-oriented study on facial manipulation and image post-processing for more robust visual forensics.",
      selected: true,
      keywords: ["face manipulation", "adversarial defense", "image post-processing"],
      links: [
        { label: "Homepage", url: "https://xukun12138.github.io/" }
      ],
      bibtex: "@article{xu2025facial,\n  title={A Facial Manipulation Adversarial Defense Approach for Image Post-Processing},\n  author={Xu, Kun and Qi, Shuren and Zhang, Yushu and Wen, Wenying and Zhang, Hua},\n  journal={Computer Engineering \\& Science},\n  year={2025}\n}"
    },
    {
      id: "mtap-2023-depth-forgery",
      year: 2023,
      type: "Journal",
      badge: "MTAP",
      title: "Facial depth forgery detection based on image gradient",
      authors: ["Kun Xu", "Gaoming Yang*", "Xianjin Fang", "Ji Zhang"],
      venue: "Multimedia Tools and Applications",
      summary: "A face forgery detection method that uses image-gradient cues around depth and boundary inconsistencies.",
      selected: true,
      keywords: ["deepfake detection", "image gradient", "facial depth"],
      links: [
        { label: "Paper", url: "https://link.springer.com/article/10.1007/s11042-023-14626-4" }
      ],
      bibtex: "@article{xu2023facial,\n  title={Facial depth forgery detection based on image gradient},\n  author={Xu, Kun and Yang, Gaoming and Fang, Xianjin and Zhang, Ji},\n  journal={Multimedia Tools and Applications},\n  year={2023}\n}"
    },
    {
      id: "tvcj-2023-video-face",
      year: 2023,
      type: "Journal",
      badge: "TVCJ",
      title: "Video face forgery detection via facial motion-assisted capturing dense optical flow truncation",
      authors: ["Gaoming Yang", "Kun Xu*", "Xianjin Fang", "Ji Zhang"],
      venue: "The Visual Computer",
      summary: "A video face forgery detection method built around facial motion and dense optical flow truncation.",
      selected: true,
      keywords: ["video forgery", "facial motion", "dense optical flow"],
      links: [
        { label: "Paper", url: "https://link.springer.com/article/10.1007/s00371-022-02683-z" }
      ],
      bibtex: "@article{yang2023video,\n  title={Video face forgery detection via facial motion-assisted capturing dense optical flow truncation},\n  author={Yang, Gaoming and Xu, Kun and Fang, Xianjin and Zhang, Ji},\n  journal={The Visual Computer},\n  year={2023}\n}"
    }
  ],
  projects: [
    {
      title: "ConceptQuickLook: Malicious Concept Detection",
      status: "IEEE TDSC 2026",
      image: "assets/images/quicklook2025.png",
      summary: "A research line on detecting malicious concepts in AI-generated content without first generating risky images.",
      bullets: [
        "Concept-file based judgment for safer AIGC moderation.",
        "Designed around generative concept risk and direct model judgment.",
        "Connected to the accepted IEEE TDSC work on malicious concept detection."
      ],
      links: [
        { label: "Paper", url: "https://ieeexplore.ieee.org/abstract/document/11494227" },
        { label: "Code", url: "https://github.com/xukun12138/ConceptQuickLook" }
      ]
    },
    {
      title: "Generative Concept Security in Trustworthy AIGC",
      status: "Minisymposium · 2025",
      image: "assets/images/hero-travel.jpg",
      summary: "A talk and research framing around concept-level safety, uncertainty, and trustworthy generation.",
      bullets: [
        "Presented at the Università degli Studi dell'Insubria.",
        "Connects concept security with trustworthy generative systems.",
        "Slides are included in the project assets for direct access."
      ],
      links: [
        { label: "Slides", url: "assets/pdf/Concept.pdf" }
      ]
    },
    {
      title: "Facial Depth Forgery Detection",
      status: "MTAP 2023",
      image: "assets/images/mtap2023.png",
      summary: "A forensic method that uses image-gradient patterns to reveal facial depth forgery artifacts.",
      bullets: [
        "Focuses on the boundary between normal and forged facial areas.",
        "Uses gradient cues as a compact signal for face manipulation analysis.",
        "Published in Multimedia Tools and Applications."
      ],
      links: [
        { label: "Paper", url: "https://link.springer.com/article/10.1007/s11042-023-14626-4" }
      ]
    },
    {
      title: "Video Face Forgery Detection",
      status: "TVCJ 2023",
      image: "assets/images/tvcj2023.png",
      summary: "A video-level face forgery detection approach using facial motion and dense optical flow truncation.",
      bullets: [
        "Models motion differences caused by manipulated facial regions.",
        "Uses optical-flow behavior as a forensic clue.",
        "Published in The Visual Computer."
      ],
      links: [
        { label: "Paper", url: "https://link.springer.com/article/10.1007/s00371-022-02683-z" }
      ]
    }
  ],
  education: [
    {
      period: "Sep. 2023 - Now",
      title: "Ph.D. Student, Cyberspace Security",
      institution: "Nanjing University of Aeronautics and Astronautics",
      location: "Nanjing, China"
    },
    {
      period: "Sep. 2020 - Jun. 2023",
      title: "M.E., Computer Science and Technology",
      institution: "Anhui University of Science and Technology",
      location: "Anhui, China"
    },
    {
      period: "Sep. 2016 - Jun. 2020",
      title: "B.E., Computer Science and Technology",
      institution: "Anhui University of Science and Technology",
      location: "Anhui, China"
    }
  ],
  honors: [
    {
      date: "Jul. 2025",
      title: "Excellence Talent Program Scholarship",
      organization: "China Scholarship Council (CSC)",
      link: "assets/pdf/CongratulatoryLetter.pdf"
    },
    {
      date: "Jun. 2023",
      title: "Outstanding Graduates",
      organization: "Anhui Provincial Department of Education"
    }
  ],
  services: [
    {
      category: "Program Committee",
      items: [
        { label: "ADFM2026 @ CVPR", url: "https://adfmw.github.io/cvpr26/index.html" },
        { label: "PEARC'26" },
        { label: "SiMLA'26" }
      ]
    },
    {
      category: "Journal Reviewer",
      items: [
        { label: "SIGPRO" },
        { label: "JSCI" },
        { label: "Multimedia Systems" },
        { label: "Expert Systems" }
      ]
    },
    {
      category: "Conference Reviewer",
      items: [
        { label: "ACM MM" },
        { label: "ADFM" },
        { label: "IECT" }
      ]
    },
    {
      category: "Membership",
      items: [
        { label: "ACM Emerging Interest Groups on Trustworthy and Responsible Systems (EIGTRUST)", url: "https://eigtrust.acm.org/" }
      ]
    }
  ]
};

if (typeof window !== "undefined") {
  window.SITE_DATA = SITE_DATA;
}

if (typeof module !== "undefined") {
  module.exports = SITE_DATA;
}
