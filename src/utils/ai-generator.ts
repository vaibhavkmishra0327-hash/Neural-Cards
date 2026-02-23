import { supabase } from './supabase/client';
import { projectId, publicAnonKey } from './supabase/info';
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
      systemPrompt: 'You are a JSON generator.',
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
      `,
    };
  } else {
    return {
      systemPrompt: 'You are a professional Tech Blogger.',
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
      `,
    };
  }
}

export const generateContentWithGroq = async (
  topicName: string,
  type: 'flashcard' | 'blog' = 'flashcard'
): Promise<{ data: any; error: string | null }> => {
  log.info(`Requesting AI content for: ${topicName} [Type: ${type}]`);

  const { systemPrompt, userPrompt } = buildPrompts(topicName, type);

  try {
    // Get a FRESH user session — try refresh first, then validate with getUser()
    let token: string | undefined;

    // Step 1: Try refreshing the session to get a fresh access token
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshed?.session?.access_token) {
      token = refreshed.session.access_token;
      log.info('Using freshly refreshed access token');
    } else {
      log.warn('Session refresh failed:', refreshError?.message || 'no session');
    }

    // Step 2: If refresh failed, try getting current session
    if (!token) {
      const { data: current } = await supabase.auth.getSession();
      token = current?.session?.access_token;
    }

    // Step 3: Validate the token is actually usable (not expired)
    if (token) {
      const { data: userData, error: userError } = await supabase.auth.getUser(token);
      if (userError || !userData?.user) {
        log.warn('Token validation failed, attempting full re-auth check:', userError?.message);
        // Token is expired/invalid — try one more refresh
        const { data: retryRefresh } = await supabase.auth.refreshSession();
        token = retryRefresh?.session?.access_token;
      }
    }

    if (!token) {
      const msg = 'Your session has expired. Please log out and log back in.';
      log.error(msg);
      return { data: null, error: msg };
    }

    // Call Edge Function via raw fetch
    //   Authorization: Bearer <anon_key> → passes Supabase API gateway check
    //   x-user-token → carries actual user JWT for the function's own auth
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-f02c4c3b/generate-ai`,
      {
        method: 'POST',
        headers: {
          apikey: publicAnonKey,
          Authorization: `Bearer ${publicAnonKey}`,
          'x-user-token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ systemPrompt, userPrompt, type }),
      }
    );

    if (!response.ok) {
      let errText = '';
      try {
        const errJson = await response.json();
        errText = errJson.error || JSON.stringify(errJson);
      } catch {
        errText = await response.text();
      }
      const msg = `Edge Function error (${response.status}): ${errText}`;
      log.error(msg);
      console.error('AI Generation Error:', msg);
      return { data: null, error: msg };
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
        return { data: json, error: null };
      } catch {
        log.error('JSON parse failed. Raw response:', text.substring(0, 200));
        return { data: null, error: 'AI returned invalid JSON. Try again.' };
      }
    } else {
      log.info('Blog content generated successfully');
      return { data: text, error: null };
    }
  } catch (error) {
    const msg = `AI generation failed: ${error instanceof Error ? error.message : String(error)}`;
    log.error(msg);
    console.error(msg);
    return { data: null, error: msg };
  }
};
