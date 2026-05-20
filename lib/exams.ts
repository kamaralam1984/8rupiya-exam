export type Exam = {
  slug: string;
  name: string;
  short: string;
  description: string;
  subjects: string[];
  duration: string;
  questions: number;
  highlight?: boolean;
};

export const EXAMS: Exam[] = [
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
  },
  {
    slug: "class-10",
    name: "Class 10",
    short: "CBSE / ICSE / State Boards",
    description:
      "Chapter-wise tests for Class 10 Science, Maths, Social Science, English and Hindi with smart revision sets and weakness analysis.",
    subjects: ["Science", "Maths", "Social Science", "English", "Hindi"],
    duration: "60 min",
    questions: 40,
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
  },
];

export function getExam(slug: string) {
  return EXAMS.find((e) => e.slug === slug);
}
