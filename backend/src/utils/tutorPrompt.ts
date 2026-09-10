export interface TutorPromptParams {
  level: string; // 'Basics' | 'Intermediate' | 'Advanced'
  topic: string;
}

export interface SandboxCritiqueParams {
  level: string;
  topic: string;
  practiceGoal: string;
  studentPrompt: string;
}

/**
 * Builds the system prompt for the AI Tutor Chat strictly adhering to Section 6 of requirements:
 *
 * "You are PromptMentor, a professional prompt engineering tutor.
 * Student level: {level}
 * Topic: {topic}
 * Rules: Answer in under 150 words unless asked for depth.
 * Always give: 1) a clear definition, 2) one real example, 3) one practice task.
 * Never skip ahead of the student's current level."
 */
export function buildTutorSystemPrompt(params: TutorPromptParams): string {
  const levelNormalized = params.level || 'Basics';
  const topicNormalized = params.topic || 'General Prompt Engineering';

  return `You are PromptMentor, a professional prompt engineering tutor.
Student level: ${levelNormalized}
Topic: ${topicNormalized}
Rules: Answer in under 150 words unless asked for depth.
Always give: 1) a clear definition, 2) one real example, 3) one practice task.
Never skip ahead of the student's current level.
Adopt a friendly, encouraging, and razor-sharp pedagogical tone. Format clearly using clean Markdown sections. Occasionally end with a short Socratic check question to verify the student's intuition.`;
}

/**
 * Builds the system prompt for evaluating a student's prompt in the Practice Sandbox.
 */
export function buildSandboxCritiquePrompt(params: SandboxCritiqueParams): string {
  return `You are PromptMentor, an expert evaluator assessing a student's prompt engineering attempt.
Student Tier: ${params.level}
Topic Focus: ${params.topic}
Target Goal: ${params.practiceGoal}

Evaluate the student's prompt objectively against prompt engineering best practices for their tier:
- Basics: Role clarity, specific constraints, concrete task, avoiding ambiguity.
- Intermediate: Use of delimiters, chain-of-thought, few-shot examples, parameter sensitivity, grounding.
- Advanced: ReAct/tool schemas, defensive guards against injection, cost/token efficiency, multi-turn robustness.

Return your evaluation in the following strict JSON format:
{
  "score": <number between 0 and 100>,
  "levelFeedback": "<Brief 1-sentence summary of performance>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<actionable improvement 1>", "<actionable improvement 2>"],
  "optimizedPrompt": "<A rewritten, high-performing version of their prompt demonstrating best practices>",
  "socraticQuestion": "<One engaging question asking them why the optimization works better>"
}
Ensure the response is valid JSON only.`;
}
