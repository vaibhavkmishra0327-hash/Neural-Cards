import { Database } from '../types/database.types';

type Flashcard = Database['public']['Tables']['flashcards']['Row'];

export interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: MCQOption[];
  correctAnswer: string;
  explanation: string;
  cardType: string;
}

export interface FillBlankQuestion {
  id: string;
  sentence: string;
  blankedWord: string;
  hint: string;
  fullAnswer: string;
  cardType: string;
}

export type QuizMode = 'mcq' | 'fill-blank' | 'flashcard';

/**
 * Generate MCQ questions from flashcards
 * Uses other cards' answers as distractors
 */
export function generateMCQQuestions(flashcards: Flashcard[], count?: number): MCQQuestion[] {
  if (flashcards.length < 2) return [];

  const limit = count ?? flashcards.length;
  const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(limit, shuffled.length));

  return selected.map((card, _idx) => {
    // Correct answer
    const correctText = card.back_content?.split('\n')[0]?.trim() || card.back_content || '';

    // Generate distractors from other cards
    const otherCards = flashcards.filter((c) => c.id !== card.id);
    const distractorPool = otherCards
      .map((c) => c.back_content?.split('\n')[0]?.trim() || c.back_content || '')
      .filter((t) => t !== correctText && t.length > 0);

    // Shuffle and pick 3 distractors
    const distractors = distractorPool.sort(() => Math.random() - 0.5).slice(0, 3);

    // If not enough distractors, generate placeholder ones
    while (distractors.length < 3) {
      distractors.push(`Option ${distractors.length + 2}`);
    }

    // Build options and shuffle
    const options: MCQOption[] = [
      { id: 'correct', text: truncateText(correctText, 120), isCorrect: true },
      ...distractors.map((d, i) => ({
        id: `distractor-${i}`,
        text: truncateText(d, 120),
        isCorrect: false,
      })),
    ].sort(() => Math.random() - 0.5);

    // Re-assign ids after shuffle
    const finalOptions = options.map((opt, i) => ({
      ...opt,
      id: String.fromCharCode(65 + i), // A, B, C, D
    }));

    return {
      id: card.id,
      question: card.front_content || '',
      options: finalOptions,
      correctAnswer: finalOptions.find((o) => o.isCorrect)?.id || 'A',
      explanation: card.back_content || '',
      cardType: card.card_type || 'concept',
    };
  });
}

/**
 * Generate fill-in-the-blank questions from flashcards
 * Extracts a key term from the answer and blanks it
 */
export function generateFillBlankQuestions(
  flashcards: Flashcard[],
  count?: number
): FillBlankQuestion[] {
  if (flashcards.length === 0) return [];

  const limit = count ?? flashcards.length;
  const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(limit, shuffled.length));

  return selected
    .map((card) => {
      const answer = card.back_content || '';
      const firstLine = answer.split('\n')[0]?.trim() || answer;

      // Extract a key word to blank (3+ char word)
      const words = firstLine.split(/\s+/).filter((w) => w.length >= 3);
      if (words.length === 0) return null;

      // Pick a significant word (prefer longer, non-common words)
      const commonWords = new Set([
        'the',
        'and',
        'for',
        'are',
        'but',
        'not',
        'you',
        'all',
        'can',
        'has',
        'her',
        'was',
        'one',
        'our',
        'out',
        'with',
        'that',
        'this',
        'from',
        'they',
        'been',
        'have',
        'will',
        'each',
        'make',
        'like',
        'used',
        'into',
        'when',
        'which',
        'their',
        'there',
        'these',
        'than',
        'them',
        'then',
        'what',
        'about',
        'would',
        'other',
        'more',
        'some',
        'very',
        'also',
      ]);

      const significantWords = words.filter(
        (w) => !commonWords.has(w.toLowerCase()) && w.length >= 4
      );
      const targetWord =
        significantWords.length > 0
          ? significantWords[Math.floor(Math.random() * significantWords.length)]
          : words[Math.floor(Math.random() * words.length)];

      const blankedSentence = firstLine.replace(targetWord, '_____');
      const cleanWord = targetWord.replace(/[.,;:!?()]/g, '');

      return {
        id: card.id,
        sentence: blankedSentence,
        blankedWord: cleanWord,
        hint: `Related to: ${card.front_content?.substring(0, 60) || 'this topic'}`,
        fullAnswer: firstLine,
        cardType: card.card_type || 'concept',
      };
    })
    .filter(Boolean) as FillBlankQuestion[];
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Calculate quiz score
 */
export function calculateScore(correct: number, total: number): { score: number; grade: string } {
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  let grade: string;

  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 60) grade = 'C';
  else if (score >= 50) grade = 'D';
  else grade = 'F';

  return { score, grade };
}
