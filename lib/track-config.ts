export const TRACK_SLUGS = [
  "neet",
  "ctet",
  "ssc",
  "railway",
  "banking",
  "cuet",
  "class-10",
  "niit",
  "police",
  "teacher",
  "state",
] as const;

export type TrackSlug = (typeof TRACK_SLUGS)[number];

export type QuickAction = {
  /** path or onClick href */
  href: string;
  /** lucide icon name (kept as string so client picks at render) */
  icon:
    | "Brain"
    | "Sparkles"
    | "Target"
    | "Calculator"
    | "BookOpen"
    | "Calendar"
    | "Flame"
    | "Trophy"
    | "FileText"
    | "Languages"
    | "ShieldCheck"
    | "Radar"
    | "GraduationCap"
    | "Newspaper"
    | "TestTube"
    | "Megaphone"
    | "Building2"
    | "Train"
    | "Landmark"
    | "Users"
    | "Shield"
    | "School"
    | "Map";
  /** short title */
  title: string;
  /** one-line subtitle */
  sub: string;
  /** tailwind color class (text) for icon */
  accent: string;
};

export type TrackConfig = {
  slug: TrackSlug;
  name: string;
  short: string;
  tagline: string;
  taglineHi: string;
  /** css gradient string for hero background */
  gradient: string;
  /** small flair color used on chips/badges */
  badge: string;
  heroIcon: QuickAction["icon"];
  signatureFeature: { title: string; titleHi: string; sub: string; subHi: string; href: string };
  focusSubjects: string[];
  quickActions: QuickAction[];
  /** unique gimmick label rendered as a chip near the hero */
  vibe: string;
};

const COMMON: QuickAction[] = [
  { href: "/doubt", icon: "Brain", title: "AI Doubt Solver", sub: "Step-by-step instant answer", accent: "text-fuchsia-500" },
  { href: "/predict", icon: "Sparkles", title: "Predicted Test", sub: "AI-curated paper for ₹8", accent: "text-amber-400" },
  { href: "/planner", icon: "Calendar", title: "Study Planner", sub: "Daily schedule from your weakness", accent: "text-emerald-500" },
];

