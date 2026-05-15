export interface RubricCriterion {
  key: string;
  label: string;
  maxScore: number;
  description: string;
}

export const PROPOSAL_RUBRIC: RubricCriterion[] = [
  {
    key: "relevance",
    label: "Relevance & Significance",
    maxScore: 20,
    description: "How relevant and significant is the research topic to the field?",
  },
  {
    key: "objectives",
    label: "Clarity of Objectives",
    maxScore: 20,
    description: "Are the research objectives clearly stated and achievable?",
  },
  {
    key: "methodology",
    label: "Methodology",
    maxScore: 25,
    description: "Is the proposed methodology appropriate and well-described?",
  },
  {
    key: "review",
    label: "Literature Review",
    maxScore: 20,
    description: "Is the literature review comprehensive and up-to-date?",
  },
  {
    key: "feasibility",
    label: "Feasibility",
    maxScore: 15,
    description: "Is the project feasible within the given time and resource constraints?",
  },
];

export const FINAL_RUBRIC: RubricCriterion[] = [
  {
    key: "introduction",
    label: "Introduction & Background",
    maxScore: 15,
    description: "Quality of the introduction and background of the study.",
  },
  {
    key: "methodology",
    label: "Methodology & Implementation",
    maxScore: 25,
    description: "Soundness of methodology and completeness of implementation.",
  },
  {
    key: "results",
    label: "Results & Discussion",
    maxScore: 25,
    description: "Quality and depth of results analysis and discussion.",
  },
  {
    key: "conclusion",
    label: "Conclusion & Recommendations",
    maxScore: 15,
    description: "Clarity and relevance of conclusions and recommendations.",
  },
  {
    key: "presentation",
    label: "Presentation & Defense",
    maxScore: 20,
    description: "Quality of the oral presentation and ability to defend the research.",
  },
];

export function getRubric(stage: "PROPOSAL" | "FINAL_DEFENSE"): RubricCriterion[] {
  return stage === "PROPOSAL" ? PROPOSAL_RUBRIC : FINAL_RUBRIC;
}

export function getTotalMaxScore(stage: "PROPOSAL" | "FINAL_DEFENSE"): number {
  return getRubric(stage).reduce((sum, c) => sum + c.maxScore, 0);
}

export function computeTotal(
  scores: Record<string, number>,
  stage: "PROPOSAL" | "FINAL_DEFENSE"
): number {
  return getRubric(stage).reduce((sum, c) => sum + (scores[c.key] ?? 0), 0);
}
