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
 *
 * IMPORTANT: keys MUST match the slugified subject names in lib/exams.ts.
 * See the comments next to each exam for the canonical subject list.
 */
export const QUESTION_BANK: Record<string, Record<string, SampleQ[]>> = {
  /* NEET — subjects: Physics, Chemistry, Biology */
  neet: {
    physics: [
      {
        stem: "A body moves with uniform acceleration. Which of the following remains constant?",
        options: ["Velocity", "Acceleration", "Displacement", "Speed"],
        correctIndex: 1,
        explanation: "Uniform acceleration means acceleration value is constant; velocity changes uniformly.",
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
        explanation: "1/v - 1/u = 1/f → 1/60 - 1/u = 1/20 → u = -30 cm.",
        difficulty: "MEDIUM",
      },
      {
        stem: "Boyle's Law states that at constant temperature:",
        options: ["PV is constant", "V/T is constant", "P/T is constant", "PVT is constant"],
        correctIndex: 0,
        explanation: "PV = constant at constant T for a fixed amount of gas.",
        difficulty: "EASY",
      },
      {
        stem: "The de Broglie wavelength is associated with:",
        options: ["Only photons", "Only electrons", "All moving matter", "Only fast particles"],
        correctIndex: 2,
        explanation: "Every moving particle has λ = h/p.",
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
        explanation: "Fluorine — ~3.98 on Pauling scale.",
        difficulty: "EASY",
      },
      {
        stem: "Number of σ bonds in ethene (C₂H₄):",
        options: ["3", "4", "5", "6"],
        correctIndex: 2,
        explanation: "1 C–C σ + 4 C–H σ = 5 σ bonds.",
        difficulty: "MEDIUM",
      },
      {
        stem: "Which gas is liberated when an active metal reacts with a dilute acid?",
        options: ["O₂", "H₂", "Cl₂", "CO₂"],
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
        explanation: "O negative lacks A, B and Rh antigens — donates to any group.",
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

  /* CTET — subjects: Child Development, Pedagogy, EVS, Mathematics, Languages */
  ctet: {
    "child-development": [
      {
        stem: "Piaget's pre-operational stage occurs at the age of:",
        options: ["0–2 years", "2–7 years", "7–11 years", "11+ years"],
        correctIndex: 1,
        explanation: "Pre-operational stage: roughly 2–7 years.",
        difficulty: "EASY",
      },
      {
        stem: "Howard Gardner is associated with the theory of:",
        options: ["Operant Conditioning", "Multiple Intelligences", "ZPD", "Moral Development"],
        correctIndex: 1,
        explanation: "Gardner proposed multiple intelligences (linguistic, logical, etc.).",
        difficulty: "MEDIUM",
      },
      {
        stem: "Inclusive education emphasises:",
        options: ["Separate schools", "All learners in the same classroom", "Only academic excellence", "Streaming by IQ"],
        correctIndex: 1,
        explanation: "Inclusion means equitable participation of every child in the same classroom.",
        difficulty: "EASY",
      },
      {
        stem: "Vygotsky's Zone of Proximal Development is:",
        options: ["What child can do alone", "What child can do with guidance", "Innate ability", "Genetic potential"],
        correctIndex: 1,
        explanation: "ZPD = gap between independent and assisted performance.",
        difficulty: "MEDIUM",
      },
      {
        stem: "CCE (Continuous and Comprehensive Evaluation) focuses on:",
        options: ["Year-end exams only", "Holistic year-round assessment", "Co-curricular only", "Ranking"],
        correctIndex: 1,
        explanation: "CCE assesses scholastic + co-scholastic growth continuously.",
        difficulty: "EASY",
      },
    ],
    pedagogy: [
      {
        stem: "Constructivist pedagogy means learners:",
        options: ["Passively receive knowledge", "Actively construct meaning", "Only memorise", "Are graded on tests alone"],
        correctIndex: 1,
        explanation: "Constructivism treats learners as active builders of knowledge.",
        difficulty: "EASY",
      },
      {
        stem: "Which is an example of formative assessment?",
        options: ["Final board exam", "Quick classroom quiz", "Entrance test", "Year-end ranking"],
        correctIndex: 1,
        explanation: "Formative assessment is short and ongoing for feedback.",
        difficulty: "EASY",
      },
      {
        stem: "An effective teacher should primarily be:",
        options: ["A strict authority", "A facilitator of learning", "A perfectionist", "A grader"],
        correctIndex: 1,
        explanation: "Modern pedagogy frames the teacher as a facilitator.",
        difficulty: "EASY",
      },
    ],
    evs: [
      {
        stem: "Which is a renewable source of energy?",
        options: ["Coal", "Petroleum", "Solar", "Natural gas"],
        correctIndex: 2,
        explanation: "Solar, wind, hydro are renewable.",
        difficulty: "EASY",
      },
      {
        stem: "World Environment Day is observed on:",
        options: ["5 May", "5 June", "22 April", "16 September"],
        correctIndex: 1,
        explanation: "World Environment Day — 5 June (since 1972).",
        difficulty: "EASY",
      },
      {
        stem: "Which gas is mainly responsible for global warming?",
        options: ["O₂", "N₂", "CO₂", "Ar"],
        correctIndex: 2,
        explanation: "CO₂ is the main long-lived greenhouse gas.",
        difficulty: "EASY",
      },
    ],
    mathematics: [
      {
        stem: "Solve: (3/4) ÷ (1/2) = ?",
        options: ["3/8", "3/2", "2/3", "4/3"],
        correctIndex: 1,
        explanation: "Divide by a fraction = multiply by reciprocal: 3/4 × 2 = 3/2.",
        difficulty: "EASY",
      },
      {
        stem: "If 25% of a number is 50, the number is:",
        options: ["100", "150", "200", "250"],
        correctIndex: 2,
        explanation: "Number × 0.25 = 50 → 200.",
        difficulty: "EASY",
      },
      {
        stem: "Perimeter of a rectangle 8 × 5 cm:",
        options: ["13 cm", "26 cm", "40 cm", "80 cm"],
        correctIndex: 1,
        explanation: "P = 2(l + b) = 2(8+5) = 26 cm.",
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
        stem: "Identify the noun: 'The teacher writes on the board.'",
        options: ["Writes", "On", "Teacher", "The"],
        correctIndex: 2,
        explanation: "'Teacher' and 'board' are nouns.",
        difficulty: "EASY",
      },
      {
        stem: "‘किताब’ शब्द का बहुवचन है:",
        options: ["किताबी", "किताबें", "किताबों", "किताबकर"],
        correctIndex: 1,
        explanation: "‘किताब’ → ‘किताबें’ (बहुवचन).",
        difficulty: "EASY",
      },
    ],
  },

  /* SSC — subjects: Quant, Reasoning, English, GK */
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
        explanation: "(1+3+5+7+9)/5 = 5.",
        difficulty: "EASY",
      },
      {
        stem: "Simple interest on ₹1000 at 10% p.a. for 2 years:",
        options: ["₹100", "₹200", "₹220", "₹250"],
        correctIndex: 1,
        explanation: "SI = PRT/100 = 200.",
        difficulty: "EASY",
      },
    ],
    reasoning: [
      {
        stem: "Next term: 2, 6, 12, 20, 30, ?",
        options: ["36", "40", "42", "48"],
        correctIndex: 2,
        explanation: "Differences 4,6,8,10,12 → 30+12=42.",
        difficulty: "EASY",
      },
      {
        stem: "A is brother of B. B is sister of C. C is father of D. D is A's:",
        options: ["Nephew/niece", "Son", "Cousin", "Brother"],
        correctIndex: 0,
        explanation: "A is sibling of C; D is C's child; so niece/nephew of A.",
        difficulty: "MEDIUM",
      },
      {
        stem: "If FRIEND is coded as HTKGPF, CANDLE will be:",
        options: ["DCQFNG", "ECPFNG", "EDRJOH", "DDPFNG"],
        correctIndex: 1,
        explanation: "Each letter +2: C→E, A→C, N→P, D→F, L→N, E→G.",
        difficulty: "MEDIUM",
      },
    ],
    english: [
      {
        stem: "Synonym of 'meticulous':",
        options: ["Careless", "Painstaking", "Hasty", "Random"],
        correctIndex: 1,
        explanation: "Meticulous = painstaking.",
        difficulty: "MEDIUM",
      },
      {
        stem: "Antonym of 'benevolent':",
        options: ["Generous", "Cruel", "Cautious", "Brave"],
        correctIndex: 1,
        explanation: "Benevolent ↔ malevolent/cruel.",
        difficulty: "MEDIUM",
      },
      {
        stem: "Choose the correctly spelled word.",
        options: ["Ocurred", "Occured", "Occurred", "Occured"],
        correctIndex: 2,
        explanation: "OCCURRED — two C's, two R's.",
        difficulty: "EASY",
      },
    ],
    gk: [
      {
        stem: "Which Article guarantees Right to Equality?",
        options: ["Article 14", "Article 19", "Article 21", "Article 32"],
        correctIndex: 0,
        explanation: "Article 14 — equality before law.",
        difficulty: "EASY",
      },
      {
        stem: "Currency of Japan:",
        options: ["Yuan", "Won", "Yen", "Ringgit"],
        correctIndex: 2,
        explanation: "Yen (¥).",
        difficulty: "EASY",
      },
      {
        stem: "Indian state with the longest coastline:",
        options: ["Tamil Nadu", "Maharashtra", "Andhra Pradesh", "Gujarat"],
        correctIndex: 3,
        explanation: "Gujarat (~1,600 km).",
        difficulty: "MEDIUM",
      },
    ],
  },

  /* Railway — subjects: Maths, Reasoning, Science, Current Affairs */
  railway: {
    maths: [
      {
        stem: "A train of 200 m crosses a 100 m platform in 30 s. Train's speed:",
        options: ["10 m/s", "12 m/s", "8 m/s", "15 m/s"],
        correctIndex: 0,
        explanation: "Total 300 m / 30 s = 10 m/s.",
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
      {
        stem: "Distance covered in 30 minutes at 60 km/h:",
        options: ["20 km", "30 km", "40 km", "60 km"],
        correctIndex: 1,
        explanation: "60 × 0.5 = 30 km.",
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
      {
        stem: "If TIGER is coded as VKIGT, LION is:",
        options: ["MJPQ", "NKQP", "NKPQ", "MJOP"],
        correctIndex: 2,
        explanation: "Each letter +2: L→N, I→K, O→Q, N→P → NKQP.",
        difficulty: "MEDIUM",
      },
    ],
    science: [
      {
        stem: "Chemical symbol of Sodium:",
        options: ["So", "Sd", "Na", "S"],
        correctIndex: 2,
        explanation: "Sodium = Na (Latin natrium).",
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
        explanation: "Vitamin A deficiency.",
        difficulty: "EASY",
      },
      {
        stem: "Acceleration due to gravity (Earth) is approximately:",
        options: ["9.8 m/s²", "1.6 m/s²", "20 m/s²", "5 m/s²"],
        correctIndex: 0,
        explanation: "g ≈ 9.8 m/s² on Earth's surface.",
        difficulty: "EASY",
      },
    ],
    "current-affairs": [
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
        explanation: "Dr. Ambedkar chaired the drafting committee.",
        difficulty: "EASY",
      },
      {
        stem: "G20 2023 summit was hosted by which country?",
        options: ["India", "Indonesia", "Brazil", "Japan"],
        correctIndex: 0,
        explanation: "G20 2023 — held in New Delhi, India.",
        difficulty: "EASY",
      },
    ],
  },

  /* Banking — subjects: Quant, Reasoning, English, Banking Awareness */
  banking: {
    quant: [
      {
        stem: "Compound interest on ₹10,000 at 10% p.a. for 2 years:",
        options: ["₹2,000", "₹2,100", "₹2,200", "₹2,300"],
        correctIndex: 1,
        explanation: "10000(1.1)² = 12100; CI = ₹2,100.",
        difficulty: "MEDIUM",
      },
      {
        stem: "Ratio 3:5 = ?:25",
        options: ["10", "12", "15", "18"],
        correctIndex: 2,
        explanation: "3:5 = 15:25.",
        difficulty: "EASY",
      },
      {
        stem: "A discount of 20% on ₹500:",
        options: ["₹50", "₹80", "₹100", "₹120"],
        correctIndex: 2,
        explanation: "20% of 500 = 100.",
        difficulty: "EASY",
      },
    ],
    reasoning: [
      {
        stem: "If MOTHER is coded as OQVJGT, FATHER is:",
        options: ["HCVJGT", "GBUIFS", "HBVJGT", "HCVIFT"],
        correctIndex: 0,
        explanation: "Each letter +2: F→H, A→C, T→V, H→J, E→G, R→T.",
        difficulty: "MEDIUM",
      },
      {
        stem: "A walks 5 m north, turns right 5 m, then right 5 m. Final direction faced:",
        options: ["North", "South", "East", "West"],
        correctIndex: 1,
        explanation: "North → East → South.",
        difficulty: "MEDIUM",
      },
      {
        stem: "If all dogs are mammals and some mammals are carnivores, which must be true?",
        options: ["All dogs are carnivores", "Some dogs may be carnivores", "No dog is a carnivore", "All carnivores are dogs"],
        correctIndex: 1,
        explanation: "Only 'some dogs may be' can be inferred from premises.",
        difficulty: "MEDIUM",
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
      {
        stem: "Antonym of 'optimistic':",
        options: ["Hopeful", "Pessimistic", "Cheerful", "Positive"],
        correctIndex: 1,
        explanation: "Optimistic ↔ Pessimistic.",
        difficulty: "EASY",
      },
    ],
    "banking-awareness": [
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
        stem: "Repo rate is decided by:",
        options: ["Finance Ministry", "SEBI", "RBI MPC", "PMO"],
        correctIndex: 2,
        explanation: "RBI's Monetary Policy Committee (MPC) decides repo rate.",
        difficulty: "MEDIUM",
      },
      {
        stem: "CRR (Cash Reserve Ratio) is maintained with:",
        options: ["Government", "SEBI", "RBI", "World Bank"],
        correctIndex: 2,
        explanation: "Banks maintain CRR balance with RBI.",
        difficulty: "MEDIUM",
      },
    ],
  },

  /* CUET — subjects: General Test, Domain Subjects, Languages */
  cuet: {
    "general-test": [
      {
        stem: "If 1 March is Tuesday, what day is 15 March?",
        options: ["Monday", "Tuesday", "Wednesday", "Thursday"],
        correctIndex: 1,
        explanation: "14 days later = 2 weeks → same day = Tuesday.",
        difficulty: "EASY",
      },
      {
        stem: "Capital of Australia:",
        options: ["Sydney", "Melbourne", "Canberra", "Perth"],
        correctIndex: 2,
        explanation: "Canberra (not largest city).",
        difficulty: "EASY",
      },
      {
        stem: "Find the next term: 1, 4, 9, 16, ?",
        options: ["20", "23", "25", "27"],
        correctIndex: 2,
        explanation: "Squares: 1², 2², 3², 4², 5² = 25.",
        difficulty: "EASY",
      },
    ],
    "domain-subjects": [
      {
        stem: "Which is a primary economic activity?",
        options: ["Manufacturing", "Banking", "Farming", "Software"],
        correctIndex: 2,
        explanation: "Primary = direct use of natural resources.",
        difficulty: "EASY",
      },
      {
        stem: "Mendel's experiments were performed on:",
        options: ["Roses", "Pea plants", "Maize", "Sunflowers"],
        correctIndex: 1,
        explanation: "Pea (Pisum sativum).",
        difficulty: "EASY",
      },
      {
        stem: "GDP stands for:",
        options: ["Gross Domestic Product", "General Demand Pattern", "Global Direct Pricing", "Gross Development Plan"],
        correctIndex: 0,
        explanation: "GDP = total monetary value of goods + services in a country.",
        difficulty: "EASY",
      },
    ],
    languages: [
      {
        stem: "Choose the correct article: '___ honest person is trusted.'",
        options: ["A", "An", "The", "No article"],
        correctIndex: 1,
        explanation: "Honest starts with vowel sound → 'An'.",
        difficulty: "EASY",
      },
      {
        stem: "Synonym of 'lucid':",
        options: ["Confusing", "Clear", "Dim", "Hidden"],
        correctIndex: 1,
        explanation: "Lucid = clear.",
        difficulty: "MEDIUM",
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

  /* Class 10 — subjects: Science, Maths, Social Science, English, Hindi */
  "class-10": {
    science: [
      {
        stem: "Photosynthesis occurs in:",
        options: ["Mitochondria", "Nucleus", "Chloroplast", "Ribosome"],
        correctIndex: 2,
        explanation: "Chloroplasts contain chlorophyll.",
        difficulty: "EASY",
      },
      {
        stem: "Newton's first law is also known as the law of:",
        options: ["Action–reaction", "Inertia", "Acceleration", "Conservation"],
        correctIndex: 1,
        explanation: "Law of Inertia.",
        difficulty: "EASY",
      },
      {
        stem: "Chemical formula of Sodium chloride:",
        options: ["NaCl", "Na₂Cl", "NaCl₂", "Na₂Cl₂"],
        correctIndex: 0,
        explanation: "Sodium chloride = NaCl.",
        difficulty: "EASY",
      },
    ],
    maths: [
      {
        stem: "Roots of x² – 5x + 6 = 0:",
        options: ["2 and 3", "1 and 6", "–2 and –3", "3 and –2"],
        correctIndex: 0,
        explanation: "(x–2)(x–3) = 0.",
        difficulty: "EASY",
      },
      {
        stem: "Area of a circle with r = 7 cm (π = 22/7):",
        options: ["44 cm²", "154 cm²", "44 cm", "154 cm"],
        correctIndex: 1,
        explanation: "πr² = 22/7 × 49 = 154 cm².",
        difficulty: "EASY",
      },
      {
        stem: "If sin θ = 3/5, cos θ =",
        options: ["3/5", "4/5", "5/4", "5/3"],
        correctIndex: 1,
        explanation: "sin² + cos² = 1 → cos θ = 4/5.",
        difficulty: "MEDIUM",
      },
    ],
    "social-science": [
      {
        stem: "Quit India Movement was launched in:",
        options: ["1920", "1930", "1942", "1947"],
        correctIndex: 2,
        explanation: "8 August 1942.",
        difficulty: "EASY",
      },
      {
        stem: "Headquarters of the United Nations:",
        options: ["Paris", "New York", "Geneva", "Vienna"],
        correctIndex: 1,
        explanation: "UN HQ — New York City.",
        difficulty: "EASY",
      },
      {
        stem: "Largest planet in the solar system:",
        options: ["Earth", "Saturn", "Jupiter", "Mars"],
        correctIndex: 2,
        explanation: "Jupiter is the largest planet.",
        difficulty: "EASY",
      },
    ],
    english: [
      {
        stem: "Identify the figure of speech: 'The wind whispered through the trees.'",
        options: ["Simile", "Metaphor", "Personification", "Alliteration"],
        correctIndex: 2,
        explanation: "Human trait given to non-human → personification.",
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
        explanation: "‘किताब’ → ‘किताबें’.",
        difficulty: "EASY",
      },
      {
        stem: "‘रवि’ किसका पर्यायवाची है?",
        options: ["चंद्र", "सूर्य", "अग्नि", "वायु"],
        correctIndex: 1,
        explanation: "रवि = सूर्य.",
        difficulty: "EASY",
      },
      {
        stem: "‘पुस्तक’ का स्त्रीलिंग है?",
        options: ["पुस्तक", "पुस्तकम्", "ग्रंथ", "लेखक"],
        correctIndex: 0,
        explanation: "‘पुस्तक’ स्वयं स्त्रीलिंग है.",
        difficulty: "EASY",
      },
    ],
  },

  /* NIIT — subjects: Logical Reasoning, English, Computer Basics */
  niit: {
    "logical-reasoning": [
      {
        stem: "If all roses are flowers and some flowers fade quickly, which is true?",
        options: ["All roses fade quickly", "Some roses may fade quickly", "No rose fades quickly", "All flowers are roses"],
        correctIndex: 1,
        explanation: "Only 'some roses may' can be inferred.",
        difficulty: "MEDIUM",
      },
      {
        stem: "Next in series: 1, 4, 9, 16, ?",
        options: ["20", "23", "25", "27"],
        correctIndex: 2,
        explanation: "Squares: 5² = 25.",
        difficulty: "EASY",
      },
      {
        stem: "If 3 workers complete a task in 8 days, 6 workers complete it in:",
        options: ["2 days", "4 days", "6 days", "16 days"],
        correctIndex: 1,
        explanation: "Inverse: 3×8 = 6×x → 4 days.",
        difficulty: "EASY",
      },
      {
        stem: "Average of 10, 20, 30, 40, 50:",
        options: ["25", "30", "35", "40"],
        correctIndex: 1,
        explanation: "150/5 = 30.",
        difficulty: "EASY",
      },
    ],
    english: [
      {
        stem: "Choose the correct preposition: 'She is good ___ mathematics.'",
        options: ["in", "at", "on", "with"],
        correctIndex: 1,
        explanation: "'Good at <skill>' is the idiom.",
        difficulty: "EASY",
      },
      {
        stem: "Antonym of 'expand':",
        options: ["Grow", "Shrink", "Increase", "Stretch"],
        correctIndex: 1,
        explanation: "Expand ↔ Shrink.",
        difficulty: "EASY",
      },
      {
        stem: "Synonym of 'rapid':",
        options: ["Slow", "Quick", "Heavy", "Long"],
        correctIndex: 1,
        explanation: "Rapid = quick.",
        difficulty: "EASY",
      },
    ],
    "computer-basics": [
      {
        stem: "RAM stands for:",
        options: ["Read Access Memory", "Random Access Memory", "Rapid Auxiliary Memory", "Read Allocated Memory"],
        correctIndex: 1,
        explanation: "RAM = Random Access Memory.",
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
      {
        stem: "Which device is an input device?",
        options: ["Monitor", "Printer", "Keyboard", "Speaker"],
        correctIndex: 2,
        explanation: "Keyboard is an input device; others are output.",
        difficulty: "EASY",
      },
      {
        stem: "Full form of CPU:",
        options: ["Central Processing Unit", "Computer Personal Unit", "Central Power Unit", "Common Processing Utility"],
        correctIndex: 0,
        explanation: "CPU = Central Processing Unit.",
        difficulty: "EASY",
      },
    ],
  },

  /* Police — subjects: Reasoning, GK, Maths, Hindi/English */
  police: {
    reasoning: [
      {
        stem: "If TIGER is coded as VKIGT, then LION is:",
        options: ["MJPQ", "NKQP", "NKPQ", "MJOP"],
        correctIndex: 2,
        explanation: "Each letter +2: L→N, I→K, O→Q, N→P.",
        difficulty: "MEDIUM",
      },
      {
        stem: "Find odd one: Knife, Sword, Gun, Pen",
        options: ["Knife", "Sword", "Gun", "Pen"],
        correctIndex: 3,
        explanation: "Pen is for writing; others are weapons.",
        difficulty: "EASY",
      },
      {
        stem: "Next in series: 3, 6, 12, 24, ?",
        options: ["36", "48", "60", "72"],
        correctIndex: 1,
        explanation: "Each term doubles: 24 × 2 = 48.",
        difficulty: "EASY",
      },
    ],
    gk: [
      {
        stem: "First woman IPS officer of India:",
        options: ["Kiran Bedi", "Indira Gandhi", "Sarojini Naidu", "Sucheta Kriplani"],
        correctIndex: 0,
        explanation: "Kiran Bedi — first woman IPS (1972 batch).",
        difficulty: "EASY",
      },
      {
        stem: "National Emergency in India is declared under Article:",
        options: ["352", "356", "360", "370"],
        correctIndex: 0,
        explanation: "Article 352.",
        difficulty: "MEDIUM",
      },
      {
        stem: "Famous folk dance of Punjab:",
        options: ["Bharatanatyam", "Bhangra", "Garba", "Kuchipudi"],
        correctIndex: 1,
        explanation: "Bhangra — Punjab's signature folk dance.",
        difficulty: "EASY",
      },
    ],
    maths: [
      {
        stem: "If 60% of a number is 120, the number is:",
        options: ["180", "200", "220", "240"],
        correctIndex: 1,
        explanation: "Number = 120/0.6 = 200.",
        difficulty: "EASY",
      },
      {
        stem: "Speed = 90 km/h. Distance in 30 min:",
        options: ["30 km", "45 km", "60 km", "90 km"],
        correctIndex: 1,
        explanation: "90 × 0.5 = 45 km.",
        difficulty: "EASY",
      },
      {
        stem: "Area of a rectangle 8 × 5:",
        options: ["13", "26", "40", "80"],
        correctIndex: 2,
        explanation: "8 × 5 = 40 sq units.",
        difficulty: "EASY",
      },
    ],
    "hindi-english": [
      {
        stem: "Synonym of 'brave':",
        options: ["Timid", "Courageous", "Weak", "Cautious"],
        correctIndex: 1,
        explanation: "Brave = courageous.",
        difficulty: "EASY",
      },
      {
        stem: "Choose correctly spelled word:",
        options: ["Definately", "Definitely", "Definitley", "Definatley"],
        correctIndex: 1,
        explanation: "DEFINITELY.",
        difficulty: "EASY",
      },
      {
        stem: "‘अग्नि’ का पर्यायवाची है:",
        options: ["पावक", "वायु", "जल", "पवन"],
        correctIndex: 0,
        explanation: "अग्नि = पावक/अनल.",
        difficulty: "EASY",
      },
    ],
  },

  /* Teacher — subjects: Pedagogy, Child Psychology, Subjects, Languages */
  teacher: {
    pedagogy: [
      {
        stem: "Active learning emphasises:",
        options: ["Lecture only", "Learner involvement and reflection", "Memorisation", "Grading on attendance"],
        correctIndex: 1,
        explanation: "Active learning engages students in doing and reflecting.",
        difficulty: "EASY",
      },
      {
        stem: "Best approach when a child struggles with reading:",
        options: ["Ignore", "Punish", "Diagnose and scaffold", "Promote anyway"],
        correctIndex: 2,
        explanation: "Identify gap and scaffold with targeted support.",
        difficulty: "EASY",
      },
      {
        stem: "Which is an example of formative assessment?",
        options: ["Final board exam", "Weekly classroom quiz", "University entrance", "Yearly ranking"],
        correctIndex: 1,
        explanation: "Formative = short, ongoing checks.",
        difficulty: "EASY",
      },
    ],
    "child-psychology": [
      {
        stem: "Maslow's hierarchy places ___ at the top:",
        options: ["Safety", "Belonging", "Self-actualization", "Esteem"],
        correctIndex: 2,
        explanation: "Self-actualization is the apex of Maslow's hierarchy.",
        difficulty: "MEDIUM",
      },
      {
        stem: "Stage at which abstract reasoning develops (Piaget):",
        options: ["Sensorimotor", "Pre-operational", "Concrete operational", "Formal operational"],
        correctIndex: 3,
        explanation: "Formal operational (~11+ years).",
        difficulty: "MEDIUM",
      },
      {
        stem: "Vygotsky's ZPD is best supported by:",
        options: ["Rote drills", "Scaffolding", "Punishment", "Only testing"],
        correctIndex: 1,
        explanation: "Scaffolding helps cross the Zone of Proximal Development.",
        difficulty: "MEDIUM",
      },
    ],
    subjects: [
      {
        stem: "Which is a renewable source of energy?",
        options: ["Coal", "Petroleum", "Solar", "Natural gas"],
        correctIndex: 2,
        explanation: "Solar, wind, hydro = renewable.",
        difficulty: "EASY",
      },
      {
        stem: "Perimeter of a square with side 7 cm:",
        options: ["14 cm", "21 cm", "28 cm", "49 cm"],
        correctIndex: 2,
        explanation: "4 × 7 = 28 cm.",
        difficulty: "EASY",
      },
      {
        stem: "Year of Indian independence:",
        options: ["1945", "1946", "1947", "1948"],
        correctIndex: 2,
        explanation: "15 August 1947.",
        difficulty: "EASY",
      },
      {
        stem: "Photosynthesis occurs in:",
        options: ["Mitochondria", "Nucleus", "Chloroplast", "Ribosome"],
        correctIndex: 2,
        explanation: "Chloroplasts contain chlorophyll.",
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
      {
        stem: "‘किताब’ शब्द का बहुवचन है:",
        options: ["किताबी", "किताबें", "किताबों", "किताबकर"],
        correctIndex: 1,
        explanation: "‘किताब’ → ‘किताबें’.",
        difficulty: "EASY",
      },
      {
        stem: "Choose correct article: '___ honest man.'",
        options: ["A", "An", "The", "No article"],
        correctIndex: 1,
        explanation: "Vowel sound → 'An'.",
        difficulty: "EASY",
      },
    ],
  },

  /* State PSC — subjects: State GK, History, Geography, Polity, Current Affairs */
  state: {
    "state-gk": [
      {
        stem: "Capital of Bihar:",
        options: ["Ranchi", "Patna", "Bhubaneswar", "Raipur"],
        correctIndex: 1,
        explanation: "Patna is Bihar's capital.",
        difficulty: "EASY",
      },
      {
        stem: "Famous folk dance of Punjab:",
        options: ["Bharatanatyam", "Bhangra", "Garba", "Kuchipudi"],
        correctIndex: 1,
        explanation: "Bhangra — Punjab's folk dance.",
        difficulty: "EASY",
      },
      {
        stem: "Capital of Uttar Pradesh:",
        options: ["Allahabad", "Kanpur", "Lucknow", "Varanasi"],
        correctIndex: 2,
        explanation: "Lucknow is UP's capital.",
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
        explanation: "23 June 1757.",
        difficulty: "MEDIUM",
      },
      {
        stem: "Quit India Movement launched in:",
        options: ["1920", "1930", "1942", "1947"],
        correctIndex: 2,
        explanation: "8 August 1942.",
        difficulty: "EASY",
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
        stem: "Highest peak within India:",
        options: ["Everest", "K2", "Kanchenjunga", "Nanda Devi"],
        correctIndex: 2,
        explanation: "Kanchenjunga (8,586 m).",
        difficulty: "MEDIUM",
      },
      {
        stem: "Indian state with the longest coastline:",
        options: ["Tamil Nadu", "Maharashtra", "Andhra Pradesh", "Gujarat"],
        correctIndex: 3,
        explanation: "Gujarat (~1,600 km).",
        difficulty: "MEDIUM",
      },
    ],
    polity: [
      {
        stem: "Maximum strength of Lok Sabha (Constitution):",
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
      {
        stem: "Which Article guarantees Right to Equality?",
        options: ["Article 14", "Article 19", "Article 21", "Article 32"],
        correctIndex: 0,
        explanation: "Article 14.",
        difficulty: "EASY",
      },
    ],
    "current-affairs": [
      {
        stem: "GST in India was introduced in:",
        options: ["2015", "2016", "2017", "2018"],
        correctIndex: 2,
        explanation: "1 July 2017.",
        difficulty: "EASY",
      },
      {
        stem: "BRICS expansion in 2024 added members including:",
        options: ["UK & France", "Egypt & UAE", "Japan & Australia", "Germany & Spain"],
        correctIndex: 1,
        explanation: "BRICS+ in 2024 added Egypt, UAE, Iran, Ethiopia.",
        difficulty: "MEDIUM",
      },
      {
        stem: "G20 2023 summit hosted by:",
        options: ["India", "Indonesia", "Brazil", "Japan"],
        correctIndex: 0,
        explanation: "G20 2023 — New Delhi, India.",
        difficulty: "EASY",
      },
    ],
  },
};
