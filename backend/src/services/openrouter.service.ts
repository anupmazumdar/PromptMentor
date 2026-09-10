import { callFallbackChat, callFallbackCritique, ChatMessage, SandboxCritiqueResult } from './fallbackAI.service';
import { buildTutorSystemPrompt, buildSandboxCritiquePrompt } from '../utils/tutorPrompt';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';

/**
 * Calls OpenRouter chat completion with automatic fallback on rate limit or missing API key.
 */
export async function askTutorAI(
  userQuery: string,
  level: string = 'Basics',
  topic: string = 'General Prompt Engineering',
  history: ChatMessage[] = []
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  const systemPrompt = buildTutorSystemPrompt({ level, topic });
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-4), // keep last 4 context turns for efficiency
    { role: 'user', content: userQuery }
  ];

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    return callFallbackChat(messages, level, topic);
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.FRONTEND_URL || 'https://promptmentor.vercel.app',
        'X-Title': 'PromptMentor AI Tutor'
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        temperature: 0.65,
        max_tokens: 350
      })
    });

    if (response.status === 429) {
      console.warn('⚠️ OpenRouter free-tier rate limit reached (429). Shifting to fallback AI service.');
      return callFallbackChat(messages, level, topic);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`⚠️ OpenRouter API responded with ${response.status}: ${errorText}. Using fallback.`);
      return callFallbackChat(messages, level, topic);
    }

    const data = (await response.json()) as any;
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return callFallbackChat(messages, level, topic);
    }

    return reply.trim();
  } catch (err) {
    console.warn('⚠️ Network failure reaching OpenRouter. Using fallback:', err);
    return callFallbackChat(messages, level, topic);
  }
}

/**
 * Critiques a student's prompt in the Practice Sandbox using OpenRouter.
 */
export async function critiqueStudentPrompt(
  studentPrompt: string,
  level: string = 'Basics',
  topic: string = 'General Prompt Engineering',
  practiceGoal: string = 'Master prompt structure'
): Promise<SandboxCritiqueResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    return callFallbackCritique(level, topic, practiceGoal, studentPrompt);
  }

  const critiqueSystemPrompt = buildSandboxCritiquePrompt({
    level,
    topic,
    practiceGoal,
    studentPrompt
  });

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.FRONTEND_URL || 'https://promptmentor.vercel.app',
        'X-Title': 'PromptMentor Sandbox Evaluator'
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: critiqueSystemPrompt },
          { role: 'user', content: `Please critique this student prompt attempt:\n"""${studentPrompt}"""` }
        ],
        temperature: 0.4,
        max_tokens: 600
      })
    });

    if (!response.ok) {
      console.warn(`⚠️ OpenRouter sandbox critique responded with ${response.status}. Using fallback evaluator.`);
      return callFallbackCritique(level, topic, practiceGoal, studentPrompt);
    }

    const data = (await response.json()) as any;
    const rawContent = data.choices?.[0]?.message?.content?.trim();

    if (!rawContent) {
      return callFallbackCritique(level, topic, practiceGoal, studentPrompt);
    }

    // Clean any markdown code fences around JSON
    const jsonString = rawContent.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    const parsed: SandboxCritiqueResult = JSON.parse(jsonString);

    return {
      score: typeof parsed.score === 'number' ? parsed.score : 75,
      levelFeedback: parsed.levelFeedback || 'Good effort on this prompt exercise.',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Clear objective.'],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : ['Add explicit output constraints.'],
      optimizedPrompt: parsed.optimizedPrompt || studentPrompt,
      socraticQuestion: parsed.socraticQuestion || 'How could you adapt this prompt for a non-technical audience?'
    };
  } catch (err) {
    console.warn('⚠️ Error parsing OpenRouter critique JSON, using fallback evaluator:', err);
    return callFallbackCritique(level, topic, practiceGoal, studentPrompt);
  }
}