export const TRACK_CONFIGS: Record<TrackSlug, TrackConfig> = {
  neet: {
    slug: "neet",
    name: "NEET",
    short: "National Eligibility cum Entrance Test (UG)",
    tagline: "Physics + Chemistry + Biology — NTA-calibrated mastery",
    taglineHi: "फिजिक्स + केमिस्ट्री + बायोलॉजी — NTA पैटर्न के साथ महारत",
    gradient: "from-emerald-500 via-teal-500 to-lime-500",
    badge: "bg-emerald-500/20 text-emerald-300",
    heroIcon: "TestTube",
    vibe: "Bio + Phys + Chem",
    signatureFeature: {
      title: "Biology Drill",
      titleHi: "बायोलॉजी ड्रिल",
      sub: "30-Q daily biology rapid set — NCERT line-by-line",
      subHi: "रोज़ 30 प्रश्न बायोलॉजी — NCERT लाइन-बाय-लाइन",
      href: "/test/neet-bio-drill",
    },
    focusSubjects: ["Physics", "Chemistry", "Biology"],
    quickActions: [
      { href: "/exams/neet", icon: "TestTube", title: "NEET Mocks", sub: "Full-length NTA-pattern tests", accent: "text-emerald-400" },
      ...COMMON,
    ],
  },
  ctet: {
    slug: "ctet",
    name: "CTET",
    short: "Central Teacher Eligibility Test",
    tagline: "Pedagogy + content mastery for the next CTET window",
    taglineHi: "अगले CTET विंडो के लिए शिक्षा-शास्त्र + विषयवस्तु महारत",
    gradient: "from-indigo-600 via-violet-600 to-fuchsia-500",
    badge: "bg-violet-500/20 text-violet-300",
    heroIcon: "GraduationCap",
    vibe: "Pedagogy first",
    signatureFeature: {
      title: "Pedagogy Drill",
      titleHi: "शिक्षाशास्त्र अभ्यास",
      sub: "20-Q rapid pedagogy + CDP set, regenerated daily",
      subHi: "रोज़ नया 20 प्रश्न CDP + पेडागॉजी सेट",
      href: "/test/ctet-pedagogy-drill",
    },
    focusSubjects: ["Child Development", "Pedagogy", "EVS", "Mathematics", "Languages"],
    quickActions: [
      { href: "/exams/ctet", icon: "BookOpen", title: "CTET Mocks", sub: "Full-length CTET tests", accent: "text-violet-400" },
      ...COMMON,
    ],
  },
  ssc: {
    slug: "ssc",
    name: "SSC",
    short: "Staff Selection Commission",
    tagline: "Quant + reasoning velocity, English precision",
    taglineHi: "क्वांट + रीज़निंग रफ़्तार, इंग्लिश शुद्धता",
    gradient: "from-sky-600 via-blue-600 to-indigo-600",
    badge: "bg-sky-500/20 text-sky-300",
    heroIcon: "Calculator",
    vibe: "Speed maths",
    signatureFeature: {
      title: "Quant Sprint",
      titleHi: "क्वांट स्प्रिंट",
      sub: "10-minute timed quant burst — tracks accuracy curve",
      subHi: "10 मिनट का टाइम-बाउंड क्वांट बर्स्ट",
      href: "/test/ssc-quant-sprint",
    },
    focusSubjects: ["Quant", "Reasoning", "English", "GK"],
    quickActions: [
      { href: "/exams/ssc", icon: "Target", title: "SSC Mocks", sub: "CGL/CHSL/MTS calibrated mocks", accent: "text-sky-400" },
      ...COMMON,
    ],
  },
  railway: {
    slug: "railway",
    name: "Railway",
    short: "RRB Group D · NTPC · ALP",
    tagline: "GA marathon + technical brushup for RRB",
    taglineHi: "RRB के लिए जनरल अवेयरनेस + टेक्निकल",
    gradient: "from-orange-500 via-red-500 to-rose-600",
    badge: "bg-orange-500/20 text-orange-300",
    heroIcon: "Train",
    vibe: "GA marathon",
    signatureFeature: {
      title: "GA Marathon",
      titleHi: "GA मैराथन",
      sub: "Daily 30-Q general awareness streak with leaderboard",
      subHi: "रोज़ 30 प्रश्न GA — स्ट्रीक + लीडरबोर्ड",
      href: "/test/rrb-ga-marathon",
    },
    focusSubjects: ["Maths", "Reasoning", "General Science", "General Awareness"],
    quickActions: [
      { href: "/exams/railway", icon: "FileText", title: "RRB Mocks", sub: "Group D, NTPC and ALP", accent: "text-orange-400" },
      ...COMMON,
    ],
  },
  banking: {
    slug: "banking",
    name: "Banking",
    short: "IBPS · SBI · RBI Grade B",
    tagline: "Sectional cut-off survival kit",
    taglineHi: "सेक्शनल कट-ऑफ सर्वाइवल किट",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    badge: "bg-emerald-500/20 text-emerald-300",
    heroIcon: "Landmark",
    vibe: "Sectional timing",
    signatureFeature: {
      title: "Sectional Timing Mode",
      titleHi: "सेक्शनल टाइमिंग मोड",
      sub: "Mocks with strict per-section timers — IBPS Mains style",
      subHi: "हर सेक्शन का अलग टाइमर — IBPS मेन्स फॉर्मेट",
      href: "/test/banking-sectional-mock",
    },
    focusSubjects: ["Reasoning", "Quant", "English", "GA + Banking"],
    quickActions: [
      { href: "/exams/banking", icon: "Building2", title: "Bank PO Mocks", sub: "IBPS PO, Clerk, SBI tests", accent: "text-emerald-400" },
      ...COMMON,
    ],
  },
  cuet: {
    slug: "cuet",
    name: "CUET",
    short: "CUET-UG · PG",
    tagline: "Domain + language combo prep",
    taglineHi: "डोमेन + लैंग्वेज कॉम्बो तैयारी",
    gradient: "from-pink-500 via-rose-500 to-amber-500",
    badge: "bg-pink-500/20 text-pink-300",
    heroIcon: "BookOpen",
    vibe: "Domain combo",
    signatureFeature: {
      title: "Domain Combiner",
      titleHi: "डोमेन कॉम्बाइनर",
      sub: "Build a personalized 2-subject CUET mock in one tap",
      subHi: "एक टैप में अपने 2 डोमेन का मिलाजुला CUET मॉक",
      href: "/test/cuet-domain-combo",
    },
    focusSubjects: ["General Test", "English", "Domain (Choice)"],
    quickActions: [
      { href: "/exams/cuet", icon: "FileText", title: "CUET Mocks", sub: "Domain + GT calibrated tests", accent: "text-pink-400" },
      ...COMMON,
    ],
  },
  "class-10": {
    slug: "class-10",
    name: "Class 10",
    short: "CBSE / State Boards",
    tagline: "Board pattern questions, NCERT-aligned",
    taglineHi: "बोर्ड पैटर्न के प्रश्न, NCERT-aligned",
    gradient: "from-cyan-500 via-blue-500 to-indigo-500",
    badge: "bg-cyan-500/20 text-cyan-300",
    heroIcon: "School",
    vibe: "NCERT aligned",
    signatureFeature: {
      title: "Read & Ask AI · Library",
      titleHi: "किताब पढ़ें · AI से पूछें · लाइब्रेरी",
      sub: "Open any book, read inside the browser and ask the AI doubt panel anytime",
      subHi: "कोई भी किताब खोलें, अंदर ही पढ़ें और बगल के AI पैनल से सवाल पूछें",
      href: "/library",
    },
    focusSubjects: ["Maths", "Science", "Social Studies", "English", "Hindi"],
    quickActions: [
      { href: "/library", icon: "BookOpen", title: "Book Library", sub: "Read books + ask AI when stuck", accent: "text-cyan-400" },
      { href: "/exams/class-10", icon: "FileText", title: "Board Mocks", sub: "Chapter & full-syllabus tests", accent: "text-blue-400" },
      ...COMMON,
    ],
  },
  niit: {
    slug: "niit",
    name: "NIIT NAT",
    short: "National Aptitude Test",
    tagline: "Aptitude + coding logic combo",
    taglineHi: "एप्टीट्यूड + कोडिंग लॉजिक कॉम्बो",
    gradient: "from-lime-500 via-green-500 to-emerald-500",
    badge: "bg-lime-500/20 text-lime-300",
    heroIcon: "TestTube",
    vibe: "Aptitude + logic",
    signatureFeature: {
      title: "Logic Lab",
      titleHi: "लॉजिक लैब",
      sub: "Daily coding-logic puzzles with stepwise hints",
      subHi: "रोज़ कोडिंग-लॉजिक पज़ल्स + स्टेपवाइज़ हिंट्स",
      href: "/test/niit-logic-lab",
    },
    focusSubjects: ["Aptitude", "English", "Computer Awareness", "Logical Reasoning"],
    quickActions: [
      { href: "/exams/niit", icon: "FileText", title: "NAT Mocks", sub: "NIIT NAT calibrated tests", accent: "text-lime-400" },
      ...COMMON,
    ],
  },
  police: {
    slug: "police",
    name: "Police / SI",
    short: "State Police Constable & SI",
    tagline: "Physical-meets-mental prep",
    taglineHi: "शारीरिक + मानसिक दोनों की तैयारी",
    gradient: "from-zinc-700 via-slate-700 to-blue-900",
    badge: "bg-blue-500/20 text-blue-300",
    heroIcon: "Shield",
    vibe: "Drill mode",
    signatureFeature: {
      title: "Drill Mode",
      titleHi: "ड्रिल मोड",
      sub: "Rapid-fire 50-Q reasoning + GA drill, no negative marking",
      subHi: "तेज़ 50 प्रश्न रीज़निंग + GA, बिना नेगेटिव मार्किंग",
      href: "/test/police-drill",
    },
    focusSubjects: ["Reasoning", "GK", "Maths", "State-Specific GK"],
    quickActions: [
      { href: "/exams/police", icon: "ShieldCheck", title: "Police Mocks", sub: "Constable & SI calibrated", accent: "text-blue-400" },
      ...COMMON,
    ],
  },
  teacher: {
    slug: "teacher",
    name: "Teacher Exams",
    short: "TET · KVS · DSSSB · NVS",
    tagline: "Pedagogy + subject combo for TET tracks",
    taglineHi: "TET ट्रैक के लिए पेडागॉजी + विषय कॉम्बो",
    gradient: "from-purple-600 via-pink-600 to-rose-500",
    badge: "bg-purple-500/20 text-purple-300",
    heroIcon: "Users",
    vibe: "TET combo",
    signatureFeature: {
      title: "TET Combiner",
      titleHi: "TET कॉम्बाइनर",
      sub: "Build a Paper-1/2 mock tuned to your state TET",
      subHi: "अपने राज्य के TET पेपर-1/2 मॉक बनाएँ",
      href: "/test/tet-combo",
    },
    focusSubjects: ["CDP", "Pedagogy", "EVS", "Maths", "Languages", "Social Science"],
    quickActions: [
      { href: "/exams/teacher", icon: "GraduationCap", title: "TET Mocks", sub: "State-specific & central TET", accent: "text-purple-400" },
      ...COMMON,
    ],
  },
  state: {
    slug: "state",
    name: "State PSC",
    short: "BPSC · UPPSC · MPPSC · MPSC",
    tagline: "State current affairs + history depth",
    taglineHi: "स्टेट करेंट अफेयर्स + इतिहास गहराई",
    gradient: "from-amber-500 via-orange-600 to-red-600",
    badge: "bg-amber-500/20 text-amber-300",
    heroIcon: "Map",
    vibe: "State CA depth",
    signatureFeature: {
      title: "State Radar",
      titleHi: "स्टेट रडार",
      sub: "Live state-specific current affairs, indexed daily",
      subHi: "स्टेट करेंट अफेयर्स — रोज़ अपडेट",
      href: "/radar",
    },
    focusSubjects: ["Indian Polity", "History", "Geography", "Economy", "State GK", "Current Affairs"],
    quickActions: [
      { href: "/exams/state", icon: "Newspaper", title: "State PSC Mocks", sub: "State-wise calibrated tests", accent: "text-amber-400" },
      ...COMMON,
    ],
  },
};

export function getTrackConfig(slug: string | null | undefined): TrackConfig | null {
  if (!slug) return null;
  return (TRACK_CONFIGS as Record<string, TrackConfig>)[slug] ?? null;
}
