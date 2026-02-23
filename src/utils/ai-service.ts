/**
 * AI Service — Unified client for all user-facing AI features
 *
 * Routes through the /ai-assist edge function endpoint which is open
 * to any authenticated user (rate-limited to 10 req/min).
 */

import { supabase } from './supabase/client';
import { projectId, publicAnonKey } from './supabase/info';
import { log } from './logger';

const AI_ENDPOINT = `https://${projectId}.supabase.co/functions/v1/make-server-f02c4c3b/ai-assist`;

async function getAuthToken(): Promise<string | null> {
  const { data: refreshed } = await supabase.auth.refreshSession();
  if (refreshed?.session?.access_token) return refreshed.session.access_token;

  const { data: current } = await supabase.auth.getSession();
  return current?.session?.access_token ?? null;
}

interface AIResponse<T = string> {
  data: T | null;
  error: string | null;
}

/**
 * Call the user-facing AI endpoint
 */
async function callAI<T = string>(
  type: string,
  payload: Record<string, unknown>
): Promise<AIResponse<T>> {
  const token = await getAuthToken();
  if (!token) {
    return { data: null, error: 'Please log in to use AI features.' };
  }

  try {
    const response = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: {
        apikey: publicAnonKey,
        Authorization: `Bearer ${publicAnonKey}`,
        'x-user-token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, ...payload }),
    });

    // Read body as text ONCE to avoid "body stream already read" errors
    const rawText = await response.text();

    if (!response.ok) {
      let errMsg = rawText;
      try {
        const errJson = JSON.parse(rawText);
        errMsg = errJson.error || JSON.stringify(errJson);
      } catch {
        // rawText is already the error message
      }
      return { data: null, error: `AI error (${response.status}): ${errMsg}` };
    }

    const result = JSON.parse(rawText);
    return { data: result.content as T, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error('AI service error:', msg);
    return { data: null, error: `AI request failed: ${msg}` };
  }
}

// ── Quiz Generation ───────────────────────────────────────

export interface AIQuizQuestion {
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  correctAnswer: string;
  explanation: string;
  wrongAnswerExplanations: Record<string, string>;
  difficulty: 'easy' | 'medium' | 'hard';
}

export async function generateAIQuiz(
  topicTitle: string,
  flashcards: { front_content: string | null; back_content: string | null }[],
  count: number = 5
): Promise<AIResponse<AIQuizQuestion[]>> {
  // Send card summaries (not full content) to keep payload small
  const cardSummaries = flashcards.slice(0, 20).map((c) => ({
    q: c.front_content?.substring(0, 100) || '',
    a: c.back_content?.substring(0, 150) || '',
  }));

  const response = await callAI<string>('quiz', {
    topicTitle,
    cards: cardSummaries,
    count,
  });

  if (response.error || !response.data) {
    return { data: null, error: response.error || 'No quiz data returned' };
  }

  // Parse JSON from AI response
  try {
    const text = response.data;
    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']');
    const jsonStr = startIdx !== -1 && endIdx !== -1 ? text.substring(startIdx, endIdx + 1) : text;
    const questions: AIQuizQuestion[] = JSON.parse(jsonStr);
    return { data: questions, error: null };
  } catch {
    log.error('AI quiz parse failed:', response.data);
    return { data: null, error: 'AI returned invalid quiz format. Try again.' };
  }
}

// ── Wrong Answer Explanation ──────────────────────────────

export async function explainWrongAnswer(
  question: string,
  userAnswer: string,
  correctAnswer: string,
  topicTitle: string
): Promise<AIResponse<string>> {
  return callAI<string>('explain-wrong', {
    question,
    userAnswer,
    correctAnswer,
    topicTitle,
  });
}

// ── Conversational Tutor ──────────────────────────────────

export interface TutorMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendTutorMessage(
  message: string,
  conversationHistory: TutorMessage[],
  context: { topicTitle: string; cardFront?: string; cardBack?: string }
): Promise<AIResponse<string>> {
  return callAI<string>('tutor', {
    message,
    history: conversationHistory.slice(-8), // Keep last 8 messages for context
    context,
  });
}

// ── Flashcard Enrichment ──────────────────────────────────

export interface EnrichedCardData {
  realWorldExample: string;
  pitfalls: string[];
  codeExample?: string;
  memoryTip: string;
}

export async function enrichFlashcard(
  front: string,
  back: string,
  topicTitle: string
): Promise<AIResponse<EnrichedCardData>> {
  const response = await callAI<string>('enrich', {
    front,
    back,
    topicTitle,
  });

  if (response.error || !response.data) {
    return { data: null, error: response.error || 'No enrichment data' };
  }

  try {
    const text = response.data;
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    const jsonStr = startIdx !== -1 && endIdx !== -1 ? text.substring(startIdx, endIdx + 1) : text;
    const enriched: EnrichedCardData = JSON.parse(jsonStr);
    return { data: enriched, error: null };
  } catch {
    log.error('Enrichment parse failed');
    return { data: null, error: 'AI returned invalid format.' };
  }
}

// ── Study Insights ────────────────────────────────────────

export async function generateStudyInsights(
  statsPayload: Record<string, unknown>
): Promise<AIResponse<string>> {
  return callAI<string>('insights', statsPayload);
}
