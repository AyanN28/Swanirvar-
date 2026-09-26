export interface TrainingModule {
  id: string;
  title: string;
  category: 'Finance & Banking' | 'Operations & Supply' | 'Compliance & Digital';
  durationMinutes: number;
  xpPoints: number;
  description: string;
  lessonsCount: number;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
}

export interface QuizSubmission {
  moduleId: string;
  answers: Record<string, number>;
  citizenName: string;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  passed: boolean;
  xpEarned: number;
  certificateHash?: string;
  certificateTitle?: string;
  issuedAt?: string;
}

const COURSES: TrainingModule[] = [
  {
    id: 'course-1',
    title: 'Bank Loan Interview & DPR Defense Mastery',
    category: 'Finance & Banking',
    durationMinutes: 15,
    xpPoints: 150,
    description: 'Learn how to present your 3-year P&L cashflow, explain DSCR to SBI/PNB Branch Managers, and claim your PMEGP 35% subsidy.',
    lessonsCount: 4,
    questions: [
      {
        id: 'q1',
        question: 'What is a healthy DSCR (Debt Service Coverage Ratio) benchmark expected by Indian commercial banks?',
        options: ['Less than 0.8x', 'Between 1.5x and 2.5x', 'Exactly 0.0x', 'Negative 1.2x'],
        correctIndex: 1,
        explanation: 'Banks require a DSCR between 1.5x and 2.5x to ensure business cash flows can comfortably service loan principal and interest.',
      },
      {
        id: 'q2',
        question: 'Under PMEGP, what is the margin money subsidy percentage for Special Category entrepreneurs in rural areas?',
        options: ['15%', '25%', '35%', '50%'],
        correctIndex: 2,
        explanation: 'Special Category (SC/ST/OBC/Women/Minorities/Ex-Servicemen) in Rural areas receive the maximum 35% margin money subsidy under PMEGP.',
      },
    ],
  },
  {
    id: 'course-2',
    title: 'Digital Khata, Working Capital & Cashflow Discipline',
    category: 'Finance & Banking',
    durationMinutes: 12,
    xpPoints: 120,
    description: 'Master daily cashbook management, avoid excessive credit (Udhar) lockups, and optimize working capital cycles.',
    lessonsCount: 3,
    questions: [
      {
        id: 'q3',
        question: 'Why is separating personal family expenses from business shop accounts critical for enterprise longevity?',
        options: [
          'It is required to maintain clear profit calculations and accurate tax filing',
          'It is not needed in rural businesses',
          'Banks charge penalties if you maintain records',
          'It reduces customer sales',
        ],
        correctIndex: 0,
        explanation: 'Clear separation ensures you never accidentally erode working capital needed to purchase inventory next week.',
      },
    ],
  },
  {
    id: 'course-3',
    title: 'Mandi Price Discovery & Direct-to-Consumer Packaging',
    category: 'Operations & Supply',
    durationMinutes: 20,
    xpPoints: 200,
    description: 'Track e-NAM APMC daily spot prices, eliminate middlemen markups, and upgrade packaging for premium retail pricing.',
    lessonsCount: 5,
    questions: [
      {
        id: 'q4',
        question: 'How does nitrogen-flushed or vacuum sealed pouch packaging increase artisan profit margins?',
        options: [
          'Increases product shelf-life and allows selling at branded retail prices instead of bulk commodity rates',
          'It has no effect on pricing',
          'It reduces the shelf life',
          'It is banned under FSSAI',
        ],
        correctIndex: 0,
        explanation: 'Value-added branded packaging protects quality and allows commanding 20-40% higher retail margins.',
      },
    ],
  },
];

export function getTrainingModules(): TrainingModule[] {
  return COURSES;
}

export function evaluateQuiz(submission: QuizSubmission): QuizResult {
  const course = COURSES.find((c) => c.id === submission.moduleId);
  if (!course) {
    return { score: 0, totalQuestions: 0, passed: false, xpEarned: 0 };
  }

  let correct = 0;
  for (const q of course.questions) {
    if (submission.answers[q.id] === q.correctIndex) {
      correct++;
    }
  }

  const passed = correct >= Math.ceil(course.questions.length * 0.5);
  const xpEarned = passed ? course.xpPoints : Math.round(course.xpPoints * 0.3);

  if (passed) {
    const certHash = `SWN-CERT-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    return {
      score: correct,
      totalQuestions: course.questions.length,
      passed: true,
      xpEarned,
      certificateHash: certHash,
      certificateTitle: `${course.title}: Certified Sovereign Practitioner`,
      issuedAt: new Date().toISOString(),
    };
  }

  return {
    score: correct,
    totalQuestions: course.questions.length,
    passed: false,
    xpEarned,
  };
}
