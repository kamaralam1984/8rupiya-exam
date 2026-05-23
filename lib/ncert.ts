export type NcertChapter = {
  klass: number;
  subject: string;
  chapter: string;
  topics: string[];
};

const SCIENCE_10 = [
  { chapter: "Chemical Reactions and Equations", topics: ["Types of reactions", "Balancing equations", "Oxidation-reduction"] },
  { chapter: "Acids, Bases and Salts", topics: ["pH scale", "Salts and uses", "Indicators"] },
  { chapter: "Metals and Non-metals", topics: ["Reactivity series", "Extraction", "Corrosion"] },
  { chapter: "Carbon and its Compounds", topics: ["Functional groups", "Soaps", "Combustion"] },
  { chapter: "Life Processes", topics: ["Nutrition", "Respiration", "Transportation"] },
  { chapter: "Light — Reflection & Refraction", topics: ["Mirror formula", "Refraction laws", "Power of lens"] },
  { chapter: "Electricity", topics: ["Ohm's law", "Resistance", "Joule heating"] },
];

const MATHS_10 = [
  { chapter: "Real Numbers", topics: ["Euclid's lemma", "Irrational numbers"] },
  { chapter: "Polynomials", topics: ["Zeros", "Division algorithm"] },
  { chapter: "Pair of Linear Equations", topics: ["Substitution", "Elimination"] },
  { chapter: "Quadratic Equations", topics: ["Roots", "Discriminant"] },
  { chapter: "Triangles", topics: ["Similarity", "BPT"] },
  { chapter: "Coordinate Geometry", topics: ["Distance", "Section formula"] },
  { chapter: "Trigonometry", topics: ["Identities", "Applications"] },
  { chapter: "Circles", topics: ["Tangents", "Two tangents from external point"] },
  { chapter: "Statistics", topics: ["Mean, median, mode", "Ogive"] },
  { chapter: "Probability", topics: ["Classical definition", "Sample space"] },
];

const PHYSICS_12 = [
  { chapter: "Electrostatics", topics: ["Coulomb's law", "Field & potential", "Capacitors"] },
  { chapter: "Current Electricity", topics: ["Drift velocity", "Kirchhoff laws", "Wheatstone"] },
  { chapter: "Magnetic Effects", topics: ["Biot-Savart", "Ampere's law", "Moving coil"] },
  { chapter: "EMI & AC", topics: ["Faraday", "LC circuits", "Transformers"] },
  { chapter: "Optics", topics: ["Refraction", "Wave optics", "Polarization"] },
  { chapter: "Modern Physics", topics: ["Photoelectric", "Bohr model", "Nucleus"] },
];

const CHEM_12 = [
  { chapter: "Solutions", topics: ["Colligative properties", "Raoult's law"] },
  { chapter: "Electrochemistry", topics: ["Nernst", "Galvanic cells"] },
  { chapter: "Chemical Kinetics", topics: ["Order, molecularity", "Arrhenius"] },
  { chapter: "p-Block", topics: ["Group 15", "Group 16-18"] },
  { chapter: "Coordination Compounds", topics: ["Nomenclature", "Werner theory"] },
  { chapter: "Biomolecules", topics: ["Carbohydrates", "Proteins", "Nucleic acids"] },
];

const BIO_12 = [
  { chapter: "Reproduction", topics: ["Sexual reproduction", "Human reproduction"] },
  { chapter: "Genetics & Evolution", topics: ["Mendel", "DNA replication"] },
  { chapter: "Biology in Human Welfare", topics: ["Health & disease", "Microbes"] },
  { chapter: "Biotechnology", topics: ["Principles", "Applications"] },
  { chapter: "Ecology", topics: ["Ecosystem", "Biodiversity"] },
];

const SST_10 = [
  { chapter: "Nationalism in India", topics: ["Non-cooperation", "Civil disobedience"] },
  { chapter: "Federalism", topics: ["Central-state", "Three lists"] },
  { chapter: "Sectors of Indian Economy", topics: ["Primary/secondary/tertiary", "Organized vs unorganized"] },
  { chapter: "Resources & Development", topics: ["Land use", "Soil"] },
];

export const NCERT: NcertChapter[] = [
  ...SCIENCE_10.map((c) => ({ klass: 10, subject: "Science", ...c })),
  ...MATHS_10.map((c) => ({ klass: 10, subject: "Maths", ...c })),
  ...SST_10.map((c) => ({ klass: 10, subject: "Social Science", ...c })),
  ...PHYSICS_12.map((c) => ({ klass: 12, subject: "Physics", ...c })),
  ...CHEM_12.map((c) => ({ klass: 12, subject: "Chemistry", ...c })),
  ...BIO_12.map((c) => ({ klass: 12, subject: "Biology", ...c })),
];

export const NCERT_CLASSES = [10, 12] as const;
export function ncertSubjectsByClass(klass: number) {
  return Array.from(new Set(NCERT.filter((c) => c.klass === klass).map((c) => c.subject)));
}
