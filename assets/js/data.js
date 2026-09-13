const SITE_DATA = {
  site: {
    title: "Kun Xu | Academic Homepage",
    url: "https://xukun12138.github.io/",
    repository: "https://github.com/xukun12138/xukun12138.github.io"
  },
  analytics: {
    workerUrl: "https://xukun-homepage-analytics.xukun930.workers.dev"
  },
  profile: {
    name: "Kun Xu",
    chineseName: "许锟",
    role: "Ph.D. Candidate",
    affiliation: "Nanjing University of Aeronautics and Astronautics",
    department: "Cyberspace Security",
    location: "Nanjing, China",
    advisor: {
      name: "Prof. Yushu Zhang",
      url: "https://yushuzhang.cn/"
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
      "hero.eyebrow": "Ph.D. Candidate · Trustworthy AIGC",
      "hero.subtitle": "I study generative model security, uncertainty, and trustworthy AI, with a focus on concept-level risks in text-to-image generation and deepfake detection.",
      "hero.availability": "I have successfully completed my Ph.D. dissertation defense and expect to receive my Ph.D. in October 2026. I am currently seeking postdoctoral or faculty positions.",
      "hero.fact1": "Ph.D. candidate in Cyberspace Security",
      "hero.fact2": "Based at NUAA in Nanjing, China",
      "hero.fact3": "Generative concept security",
      "about.title": "A research profile built around safer generative AI.",
      "about.p1.prefix": "I am a Ph.D. candidate in Cyberspace Security at Nanjing University of Aeronautics and Astronautics (NUAA), advised by ",
      "about.p1.advisor": "Prof. Yushu Zhang",
      "about.p1.suffix": ". I have successfully completed my Ph.D. dissertation defense and expect to receive my Ph.D. in October 2026. I am currently continuing my research at NUAA in Nanjing, China.",
      "about.p2": "From September 2025 to August 2026, I conducted visiting doctoral research in Milan, Italy, supported by the China Scholarship Council (CSC) Excellence Talent Programme and supervised by Prof. Elena Ferrari. During the visit, I also engaged in academic exchange and research collaboration with Prof. Pierangela Samarati and Prof. Vincenzo Piuri at the University of Milan, further broadening my international research experience in trustworthy AI, security, and privacy.",
      "about.p3": "My research focuses on the safety, evaluation, and reliability of generative AI, including concept-level risk assessment, malicious and toxic content detection, uncertainty and calibration in diffusion models, privacy-aware synthesis, and deepfake forensics. My work has appeared in or been accepted by venues including IEEE TDSC and ACM Multimedia, and I am currently seeking postdoctoral or faculty opportunities.",
      "about.link.advisor": "Advisor",
      "about.link.visitingSupervisor": "Former Visiting Supervisor",
      "research.title": "Research themes",
      "research.subtitle": "A compact map of the topics that connect my current work.",
      "news.title": "Recent updates",
      "news.subtitle": "Selected milestones, submissions, talks, and awards.",
      "publications.title": "Publications and selected manuscripts",
      "publications.subtitle": "Filter by year, search by keyword, and copy BibTeX for each listed work.",
      "projects.title": "Research highlights",
      "projects.subtitle": "A more visual view of methods, artifacts, and active research directions.",
      "cv.title": "Academic timeline",
      "cv.subtitle": "A concise overview of my education, honors, academic service, and professional activities.",
      "cv.print": "Print / Save as PDF",
      "cv.viewPdf": "View Full CV",
      "contact.title": "Open to research conversations and collaboration.",
      "contact.subtitle": "If you are interested in generative model security, uncertainty, or trustworthy AI, feel free to reach out by email.",
      "contact.availability": "Ph.D. dissertation defense completed; degree expected in October 2026. I welcome conversations about postdoctoral and faculty opportunities."
    },
    zh: {
      "hero.eyebrow": "博士生 · 可信 AIGC",
      "hero.subtitle": "我的研究关注生成模型安全、不确定性与可信人工智能，重点围绕文生图生成中的概念级风险、内容安全和深度伪造检测。",
      "hero.availability": "我已顺利完成博士学位论文答辩，预计于 2026 年 10 月获得博士学位。目前正在寻求博士后或高校教职机会。",
      "hero.fact1": "网络空间安全博士生",
      "hero.fact2": "目前在南京（NUAA）开展研究",
      "hero.fact3": "生成式概念安全",
      "about.title": "围绕更安全的生成式人工智能展开研究。",
      "about.p1.prefix": "我是南京航空航天大学网络空间安全专业博士研究生，师从",
      "about.p1.advisor": "张玉书教授",
      "about.p1.suffix": "。我已顺利完成博士学位论文答辩，预计于 2026 年 10 月获得博士学位，目前在中国南京（NUAA）继续开展研究工作。",
      "about.p2": "2025 年 9 月至 2026 年 8 月，我受国家留学基金委（CSC）卓越人才计划项目资助，在意大利米兰开展访问博士研究，由 Elena Ferrari 教授指导。访学期间，我还与米兰大学 Pierangela Samarati 教授和 Vincenzo Piuri 教授开展学术交流与合作，进一步拓展了在可信人工智能、安全与隐私方向的国际研究经历。",
      "about.p3": "我的研究聚焦生成式人工智能的安全性、评估与可靠性，涵盖概念级风险评估、恶意与有害内容检测、扩散模型中的不确定性与校准、隐私感知生成以及深度伪造取证。相关成果已发表于或被 IEEE TDSC、ACM Multimedia 等期刊和会议接收，目前正在寻求博士后或高校教职机会。",
      "about.link.advisor": "导师",
      "about.link.visitingSupervisor": "访学导师",
      "research.title": "研究主题",
      "research.subtitle": "以下主题共同构成了我当前研究工作的主线。",
      "news.title": "近期动态",
      "news.subtitle": "论文投稿、接收、报告、访问和荣誉的精选记录。",
      "publications.title": "学术论文与代表性稿件",
      "publications.subtitle": "支持按年份筛选、关键词搜索，并可复制 BibTeX。",
      "projects.title": "研究亮点",
      "projects.subtitle": "以更可视化的方式展示方法、成果和正在推进的研究方向。",
      "cv.title": "学术经历",
      "cv.subtitle": "教育背景、荣誉、学术服务和专业活动的简要概览。",
      "cv.print": "打印 / 另存为 PDF",
      "cv.viewPdf": "查看完整简历",
      "contact.title": "欢迎围绕研究问题和合作机会交流。",
      "contact.subtitle": "如果你对生成模型安全、不确定性或可信 AI 感兴趣，欢迎通过邮件联系。",
      "contact.availability": "已顺利完成博士学位论文答辩，预计于 2026 年 10 月获得博士学位。欢迎就博士后或高校教职机会与我联系。"
    }
  },
  stats: [
    {
      value: "5",
      label: { en: "Publications", zh: "学术论文" },
      detail: { en: "TDSC, ACM MM, JCES, MTAP, TVCJ", zh: "覆盖 TDSC、ACM MM、JCES、MTAP、TVCJ" }
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
      date: { en: "Sep 2026", zh: "2026 年 9 月" },
      type: { en: "Milestone", zh: "学术里程碑" },
      title: {
        en: "I successfully completed my Ph.D. dissertation defense on September 8, 2026.",
        zh: "2026 年 9 月 8 日，我顺利完成博士学位论文答辩。"
      },
      links: [
        {
          label: { en: "Defense Photo", zh: "现场照片" },
          url: "assets/images/Thesis_Defense.jpg"
        }
      ],
      pinned: true,
      highlight: true
    },
    {
      date: { en: "Jul 2026", zh: "2026 年 7 月" },
      type: { en: "Accepted", zh: "接收" },
      title: {
        en: "A research work manuscript on Concept-Level Risk and Calibration has been accepted by ACM MM 2026 (CCF A).",
        zh: "一项关于概念级风险与校准的研究论文已被 ACM MM 2026（CCF A）接收。"
      },
      highlight: true
    },
    {
      date: { en: "Apr 2026", zh: "2026 年 4 月" },
      type: { en: "Submission", zh: "投稿" },
      title: {
        en: "A research work manuscript on Causal Concept-Driven Diffusion has been submitted for peer review.",
        zh: "一项关于因果概念驱动扩散模型的研究论文已提交同行评审。"
      }
    },
    {
      date: { en: "Apr 2026", zh: "2026 年 4 月" },
      type: { en: "Accepted", zh: "接收" },
      title: {
        en: "A research work manuscript on Malicious Concept Detection has been accepted by IEEE TDSC.",
        zh: "一项关于恶意概念检测的研究论文已被 IEEE TDSC 接收。"
      },
      highlight: true
    },
    {
      date: { en: "Feb 2026", zh: "2026 年 2 月" },
      type: { en: "Submission", zh: "投稿" },
      title: {
        en: "A research work manuscript on Uncertainty in Concept-Driven Diffusion Model has been submitted for peer review.",
        zh: "一项关于概念驱动扩散模型不确定性的研究论文已提交同行评审。"
      }
    },
    {
      date: { en: "Jan 2026", zh: "2026 年 1 月" },
      type: { en: "Submission", zh: "投稿" },
      title: {
        en: "A research work manuscript on deepfake detection has been submitted for peer review.",
        zh: "一项关于深度伪造检测的研究论文已提交同行评审。"
      }
    },
    {
      date: { en: "Nov 2025", zh: "2025 年 11 月" },
      type: { en: "Talk", zh: "学术交流" },
      title: {
        en: "A talk with Prof. Pierangela Samarati and Prof. Vincenzo Piuri at the Università degli Studi di Milano.",
        zh: "在米兰大学与 Pierangela Samarati 教授和 Vincenzo Piuri 教授进行学术交流。"
      },
      links: [
        { label: "Prof. Samarati", url: "https://samarati.di.unimi.it/" },
        { label: "Prof. Piuri", url: "https://piuri.di.unimi.it/" }
      ]
    },
    {
      date: { en: "Oct 2025", zh: "2025 年 10 月" },
      type: { en: "Talk", zh: "报告" },
      title: {
        en: "Minisymposium: Generative Concept Security in Trustworthy AIGC at the Università degli Studi dell'Insubria.",
        zh: "在因苏布里亚大学作题为“可信 AIGC 中的生成式概念安全”的专题报告。"
      },
      links: [
        { label: { en: "Slides", zh: "幻灯片" }, url: "assets/pdf/Concept.pdf" }
      ]
    },
    {
      date: { en: "Jul 2025", zh: "2025 年 7 月" },
      type: { en: "Award", zh: "荣誉" },
      title: {
        en: "Awarded the CSC Excellence Talent Program Scholarship.",
        zh: "获中国国家留学基金管理委员会（CSC）优秀人才项目奖学金。"
      },
      links: [
        { label: { en: "Letter", zh: "证明材料" }, url: "assets/pdf/CongratulatoryLetter.pdf" }
      ]
    }
  ],
  publications: [
    {
      id: "acmmm-2026-concept-risk-calibration",
      year: 2026,
      type: { en: "Conference", zh: "会议论文" },
      badges: ["ACM MM", "CCF A"],
      title: "Concept-Level Risk and Calibration for Governance in Diffusion Foundation Models",
      authors: ["Kun Xu", "Yushu Zhang", "Tao Wang", "Shuren Qi", "Barbara Carminati", "Elena Ferrari", "Yuming Fang"],
      venue: {
        en: "34th ACM International Conference on Multimedia",
        zh: "第 34 届 ACM 国际多媒体会议（ACM MM 2026）"
      },
      summary: {
        en: "A concept-level risk assessment and calibration framework for the governance of diffusion foundation models.",
        zh: "面向扩散基础模型治理的概念级风险评估与校准框架。"
      },
      selected: true,
      keywords: ["diffusion foundation models", "concept-level risk", "calibration", "governance"],
      links: [],
      bibtex: "@inproceedings{anonymous2026conceptlevel,\n  title={Concept-Level Risk and Calibration for Governance in Diffusion Foundation Models},\n  author={Kun Xu and Yushu Zhang and Tao Wang and Shuren Qi and Barbara Carminati and Elena Ferrari and Yuming Fang},\n  booktitle={34th ACM International Conference on Multimedia},\n  year={2026}\n}"
    },
    {
      id: "tdsc-2026-concept-detection",
      year: 2026,
      type: { en: "Journal", zh: "期刊论文" },
      badges: ["IEEE TDSC", "CCF A"],
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
      title: {
        en: "Concept-Level Risk and Calibration for Governance in Diffusion Foundation Models",
        zh: "面向扩散基础模型治理的概念级风险与校准"
      },
      status: "ACM MM 2026 · CCF A",
      image: "assets/images/CLRC.png",
      imageFit: "contain",
      summary: {
        en: "CLRC is a probabilistic audit and reporting framework for concept-level governance in diffusion foundation models.",
        zh: "CLRC 是一个面向扩散基础模型概念级治理的概率审计与报告框架。"
      },
      bullets: [
        {
          en: "Unifies risk comparison across SD1.5, SD2.1, and SDXL, including prompt, embedding, protocol, and recorded-condition pathways.",
          zh: "统一比较 SD1.5、SD2.1 与 SDXL 在提示词、嵌入、协议及记录条件等路径下的风险。"
        },
        {
          en: "Models reproduction and bypass as Bernoulli semantic events, with spillover reported as collateral risk.",
          zh: "将复现与绕过建模为 Bernoulli 语义事件，并将溢出作为附带风险进行报告。"
        },
        {
          en: "Shows that embedding access and obfuscated prompts can expose understated risks, while calibration can change actions near policy thresholds.",
          zh: "结果表明，嵌入访问和混淆提示可能暴露被低估的风险，而校准会改变策略阈值附近的决策。"
        }
      ],
      links: [
        { label: { en: "Paper", zh: "论文" }, url: "https://doi.org/10.1145/3767308.3835863" }
      ]
    },
    {
      title: {
        en: "ConceptQuickLook: Malicious Concept Detection",
        zh: "ConceptQuickLook：恶意概念检测"
      },
      status: "IEEE TDSC 2026",
      image: "assets/images/quicklook2025.png",
      summary: {
        en: "A research line on detecting malicious concepts in AI-generated content without first generating risky images.",
        zh: "无需先生成潜在风险图像，即可检测 AI 生成内容中的恶意概念。"
      },
      bullets: [
        { en: "Concept-file based judgment for safer AIGC moderation.", zh: "基于概念文件进行判断，实现更安全的 AIGC 内容治理。" },
        { en: "Designed around generative concept risk and direct model judgment.", zh: "围绕生成式概念风险与模型直接判断进行设计。" },
        { en: "Connected to the accepted IEEE TDSC work on malicious concept detection.", zh: "对应已被 IEEE TDSC 接收的恶意概念检测研究。" }
      ],
      links: [
        { label: { en: "Paper", zh: "论文" }, url: "https://ieeexplore.ieee.org/abstract/document/11494227" },
        { label: { en: "Code", zh: "代码" }, url: "https://github.com/xukun12138/ConceptQuickLook" }
      ]
    },
    {
      title: {
        en: "Generative Concept Security in Trustworthy AIGC",
        zh: "可信 AIGC 中的生成式概念安全"
      },
      status: "Minisymposium · 2025",
      image: "assets/images/concept-slides-cover.png",
      imageFit: "contain",
      summary: {
        en: "A talk and research framing around concept-level safety, uncertainty, and trustworthy generation.",
        zh: "围绕概念级安全、不确定性与可信生成展开的专题报告和研究框架。"
      },
      bullets: [
        { en: "Presented at the Università degli Studi dell'Insubria.", zh: "报告于意大利因苏布里亚大学。" },
        { en: "Connects concept security with trustworthy generative systems.", zh: "将概念安全与可信生成系统联系起来。" },
        { en: "Slides are included in the project assets for direct access.", zh: "可直接访问完整报告幻灯片。" }
      ],
      links: [
        { label: { en: "Slides", zh: "幻灯片" }, url: "assets/pdf/Concept.pdf" }
      ]
    },
    {
      title: { en: "Facial Depth Forgery Detection", zh: "人脸深度伪造检测" },
      status: "MTAP 2023",
      image: "assets/images/mtap2023.png",
      summary: {
        en: "A forensic method that uses image-gradient patterns to reveal facial depth forgery artifacts.",
        zh: "利用图像梯度模式揭示人脸深度伪造痕迹的取证方法。"
      },
      bullets: [
        { en: "Focuses on the boundary between normal and forged facial areas.", zh: "关注正常区域与伪造人脸区域之间的边界。" },
        { en: "Uses gradient cues as a compact signal for face manipulation analysis.", zh: "以梯度线索作为人脸篡改分析的紧凑信号。" },
        { en: "Published in Multimedia Tools and Applications.", zh: "发表于 Multimedia Tools and Applications。" }
      ],
      links: [
        { label: { en: "Paper", zh: "论文" }, url: "https://link.springer.com/article/10.1007/s11042-023-14626-4" }
      ]
    },
    {
      title: { en: "Video Face Forgery Detection", zh: "视频人脸伪造检测" },
      status: "TVCJ 2023",
      image: "assets/images/tvcj2023.png",
      summary: {
        en: "A video-level face forgery detection approach using facial motion and dense optical flow truncation.",
        zh: "利用人脸运动与稠密光流截断进行视频级人脸伪造检测。"
      },
      bullets: [
        { en: "Models motion differences caused by manipulated facial regions.", zh: "建模人脸篡改区域造成的运动差异。" },
        { en: "Uses optical-flow behavior as a forensic clue.", zh: "以光流行为作为取证线索。" },
        { en: "Published in The Visual Computer.", zh: "发表于 The Visual Computer。" }
      ],
      links: [
        { label: { en: "Paper", zh: "论文" }, url: "https://link.springer.com/article/10.1007/s00371-022-02683-z" }
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
    /*
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
    */
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
        { label: "PEARC'26", url: "https://pearc.acm.org/pearc26/"},
        { label: "SiMLA'26", url: "https://simlaacns.github.io/"}
      ]
    },
    {
      category: "Journal Reviewer",
      items: [
        { label: "CVIU", url: "https://www.sciencedirect.com/journal/computer-vision-and-image-understanding"},
        { label: "SIGPRO", url: "https://www.sciencedirect.com/journal/signal-processing"},
        { label: "JSCI", url: "https://link.springer.com/journal/11390"},
        { label: "Multimedia Systems", url: "https://link.springer.com/journal/530"},
        { label: "Expert Systems", url: "https://onlinelibrary.wiley.com/journal/14680394"},
        { label: "Scientific Reports", url: "https://www.nature.com/srep/"}
      ]
    },
    {
      category: "Conference Reviewer",
      items: [
        { label: "ACM MM", url: "https://2026.acmmm.org/"},
        { label: "ADFM", url: "https://adfmw.github.io/cvpr26/index.html"}
      ]
    },
    {
      category: "Membership",
      items: [
        { label: "ACM Emerging Interest Groups on Trustworthy and Responsible Systems (EIGTRUST)", url: "https://eigtrust.acm.org/" },
        { label: "China Society of Image and Graphics (CSIG)", url: "https://www.csig.org.cn/" }
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
