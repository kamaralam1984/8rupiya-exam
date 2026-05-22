/**
 * `icon` is a key understood by <ExamLogo /> — it maps to a Lucide icon.
 * `color` is a Tailwind gradient string (from/to classes) used for the badge background.
 * `logoUrl` (optional) lets admins ship a real PNG/SVG later via /public/exam-logos/;
 *   when present, ExamLogo renders the <img> instead of the icon.
 */
export type ExamIconKey =
  | "graduation"
  | "briefcase"
  | "train"
  | "bank"
  | "university"
  | "school"
  | "code"
  | "shield"
  | "pencil"
  | "landmark"
  | "stethoscope"
  | "book";

export type SubjectGroup = { label: string; subjects: string[] };

export type Exam = {
  slug: string;
  name: string;
  short: string;
  description: string;
  subjects: string[];
  subjectGroups?: SubjectGroup[];
  duration: string;
  questions: number;
  highlight?: boolean;
  icon: ExamIconKey;
  color: string; // e.g. "from-purple-500 to-fuchsia-500"
  logoUrl?: string; // e.g. "/exam-logos/ctet.png"
};

export const EXAMS: Exam[] = [
  {
    slug: "neet",
    name: "NEET",
    short: "National Eligibility cum Entrance Test (UG)",
    description:
      "NEET UG prep with Physics, Chemistry and Biology mocks calibrated to NTA pattern — chapter-wise drills, full-length tests and AI-curated prediction sets.",
    subjects: ["Physics", "Chemistry", "Biology"],
    duration: "200 min",
    questions: 180,
    highlight: true,
    icon: "stethoscope",
    color: "from-emerald-500 to-lime-500",
    logoUrl: "/exam-logos/neet.png",
  },
  {
    slug: "ctet",
    name: "CTET",
    short: "Central Teacher Eligibility Test",
    description:
      "CTET prep with AI-generated mocks covering Child Development & Pedagogy, EVS, Maths, Hindi and English. Topic-wise drills plus full-length tests calibrated to recent exam patterns.",
    subjects: ["Child Development", "Pedagogy", "EVS", "Mathematics", "Languages"],
    duration: "150 min",
    questions: 150,
    highlight: true,
    icon: "graduation",
    color: "from-purple-500 to-fuchsia-500",
    logoUrl: "/exam-logos/ctet.png",
  },
  {
    slug: "ssc",
    name: "SSC",
    short: "Staff Selection Commission",
    description:
      "SSC CGL, CHSL and MTS prep with quantitative aptitude, reasoning, English and general awareness. AI prediction tests trained on a decade of trends.",
    subjects: ["Quant", "Reasoning", "English", "GK"],
    duration: "60 min",
    questions: 100,
    highlight: true,
    icon: "briefcase",
    color: "from-blue-500 to-cyan-500",
    logoUrl: "/exam-logos/ssc.png",
  },
  {
    slug: "railway",
    name: "Railway",
    short: "RRB NTPC / Group D / ALP",
    description:
      "Railway exam preparation across Maths, Reasoning, General Science and Current Affairs with sectional timers and adaptive difficulty.",
    subjects: ["Maths", "Reasoning", "Science", "Current Affairs"],
    duration: "90 min",
    questions: 100,
    icon: "train",
    color: "from-amber-500 to-orange-500",
    logoUrl: "/exam-logos/railway.png",
  },
  {
    slug: "banking",
    name: "Banking",
    short: "IBPS / SBI / RBI",
    description:
      "Bank PO and Clerk prep — Quant, Reasoning, English, Banking Awareness and Computer — with section-wise analytics and speed-accuracy graphs.",
    subjects: ["Quant", "Reasoning", "English", "Banking Awareness"],
    duration: "60 min",
    questions: 100,
    icon: "bank",
    color: "from-emerald-500 to-teal-500",
    logoUrl: "/exam-logos/banking.png",
  },
  {
    slug: "cuet",
    name: "CUET",
    short: "Common University Entrance Test",
    description:
      "CUET UG prep with domain subjects, general test and language papers. AI-curated question sets matching the NTA pattern.",
    subjects: ["General Test", "Domain Subjects", "Languages"],
    duration: "120 min",
    questions: 60,
    icon: "university",
    color: "from-indigo-500 to-violet-500",
    logoUrl: "/exam-logos/cuet.png",
  },
  {
    slug: "class-10",
    name: "Class 10",
    short: "CBSE / ICSE / State Boards",
    description:
      "Chapter-wise tests for Class 10 Science, Maths, Social Science, English and Hindi with smart revision sets and weakness analysis.",
    subjects: ["Physics", "Chemistry", "Biology", "Maths", "History", "Geography", "Civics", "Economics", "English", "Hindi"],
    subjectGroups: [
      { label: "Science", subjects: ["Physics", "Chemistry", "Biology"] },
      { label: "Social Science", subjects: ["History", "Geography", "Civics", "Economics"] },
      { label: "Maths", subjects: ["Maths"] },
      { label: "English", subjects: ["English"] },
      { label: "Hindi", subjects: ["Hindi"] },
    ],
    duration: "60 min",
    questions: 40,
    icon: "school",
    color: "from-sky-500 to-blue-500",
    logoUrl: "/exam-logos/class-10.png",
  },
  {
    slug: "niit",
    name: "NIIT",
    short: "NIIT National Aptitude Test",
    description:
      "NIIT NAT and tech-aptitude practice tests covering logical reasoning, English and basic programming concepts.",
    subjects: ["Logical Reasoning", "English", "Computer Basics"],
    duration: "60 min",
    questions: 60,
    icon: "code",
    color: "from-slate-500 to-zinc-500",
    logoUrl: "/exam-logos/niit.png",
  },
  {
    slug: "police",
    name: "Police Exams",
    short: "State Police Constable / SI",
    description:
      "Police constable and SI prep across state syllabi — Reasoning, GK, Maths and language with state-specific question pools.",
    subjects: ["Reasoning", "GK", "Maths", "Hindi/English"],
    duration: "90 min",
    questions: 100,
    icon: "shield",
    color: "from-red-500 to-rose-500",
    logoUrl: "/exam-logos/police.png",
  },
  {
    slug: "teacher",
    name: "Teacher Exams",
    short: "TET / STET / Super-TET",
    description:
      "State Teacher Eligibility prep — child psychology, pedagogy, subject mastery and language proficiency with AI weakness coaching.",
    subjects: ["Pedagogy", "Child Psychology", "Subjects", "Languages"],
    duration: "150 min",
    questions: 150,
    icon: "pencil",
    color: "from-pink-500 to-rose-500",
    logoUrl: "/exam-logos/teacher.png",
  },
  {
    slug: "state",
    name: "State Exams",
    short: "UPPSC / BPSC / MPPSC and more",
    description:
      "State PSC and competitive prep with state GK, history, geography, polity and current affairs tailored region-wise.",
    subjects: ["State GK", "History", "Geography", "Polity", "Current Affairs"],
    duration: "120 min",
    questions: 150,
    icon: "landmark",
    color: "from-yellow-500 to-amber-500",
    logoUrl: "/exam-logos/state.png",
  },
];

export function getExam(slug: string) {
  return EXAMS.find((e) => e.slug === slug);
}
