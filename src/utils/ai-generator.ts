import { supabase } from './supabase/client';
import { projectId } from './supabase/info';
import { log } from './logger';

/**
 * AI Content Generator
 * 
 * Security: Groq API key is NOT exposed to the browser.
 * All AI calls are proxied through Supabase Edge Functions.
 * The Groq SDK + API key live server-side only.
 */

// Build prompts based on content type
function buildPrompts(topicName: string, type: 'flashcard' | 'blog') {
  if (type === 'flashcard') {
    return {
      systemPrompt: "You are a JSON generator.",
      userPrompt: `
        You are an expert teacher. Create 5 educational flashcards about "${topicName}" for a beginner level student.
        
        STRICT REQUIREMENTS:
        1. Return ONLY a raw JSON array.
        2. No Markdown formatting (do NOT use \`\`\`json).
        3. No conversational text.
        
        JSON Format:
        [
          {
            "front": "Question",
            "back": "Answer",
            "type": "concept",
            "code": null
          }
        ]
      `
    };
  } else {
    return {
      systemPrompt: "You are a professional Tech Blogger.",
      userPrompt: `
        Write a comprehensive, engaging, and SEO-friendly blog post about "${topicName}".
        
        Structure required (use Markdown):
        1. Title (H1) - Catchy title related to ${topicName}
        2. Introduction - Hook the reader, explain 'Why this matters'.
        3. Core Concepts (H2) - Explain the theory simply.
        4. Code Examples (Code Blocks) - Use Python/JS examples where applicable.
        5. Real-world Use Cases - Where is this used in industry?
        6. Conclusion.

        Return ONLY the Markdown content. Do not wrap in JSON. Start directly with the # Title.
      `
    };
  }
}

export const generateContentWithGroq = async (topicName: string, type: 'flashcard' | 'blog' = 'flashcard') => {
  log.info(`Requesting AI content for: ${topicName} [Type: ${type}]`);

  const { systemPrompt, userPrompt } = buildPrompts(topicName, type);

  try {
    // Get user session for auth header
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      log.error('No auth session found for AI generation');
      return type === 'flashcard' ? [] : '';
    }

    // Call Edge Function (API key stays server-side)
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-f02c4c3b/generate-ai`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ systemPrompt, userPrompt, type }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      log.error('AI generation edge function error:', errText);
      return type === 'flashcard' ? [] : '';
    }

    const data = await response.json();
    const text = data?.content || '';
    log.info(`AI Response received, length: ${text.length}`);

    if (type === 'flashcard') {
      const startIndex = text.indexOf('[');
      const endIndex = text.lastIndexOf(']');

      let cleanText = text;
      if (startIndex !== -1 && endIndex !== -1) {
        cleanText = text.substring(startIndex, endIndex + 1);
      }

      try {
        const json = JSON.parse(cleanText);
        log.info(`Cards generated: ${json.length}`);
        return json;
      } catch {
        log.error('JSON parse failed for AI flashcard response');
        return [];
      }
    } else {
      log.info('Blog content generated successfully');
      return text;
    }

  } catch (error) {
    log.error('AI generation failed:', error);
    return type === 'flashcard' ? [] : '';
  }
};