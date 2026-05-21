import type { Difficulty } from "@prisma/client";

export type SampleQ = {
  stem: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: Difficulty;
};

/**
 * Exam-specific, subject-specific question bank for seeding.
 * Structure: examSlug → subjectSlug → questions[]
 *
 * Subject slug is generated from the subject name in `lib/exams.ts` via
 *   name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
 * Keep slugs in sync if subject names change.
 */
export const QUESTION_BANK: Record<string, Record<string, SampleQ[]>> = {
  /* ────────────────────────────── NEET ────────────────────────────── */
  neet: {
    physics: [
      {
        stem: "A body moves with uniform acceleration. Which of the following remains constant?",
        options: ["Velocity", "Acceleration", "Displacement", "Speed"],
        correctIndex: 1,
        explanation: "Uniform acceleration means acceleration value is constant; velocity changes uniformly with time.",
        difficulty: "EASY",
      },
      {
        stem: "The SI unit of electric current is:",
        options: ["Volt", "Watt", "Ampere", "Ohm"],
        correctIndex: 2,
        explanation: "Ampere (A) is the SI base unit for electric current.",
        difficulty: "EASY",
      },
      {
        stem: "A convex lens of focal length 20 cm forms an image at 60 cm. Object distance is:",
        options: ["15 cm", "20 cm", "30 cm", "40 cm"],
        correctIndex: 2,
        explanation: "1/v - 1/u = 1/f → 1/60 - 1/u = 1/20 → 1/u = -2/60 → u = -30 cm.",
        difficulty: "MEDIUM",
      },
      {
        stem: "Which law states that pressure × volume is constant for a gas at constant temperature?",
        options: ["Charles's Law", "Boyle's Law", "Avogadro's Law", "Dalton's Law"],
        correctIndex: 1,
        explanation: "Boyle's Law: PV = constant at constant T for a fixed amount of gas.",
        difficulty: "EASY",
      },
      {
        stem: "The de Broglie wavelength is associated with:",
        options: ["Only photons", "Only electrons", "All moving matter", "Only fast-moving particles"],
        correctIndex: 2,
        explanation: "Every moving particle has a wavelength λ = h/p where p is momentum.",
        difficulty: "MEDIUM",
      },
    ],
    chemistry: [
      {
        stem: "The pH of pure water at 25 °C is:",
        options: ["0", "7", "10", "14"],
        correctIndex: 1,
        explanation: "Pure water is neutral with pH = 7 at 25 °C.",
        difficulty: "EASY",
      },
      {
        stem: "Which element has the highest electronegativity?",
        options: ["Oxygen", "Fluorine", "Chlorine", "Nitrogen"],
        correctIndex: 1,
        explanation: "Fluorine has the highest electronegativity (~3.98 on Pauling scale).",
        difficulty: "EASY",
      },
      {
        stem: "Number of σ bonds in ethene (C₂H₄):",
        options: ["3", "4", "5", "6"],
        correctIndex: 2,
        explanation: "Ethene has 1 C–C σ + 4 C–H σ = 5 σ bonds (plus 1 π bond).",
        difficulty: "MEDIUM",
      },
      {
        stem: "Which gas is liberated when an active metal reacts with a dilute acid?",
        options: ["Oxygen", "Hydrogen", "Chlorine", "Carbon dioxide"],
        correctIndex: 1,
        explanation: "Metal + dilute acid → salt + H₂↑.",
        difficulty: "EASY",
      },
      {
        stem: "Avogadro's number is approximately:",
        options: ["6.022 × 10²³", "9.81 × 10⁹", "1.6 × 10⁻¹⁹", "3.0 × 10⁸"],
        correctIndex: 0,
        explanation: "Nₐ = 6.022 × 10²³ entities per mole.",
        difficulty: "EASY",
      },
    ],
    biology: [
      {
        stem: "The powerhouse of the cell is:",
        options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"],
        correctIndex: 2,
        explanation: "Mitochondria generate ATP via oxidative phosphorylation.",
        difficulty: "EASY",
      },
      {
        stem: "Photosynthesis primarily occurs in:",
        options: ["Mitochondria", "Nucleus", "Chloroplast", "Ribosome"],
        correctIndex: 2,
        explanation: "Chloroplasts contain chlorophyll which captures light energy.",
        difficulty: "EASY",
      },
      {
        stem: "The human heart has how many chambers?",
        options: ["2", "3", "4", "5"],
        correctIndex: 2,
        explanation: "Two atria + two ventricles = 4 chambers.",
        difficulty: "EASY",
      },
      {
        stem: "Which blood group is the universal donor?",
        options: ["A+", "AB+", "O-", "B-"],
        correctIndex: 2,
        explanation: "O negative lacks A, B and Rh antigens — can donate to any group.",
        difficulty: "EASY",
      },
      {
        stem: "DNA replication is:",
        options: ["Conservative", "Semi-conservative", "Dispersive", "Random"],
        correctIndex: 1,
        explanation: "Meselson–Stahl experiment proved DNA replication is semi-conservative.",
        difficulty: "MEDIUM",
      },
    ],
  },

  /* ────────────────────────────── CTET ────────────────────────────── */
  ctet: {
    "child-development": [
      {
        stem: "Piaget's pre-operational stage occurs at the age of:",
        options: ["0–2 years", "2–7 years", "7–11 years", "11+ years"],
        correctIndex: 1,
        explanation: "Pre-operational stage: roughly 2–7 years, characterised by symbolic play.",
        difficulty: "EASY",
      },
      {
        stem: "Howard Gardner is associated with the theory of:",
        options: ["Operant Conditioning", "Multiple Intelligences", "Zone of Proximal Development", "Moral Development"],
        correctIndex: 1,
        explanation: "Gardner proposed multiple intelligences (linguistic, logical, kinesthetic, etc.).",
        difficulty: "MEDIUM",
      },
      {
        stem: "Inclusive education emphasises:",
        options: ["Separate schools for differently-abled", "All learners in the same classroom regardless of ability", "Only academic excellence", "Streaming by IQ"],
        correctIndex: 1,
        explanation: "Inclusion means equitable participation of every child in the same classroom.",
        difficulty: "EASY",
      },
      {
        stem: "Vygotsky's Zone of Proximal Development emphasises:",
        options: ["What a child can do alone", "What a child can do with guidance", "Innate ability", "Genetic potential"],
        correctIndex: 1,
        explanation: "ZPD = gap between independent and assisted performance; scaffolding helps cross it.",
        difficulty: "MEDIUM",
      },
      {
        stem: "Continuous and Comprehensive Evaluation (CCE) focuses on:",
        options: ["Year-end exams only", "Holistic assessment throughout the year", "Only co-curricular activities", "Ranking students"],
        correctIndex: 1,
        explanation: "CCE assesses scholastic + co-scholastic growth continuously through the year.",
        difficulty: "EASY",
      },
    ],
    pedagogy: [
      {
        stem: "Constructivist pedagogy means learners:",
        options: ["Passively receive knowledge", "Actively construct meaning", "Only memorise", "Are graded on tests alone"],
        correctIndex: 1,
        explanation: "Constructivism (Piaget, Vygotsky) treats learners as active builders of knowledge.",
        difficulty: "EASY",
      },
      {
        stem: "Which is an example of formative assessment?",
        options: ["Final board exam", "Quick classroom quiz used for feedback", "University entrance test", "Year-end ranking"],
        correctIndex: 1,
        explanation: "Formative assessment is for learning — short, ongoing checks that inform teaching.",
        difficulty: "EASY",
      },
      {
        stem: "An effective teacher should primarily be:",
        options: ["A strict authority", "A facilitator of learning", "A perfectionist", "A grader"],
        correctIndex: 1,
        explanation: "Modern pedagogy frames the teacher as a facilitator who guides discovery.",
        difficulty: "EASY",
      },
    ],
    evs: [
      {
        stem: "Which is a renewable source of energy?",
        options: ["Coal", "Petroleum", "Solar", "Natural gas"],
        correctIndex: 2,
        explanation: "Solar, wind, and hydro are renewable; fossil fuels are not.",
        difficulty: "EASY",
      },
      {
        stem: "World Environment Day is observed on:",
        options: ["5 May", "5 June", "22 April", "16 September"],
        correctIndex: 1,
        explanation: "World Environment Day — 5 June (UN designation since 1972).",
        difficulty: "EASY",
      },
      {
        stem: "Which gas is mainly responsible for global warming?",
        options: ["O₂", "N₂", "CO₂", "Ar"],
        correctIndex: 2,
        explanation: "CO₂ is the main long-lived greenhouse gas driving climate change.",
        difficulty: "EASY",
      },
    ],
    mathematics: [
      {
        stem: "Solve: (3/4) ÷ (1/2) = ?",
        options: ["3/8", "3/2", "2/3", "4/3"],
        correctIndex: 1,
        explanation: "Divide by a fraction = multiply by its reciprocal: 3/4 × 2 = 3/2.",
        difficulty: "EASY",
      },
      {
        stem: "If 25% of a number is 50, the number is:",
        options: ["100", "150", "200", "250"],
        correctIndex: 2,
        explanation: "Number × 0.25 = 50 → Number = 200.",
        difficulty: "EASY",
      },
    ],
    languages: [
      {
        stem: "Choose the correctly spelled word.",
        options: ["Recieve", "Receive", "Receeve", "Recive"],
        correctIndex: 1,
        explanation: "'i before e except after c' — RECEIVE.",
        difficulty: "EASY",
      },
      {
        stem: "Which is a noun in the sentence: 'The teacher writes on the board.'",
        options: ["Writes", "On", "Teacher", "The"],
        correctIndex: 2,
        explanation: "'Teacher' (and 'board') are nouns — words naming a person/thing.",
        difficulty: "EASY",
      },
    ],
  },

  /* ────────────────────────────── SSC ─────────────────────────────── */
  ssc: {
    quant: [
      {
        stem: "If CP = ₹400 and profit is 25%, SP = ?",
        options: ["₹450", "₹475", "₹500", "₹525"],
        correctIndex: 2,
        explanation: "SP = 400 × 1.25 = ₹500.",
        difficulty: "EASY",
      },
      {
        stem: "A train 120 m long moving at 54 km/h crosses a pole in:",
        options: ["6 s", "8 s", "10 s", "12 s"],
        correctIndex: 1,
        explanation: "54 km/h = 15 m/s; 120/15 = 8 s.",
        difficulty: "EASY",
      },
      {
        stem: "Average of first 5 odd natural numbers:",
        options: ["3", "4", "5", "6"],
        correctIndex: 2,
        explanation: "(1+3+5+7+9)/5 = 25/5 = 5.",
        difficulty: "EASY",
      },
      {
        stem: "Simple interest on ₹1000 at 10% p.a. for 2 years:",
        options: ["₹100", "₹200", "₹220", "₹250"],
        correctIndex: 1,
        explanation: "SI = PRT/100 = 1000×10×2/100 = ₹200.",
        difficulty: "EASY",
      },
    ],
    reasoning: [
      {
        stem: "Next term: 2, 6, 12, 20, 30, ?",
        options: ["36", "40", "42", "48"],
        correctIndex: 2,
        explanation: "Differences are 4, 6, 8, 10, 12 → 30 + 12 = 42.",
        difficulty: "EASY",
      },
      {
        stem: "A is the brother of B. B is the sister of C. C is the father of D. D is A's:",
        options: ["Nephew or niece", "Son", "Cousin", "Brother"],
        correctIndex: 0,
        explanation: "A is sibling of C; D is C's child; so D is A's niece/nephew.",
        difficulty: "MEDIUM",
      },
      {
        stem: "If FRIEND is coded as HTKGPF, then CANDLE will be:",
        options: ["DCQFNG", "ECPFNG", "EDRJOH", "DDPFNG"],
        correctIndex: 1,
        explanation: "Each letter +2: C→E, A→C, N→P, D→F, L→N, E→G = ECPFNG.",
        difficulty: "MEDIUM",
      },
    ],
    english: [
      {
        stem: "Synonym of 'meticulous':",
        options: ["Careless", "Painstaking", "Hasty", "Random"],
        correctIndex: 1,
        explanation: "'Meticulous' = great attention to detail = painstaking.",
        difficulty: "MEDIUM",
      },
      {
        stem: "Antonym of 'benevolent':",
        options: ["Generous", "Cruel", "Cautious", "Brave"],
        correctIndex: 1,
        explanation: "Benevolent = kind; opposite = cruel/malevolent.",
        difficulty: "MEDIUM",
      },
      {
        stem: "Choose the correctly spelled word.",
        options: ["Occured", "Occurred", "Ocurred", "Occurred"],
        correctIndex: 1,
        explanation: "OCCURRED — two C's, two R's.",
        difficulty: "EASY",
      },
    ],
    gk: [
      {
        stem: "Which Article guarantees Right to Equality?",
        options: ["Article 14", "Article 19", "Article 21", "Article 32"],
        correctIndex: 0,
        explanation: "Article 14 — equality before law for all within India.",
        difficulty: "EASY",
      },
      {
        stem: "Currency of Japan:",
        options: ["Yuan", "Won", "Yen", "Ringgit"],
        correctIndex: 2,
        explanation: "Japan's currency is the Yen (¥).",
        difficulty: "EASY",
      },
      {
        stem: "Indian state with the longest coastline:",
        options: ["Tamil Nadu", "Maharashtra", "Andhra Pradesh", "Gujarat"],
        correctIndex: 3,
        explanation: "Gujarat has the longest coastline (~1,600 km) in India.",
        difficulty: "MEDIUM",
      },
    ],
  },

  /* ──────────────────────────── Railway ───────────────────────────── */
  railway: {
    maths: [
      {
        stem: "A train of 200 m crosses a 100 m platform in 30 s. Train's speed:",
        options: ["10 m/s", "12 m/s", "8 m/s", "15 m/s"],
        correctIndex: 0,
        explanation: "Total distance 300 m / 30 s = 10 m/s.",
        difficulty: "MEDIUM",
      },
      {
        stem: "LCM of 12 and 18:",
        options: ["24", "36", "48", "72"],
        correctIndex: 1,
        explanation: "LCM(12,18) = 36.",
        difficulty: "EASY",
      },
      {
        stem: "If 2x + 3 = 11, then x =",
        options: ["3", "4", "5", "6"],
        correctIndex: 1,
        explanation: "2x = 8 → x = 4.",
        difficulty: "EASY",
      },
    ],
    reasoning: [
      {
        stem: "Find the odd one out: Apple, Mango, Carrot, Banana",
        options: ["Apple", "Mango", "Carrot", "Banana"],
        correctIndex: 2,
        explanation: "Carrot is a vegetable; rest are fruits.",
        difficulty: "EASY",
      },
      {
        stem: "Next in series: 5, 10, 20, 40, ?",
        options: ["60", "70", "80", "100"],
        correctIndex: 2,
        explanation: "Each term doubles: 40 × 2 = 80.",
        difficulty: "EASY",
      },
    ],
    "general-science": [
      {
        stem: "Chemical symbol of Sodium:",
        options: ["So", "Sd", "Na", "S"],
        correctIndex: 2,
        explanation: "Sodium = Na (from Latin natrium).",
        difficulty: "EASY",
      },
      {
        stem: "Speed of light in vacuum (approx):",
        options: ["3 × 10⁵ m/s", "3 × 10⁸ m/s", "3 × 10⁶ m/s", "3 × 10¹⁰ m/s"],
        correctIndex: 1,
        explanation: "c ≈ 3 × 10⁸ m/s.",
        difficulty: "EASY",
      },
      {
        stem: "Vitamin deficiency causing night blindness:",
        options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"],
        correctIndex: 0,
        explanation: "Vitamin A deficiency causes night blindness.",
        difficulty: "EASY",
      },
    ],
    "general-awareness": [
      {
        stem: "Indian Railways HQ is in:",
        options: ["New Delhi", "Mumbai", "Kolkata", "Chennai"],
        correctIndex: 0,
        explanation: "Indian Railways HQ — Rail Bhavan, New Delhi.",
        difficulty: "EASY",
      },
      {
        stem: "Father of the Indian Constitution:",
        options: ["Mahatma Gandhi", "Dr. B.R. Ambedkar", "Jawaharlal Nehru", "Sardar Patel"],
        correctIndex: 1,
        explanation: "Dr. B.R. Ambedkar chaired the drafting committee.",
        difficulty: "EASY",
      },
    ],
  },

  /* ──────────────────────────── Banking ───────────────────────────── */
  banking: {
    reasoning: [
      {
        stem: "If MOTHER is coded as OQVJGT, FATHER is:",
        options: ["HCVJGT", "GBUIFS", "HBVJGT", "HCVIFT"],
        correctIndex: 0,
        explanation: "Each letter +2: F→H, A→C, T→V, H→J, E→G, R→T → HCVJGT.",
        difficulty: "MEDIUM",
      },
      {
        stem: "Direction: A walks 5 m north, turns right 5 m, then right 5 m. Final direction faced:",
        options: ["North", "South", "East", "West"],
        correctIndex: 1,
        explanation: "North → East → South.",
        difficulty: "MEDIUM",
      },
    ],
    quant: [
      {
        stem: "Compound interest on ₹10,000 at 10% p.a. for 2 years:",
        options: ["₹2,000", "₹2,100", "₹2,200", "₹2,300"],
        correctIndex: 1,
        explanation: "Amount = 10000(1.1)² = 12100; CI = ₹2,100.",
        difficulty: "MEDIUM",
      },
      {
        stem: "Ratio 3:5 = ?:25",
        options: ["10", "12", "15", "18"],
        correctIndex: 2,
        explanation: "3:5 = 15:25.",
        difficulty: "EASY",
      },
    ],
    english: [
      {
        stem: "Synonym of 'frugal':",
        options: ["Wasteful", "Economical", "Lazy", "Generous"],
        correctIndex: 1,
        explanation: "Frugal = economical/thrifty.",
        difficulty: "MEDIUM",
      },
      {
        stem: "Choose the correct sentence:",
        options: ["He don't like coffee.", "He doesn't likes coffee.", "He doesn't like coffee.", "He not like coffee."],
        correctIndex: 2,
        explanation: "Third person singular present negative: doesn't + base verb.",
        difficulty: "EASY",
      },
    ],
    "ga-banking": [
      {
        stem: "Headquarters of RBI:",
        options: ["New Delhi", "Mumbai", "Kolkata", "Chennai"],
        correctIndex: 1,
        explanation: "RBI HQ — Mumbai (since 1937).",
        difficulty: "EASY",
      },
      {
        stem: "Full form of NEFT:",
        options: ["National Electronic Funds Transfer", "Net Electronic Financial Transfer", "Nationwide Easy Funds Transfer", "National Express Fund Transfer"],
        correctIndex: 0,
        explanation: "NEFT = National Electronic Funds Transfer.",
        difficulty: "EASY",
      },
      {
        stem: "Current Repo rate is decided by:",
        options: ["Finance Ministry", "SEBI", "RBI Monetary Policy Committee", "PMO"],
        correctIndex: 2,
        explanation: "RBI's Monetary Policy Committee (MPC) decides the repo rate.",
        difficulty: "MEDIUM",
      },
    ],
  },

  /* ───────────────────────────── CUET ─────────────────────────────── */
  cuet: {
    "general-test": [
      {
        stem: "If 1 March is Tuesday, what day is 15 March?",
        options: ["Monday", "Tuesday", "Wednesday", "Thursday"],
        correctIndex: 1,
        explanation: "14 days later = exact 2 weeks → same day = Tuesday.",
        difficulty: "EASY",
      },
      {
        stem: "Capital of Australia:",
        options: ["Sydney", "Melbourne", "Canberra", "Perth"],
        correctIndex: 2,
        explanation: "Canberra is the capital, not the largest city.",
        difficulty: "EASY",
      },
    ],
    english: [
      {
        stem: "Choose the correct article: '___ honest person is trusted.'",
        options: ["A", "An", "The", "No article"],
        correctIndex: 1,
        explanation: "'Honest' starts with vowel sound → 'An'.",
        difficulty: "EASY",
      },
      {
        stem: "Synonym of 'lucid':",
        options: ["Confusing", "Clear", "Dim", "Hidden"],
        correctIndex: 1,
        explanation: "Lucid = clear and easy to understand.",
        difficulty: "MEDIUM",
      },
    ],
    "domain-choice": [
      {
        stem: "Which of the following is a primary economic activity?",
        options: ["Manufacturing", "Banking", "Farming", "Software development"],
        correctIndex: 2,
        explanation: "Primary activities = direct use of natural resources (farming, fishing, mining).",
        difficulty: "EASY",
      },
      {
        stem: "Mendel's experiments were performed on:",
        options: ["Roses", "Pea plants", "Maize", "Sunflowers"],
        correctIndex: 1,
        explanation: "Mendel used pea (Pisum sativum) for his inheritance experiments.",
        difficulty: "EASY",
      },
    ],
  },

  /* ─────────────────────────── Class 10 ───────────────────────────── */
  "class-10": {
    maths: [
      {
        stem: "Roots of x² – 5x + 6 = 0:",
        options: ["2 and 3", "1 and 6", "–2 and –3", "3 and –2"],
        correctIndex: 0,
        explanation: "(x–2)(x–3) = 0 → x = 2 or 3.",
        difficulty: "EASY",
      },
      {
        stem: "Area of a circle with radius 7 cm (π = 22/7):",
        options: ["44 cm²", "154 cm²", "44 cm", "154 cm"],
        correctIndex: 1,
        explanation: "πr² = 22/7 × 49 = 154 cm².",
        difficulty: "EASY",
      },
      {
        stem: "If sin θ = 3/5, then cos θ =",
        options: ["3/5", "4/5", "5/4", "5/3"],
        correctIndex: 1,
        explanation: "sin² + cos² = 1 → cos θ = √(1 - 9/25) = 4/5.",
        difficulty: "MEDIUM",
      },
    ],
    science: [
      {
        stem: "Photosynthesis occurs in:",
        options: ["Mitochondria", "Nucleus", "Chloroplast", "Ribosome"],
        correctIndex: 2,
        explanation: "Chloroplasts contain chlorophyll for photosynthesis.",
        difficulty: "EASY",
      },
      {
        stem: "Newton's first law is also known as the law of:",
        options: ["Action–reaction", "Inertia", "Acceleration", "Conservation"],
        correctIndex: 1,
        explanation: "First law = Law of Inertia.",
        difficulty: "EASY",
      },
      {
        stem: "Chemical formula of Sodium chloride:",
        options: ["NaCl", "Na₂Cl", "NaCl₂", "Na₂Cl₂"],
        correctIndex: 0,
        explanation: "Sodium chloride — table salt — is NaCl.",
        difficulty: "EASY",
      },
    ],
    "social-studies": [
      {
        stem: "The Quit India Movement was launched in:",
        options: ["1920", "1930", "1942", "1947"],
        correctIndex: 2,
        explanation: "Gandhi's Quit India Movement — 8 August 1942.",
        difficulty: "EASY",
      },
      {
        stem: "Headquarters of the United Nations:",
        options: ["Paris", "New York", "Geneva", "Vienna"],
        correctIndex: 1,
        explanation: "UN HQ — New York City, USA.",
        difficulty: "EASY",
      },
    ],
    english: [
      {
        stem: "Identify the figure of speech: 'The wind whispered through the trees.'",
        options: ["Simile", "Metaphor", "Personification", "Alliteration"],
        correctIndex: 2,
        explanation: "Giving a human trait (whispered) to non-human (wind) = personification.",
        difficulty: "EASY",
      },
      {
        stem: "Antonym of 'ancient':",
        options: ["Old", "Modern", "Past", "Aged"],
        correctIndex: 1,
        explanation: "Ancient ↔ Modern.",
        difficulty: "EASY",
      },
    ],
    hindi: [
      {
        stem: "‘किताब’ शब्द का बहुवचन है:",
        options: ["किताबी", "किताबें", "किताबों", "किताबकर"],
        correctIndex: 1,
        explanation: "‘किताब’ → ‘किताबें’ (बहुवचन).",
        difficulty: "EASY",
      },
      {
        stem: "‘सूर्य’ का पर्यायवाची है:",
        options: ["चंद्र", "रवि", "तारा", "पवन"],
        correctIndex: 1,
        explanation: "सूर्य के पर्यायवाची — रवि, भास्कर, दिनकर.",
        difficulty: "EASY",
      },
    ],
  },

  /* ───────────────────────────── NIIT ─────────────────────────────── */
  niit: {
    aptitude: [
      {
        stem: "If 3 workers complete a task in 8 days, 6 workers complete it in:",
        options: ["2 days", "4 days", "6 days", "16 days"],
        correctIndex: 1,
        explanation: "Work-rate inverse: 3×8 = 6×x → x = 4 days.",
        difficulty: "EASY",
      },
      {
        stem: "Average of 10, 20, 30, 40, 50:",
        options: ["25", "30", "35", "40"],
        correctIndex: 1,
        explanation: "Sum = 150 / 5 = 30.",
        difficulty: "EASY",
      },
    ],
    english: [
      {
        stem: "Choose the correct preposition: 'She is good ___ mathematics.'",
        options: ["in", "at", "on", "with"],
        correctIndex: 1,
        explanation: "'Good at <skill>' is the idiomatic preposition.",
        difficulty: "EASY",
      },
      {
        stem: "Antonym of 'expand':",
        options: ["Grow", "Shrink", "Increase", "Stretch"],
        correctIndex: 1,
        explanation: "Expand ↔ Shrink/Contract.",
        difficulty: "EASY",
      },
    ],
    "computer-awareness": [
      {
        stem: "RAM stands for:",
        options: ["Read Access Memory", "Random Access Memory", "Rapid Auxiliary Memory", "Read Allocated Memory"],
        correctIndex: 1,
        explanation: "RAM = Random Access Memory (volatile main memory).",
        difficulty: "EASY",
      },
      {
        stem: "Which is NOT an operating system?",
        options: ["Linux", "Windows", "Oracle", "macOS"],
        correctIndex: 2,
        explanation: "Oracle is a database, not an OS.",
        difficulty: "EASY",
      },
      {
        stem: "Output of 5 % 3 in most languages:",
        options: ["1", "2", "3", "5"],
        correctIndex: 1,
        explanation: "5 mod 3 = 2 (remainder).",
        difficulty: "EASY",
      },
    ],
    "logical-reasoning": [
      {
        stem: "If all roses are flowers and some flowers fade quickly, which is true?",
        options: ["All roses fade quickly", "Some roses may fade quickly", "No rose fades quickly", "All flowers are roses"],
        correctIndex: 1,
        explanation: "From premises, only 'some roses may' can be inferred.",
        difficulty: "MEDIUM",
      },
      {
        stem: "Next in series: 1, 4, 9, 16, ?",
        options: ["20", "23", "25", "27"],
        correctIndex: 2,
        explanation: "Squares: 1²,2²,3²,4²,5² = 25.",
        difficulty: "EASY",
      },
    ],
  },

  /* ─────────────────────────── Police / SI ─────────────────────────── */
  police: {
    reasoning: [
      {
        stem: "If TIGER is coded as VKIGT, then LION is:",
        options: ["MJPQ", "NKQP", "NKPQ", "MJOP"],
        correctIndex: 2,
        explanation: "Each letter +2: L→N, I→K, O→Q, N→P → NKQP.",
        difficulty: "MEDIUM",
      },
      {
        stem: "Find odd one: Knife, Sword, Gun, Pen",
        options: ["Knife", "Sword", "Gun", "Pen"],
        correctIndex: 3,
        explanation: "Pen is for writing; others are weapons.",
        difficulty: "EASY",
      },
    ],
    gk: [
      {
        stem: "First woman IPS officer of India:",
        options: ["Kiran Bedi", "Indira Gandhi", "Sarojini Naidu", "Sucheta Kriplani"],
        correctIndex: 0,
        explanation: "Kiran Bedi — first woman IPS officer (1972 batch).",
        difficulty: "EASY",
      },
      {
        stem: "National Emergency in India is declared under Article:",
        options: ["352", "356", "360", "370"],
        correctIndex: 0,
        explanation: "Article 352 — National Emergency.",
        difficulty: "MEDIUM",
      },
    ],
    maths: [
      {
        stem: "If 60% of a number is 120, the number is:",
        options: ["180", "200", "220", "240"],
        correctIndex: 1,
        explanation: "Number × 0.6 = 120 → Number = 200.",
        difficulty: "EASY",
      },
      {
        stem: "Speed = 90 km/h. Distance in 30 min:",
        options: ["30 km", "45 km", "60 km", "90 km"],
        correctIndex: 1,
        explanation: "90 × 0.5 = 45 km.",
        difficulty: "EASY",
      },
    ],
    "state-specific-gk": [
      {
        stem: "Which is the capital of Uttar Pradesh?",
        options: ["Allahabad", "Kanpur", "Lucknow", "Varanasi"],
        correctIndex: 2,
        explanation: "Lucknow is the capital of UP.",
        difficulty: "EASY",
      },
      {
        stem: "Famous folk dance of Punjab:",
        options: ["Bharatanatyam", "Bhangra", "Garba", "Kuchipudi"],
        correctIndex: 1,
        explanation: "Bhangra — Punjab's signature folk dance.",
        difficulty: "EASY",
      },
    ],
  },

  /* ─────────────────────────── Teacher Exams ──────────────────────── */
  teacher: {
    cdp: [
      {
        stem: "Maslow's hierarchy places ___ at the top:",
        options: ["Safety needs", "Belonging", "Self-actualization", "Esteem"],
        correctIndex: 2,
        explanation: "Self-actualization is the apex of Maslow's hierarchy.",
        difficulty: "MEDIUM",
      },
      {
        stem: "Stage at which abstract reasoning develops (Piaget):",
        options: ["Sensorimotor", "Pre-operational", "Concrete operational", "Formal operational"],
        correctIndex: 3,
        explanation: "Formal operational stage (~11+ years) — abstract & hypothetical reasoning.",
        difficulty: "MEDIUM",
      },
    ],
    pedagogy: [
      {
        stem: "Active learning emphasises:",
        options: ["Lecture-only", "Learner involvement and reflection", "Memorisation", "Grading on attendance"],
        correctIndex: 1,
        explanation: "Active learning engages students in doing & reflecting rather than passive listening.",
        difficulty: "EASY",
      },
      {
        stem: "Best approach when a child struggles with reading:",
        options: ["Ignore", "Punish", "Diagnose and use scaffolding", "Promote anyway"],
        correctIndex: 2,
        explanation: "Identify the gap and scaffold step-by-step with targeted support.",
        difficulty: "EASY",
      },
    ],
    evs: [
      {
        stem: "Which is a non-biodegradable item?",
        options: ["Paper", "Plastic bag", "Banana peel", "Cotton cloth"],
        correctIndex: 1,
        explanation: "Plastic does not naturally decompose for centuries.",
        difficulty: "EASY",
      },
    ],
    maths: [
      {
        stem: "Perimeter of a square with side 7 cm:",
        options: ["14 cm", "21 cm", "28 cm", "49 cm"],
        correctIndex: 2,
        explanation: "4 × side = 4 × 7 = 28 cm.",
        difficulty: "EASY",
      },
    ],
    languages: [
      {
        stem: "Identify the noun: 'The bird sings beautifully.'",
        options: ["Sings", "Beautifully", "Bird", "The"],
        correctIndex: 2,
        explanation: "'Bird' names a thing — it's a noun.",
        difficulty: "EASY",
      },
    ],
    "social-science": [
      {
        stem: "Year of Indian independence:",
        options: ["1945", "1946", "1947", "1948"],
        correctIndex: 2,
        explanation: "India gained independence on 15 August 1947.",
        difficulty: "EASY",
      },
    ],
  },

  /* ───────────────────────── State PSC ────────────────────────────── */
  state: {
    "indian-polity": [
      {
        stem: "Number of members in Lok Sabha (max):",
        options: ["500", "530", "543", "552"],
        correctIndex: 3,
        explanation: "Max 552 by Constitution (currently 543 elected).",
        difficulty: "MEDIUM",
      },
      {
        stem: "Tenure of the President of India:",
        options: ["4 years", "5 years", "6 years", "7 years"],
        correctIndex: 1,
        explanation: "President is elected for 5 years.",
        difficulty: "EASY",
      },
    ],
    history: [
      {
        stem: "Indian National Congress was founded in:",
        options: ["1857", "1885", "1905", "1919"],
        correctIndex: 1,
        explanation: "INC founded in 1885 by A.O. Hume.",
        difficulty: "EASY",
      },
      {
        stem: "Battle of Plassey fought in:",
        options: ["1707", "1757", "1761", "1857"],
        correctIndex: 1,
        explanation: "Plassey — 23 June 1757; British defeated Siraj-ud-Daulah.",
        difficulty: "MEDIUM",
      },
    ],
    geography: [
      {
        stem: "Longest river in India:",
        options: ["Yamuna", "Ganga", "Brahmaputra", "Godavari"],
        correctIndex: 1,
        explanation: "Ganga ~2,525 km within India.",
        difficulty: "EASY",
      },
      {
        stem: "Highest peak in India:",
        options: ["Everest", "K2", "Kanchenjunga", "Nanda Devi"],
        correctIndex: 2,
        explanation: "Kanchenjunga (8,586 m) is the highest peak within India. (K2 is in PoK, disputed.)",
        difficulty: "MEDIUM",
      },
    ],
    economy: [
      {
        stem: "GST in India was introduced in:",
        options: ["2015", "2016", "2017", "2018"],
        correctIndex: 2,
        explanation: "GST rolled out on 1 July 2017.",
        difficulty: "EASY",
      },
      {
        stem: "Repo rate is set by:",
        options: ["SEBI", "RBI MPC", "Finance Ministry", "NITI Aayog"],
        correctIndex: 1,
        explanation: "RBI's Monetary Policy Committee sets repo rate.",
        difficulty: "MEDIUM",
      },
    ],
    "state-gk": [
      {
        stem: "Capital of Bihar:",
        options: ["Ranchi", "Patna", "Bhubaneswar", "Raipur"],
        correctIndex: 1,
        explanation: "Patna is the capital of Bihar.",
        difficulty: "EASY",
      },
    ],
    "current-affairs": [
      {
        stem: "BRICS expansion in 2024 added members including:",
        options: ["UK & France", "Egypt & UAE", "Japan & Australia", "Germany & Spain"],
        correctIndex: 1,
        explanation: "BRICS+ in 2024 added Egypt, UAE, Iran, Ethiopia (and Saudi Arabia invited).",
        difficulty: "MEDIUM",
      },
    ],
  },
};
