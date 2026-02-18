import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Initialize Supabase clients
// Service role client for admin operations (creating users)
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Anon client for JWT validation (validating user tokens)
const supabaseAuth = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS - restricted to known origins
app.use(
  '/*',
  cors({
    origin: [
      'https://neuralcards.com',
      'https://www.neuralcards.com',
      'https://neural-cards.vercel.app',
    ],
    allowHeaders: ['Content-Type', 'Authorization', 'apikey'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
  })
);

// ====================
// RATE LIMITING
// ====================
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function rateLimit(limit: number, windowMs: number) {
  return async (c: any, next: any) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip') || 'unknown';
    const key = `${ip}:${c.req.path}`;
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (record && now < record.resetAt) {
      if (record.count >= limit) {
        return c.json({ error: 'Too many requests. Please try again later.' }, 429);
      }
      record.count++;
    } else {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    }

    // Clean up expired entries periodically
    if (rateLimitStore.size > 10000) {
      for (const [k, v] of rateLimitStore) {
        if (now > v.resetAt) rateLimitStore.delete(k);
      }
    }

    await next();
  };
}

// Strict rate limit for sensitive endpoints (5 req/min)
app.use('/make-server-f02c4c3b/auth/*', rateLimit(5, 60_000));
app.use('/make-server-f02c4c3b/generate-ai', rateLimit(5, 60_000));
// General rate limit for all other endpoints (60 req/min)
app.use('/make-server-f02c4c3b/*', rateLimit(60, 60_000));

// Health check endpoint
app.get('/make-server-f02c4c3b/health', (c) => {
  return c.json({ status: 'ok' });
});

// ====================
// AUTH ROUTES
// ====================

// Sign up new user
app.post('/make-server-f02c4c3b/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    // Create user with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured
      email_confirm: true,
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    if (!data.user) {
      return c.json({ error: 'User creation failed' }, 400);
    }

    // Initialize user profile in KV store
    const userId = data.user.id;
    const profile = {
      id: userId,
      email,
      name,
      createdAt: new Date().toISOString(),
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: null,
      dailyGoal: 20,
      achievements: [],
      isPremium: false,
    };

    await kv.set(`user:${userId}`, profile);

    // Initialize streak data
    await kv.set(`user:${userId}:streak`, {
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: null,
    });

    // Return user and profile (client will handle sign-in)
    // Don't try to sign in server-side as it creates incompatible JWTs
    return c.json({
      user: {
        id: userId,
        email,
        name,
      },
      profile,
    });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Sign up failed' }, 500);
  }
});

// ====================
// PROGRESS ROUTES
// ====================

// Get user profile
app.get('/make-server-f02c4c3b/user/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      console.log('No access token provided');
      return c.json({ error: 'No authorization token' }, 401);
    }

    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (!user?.id || error) {
      console.log('Auth error:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    let profile = await kv.get(`user:${user.id}`);

    // If profile doesn't exist, create it (for users who signed in without going through signup endpoint)
    if (!profile) {
      console.log('Creating new profile for user:', user.id);
      profile = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        createdAt: new Date().toISOString(),
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: null,
        dailyGoal: 20,
        achievements: [],
        isPremium: false,
      };

      await kv.set(`user:${user.id}`, profile);

      // Initialize streak data
      await kv.set(`user:${user.id}:streak`, {
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: null,
      });
    }

    // Compute admin status server-side (never expose admin email to client)
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || '';
    const isAdmin = !!(
      user.email &&
      adminEmail &&
      user.email.toLowerCase() === adminEmail.toLowerCase()
    );

    return c.json({ profile, isAdmin });
  } catch (error) {
    console.log('Get profile error:', error);
    return c.json({ error: 'Failed to get profile' }, 500);
  }
});

// Update user profile
app.put('/make-server-f02c4c3b/user/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const currentProfile = await kv.get(`user:${user.id}`);

    if (!currentProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Whitelist allowed fields to prevent mass assignment
    const allowedFields: Record<string, any> = {};
    if (
      typeof body.name === 'string' &&
      body.name.trim().length > 0 &&
      body.name.trim().length <= 100
    ) {
      allowedFields.name = body.name.trim();
    }
    if (typeof body.dailyGoal === 'number' && body.dailyGoal >= 1 && body.dailyGoal <= 500) {
      allowedFields.dailyGoal = Math.floor(body.dailyGoal);
    }

    if (Object.keys(allowedFields).length === 0) {
      return c.json({ error: 'No valid fields to update' }, 400);
    }

    const updatedProfile = { ...currentProfile, ...allowedFields };
    await kv.set(`user:${user.id}`, updatedProfile);

    return c.json({ profile: updatedProfile });
  } catch (error) {
    console.log('Update profile error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Record flashcard review with spaced repetition
app.post('/make-server-f02c4c3b/flashcard/review', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { flashcardId, topicId, quality } = await c.req.json();

    if (!flashcardId || !topicId || quality === undefined) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Get or initialize flashcard state
    const stateKey = `user:${user.id}:flashcard:${flashcardId}`;
    let state = await kv.get(stateKey);

    if (!state) {
      // Initialize new card
      state = {
        flashcardId,
        userId: user.id,
        lastReviewed: new Date().toISOString(),
        nextReview: new Date().toISOString(),
        easeFactor: 2.5,
        repetitions: 0,
        interval: 1,
        isBookmarked: false,
      };
    }

    // Calculate next review using SM-2 algorithm
    let { easeFactor, interval, repetitions } = state;
    const qualityNum = quality; // 0-5 rating

    // Update ease factor
    easeFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (5 - qualityNum) * (0.08 + (5 - qualityNum) * 0.02))
    );

    // If quality < 3, reset repetitions
    if (qualityNum < 3) {
      repetitions = 0;
      interval = 1;
    } else {
      repetitions += 1;

      // Calculate new interval
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
    }

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    // Update state
    state = {
      ...state,
      lastReviewed: new Date().toISOString(),
      nextReview: nextReview.toISOString(),
      easeFactor,
      interval,
      repetitions,
    };

    await kv.set(stateKey, state);

    // Update topic progress
    const progressKey = `user:${user.id}:progress:${topicId}`;
    let progress = await kv.get(progressKey);

    if (!progress) {
      progress = {
        userId: user.id,
        topicId,
        completed: false,
        cardsReviewed: 0,
        totalCards: 0,
        lastStudied: new Date().toISOString(),
        masteryLevel: 0,
      };
    }

    progress.cardsReviewed = (progress.cardsReviewed || 0) + 1;
    progress.lastStudied = new Date().toISOString();
    await kv.set(progressKey, progress);

    // Update streak
    await updateStreak(user.id);

    return c.json({
      state,
      progress,
    });
  } catch (error) {
    console.log('Review flashcard error:', error);
    return c.json({ error: 'Failed to record review' }, 500);
  }
});

// OPTIMIZATION: Batch flashcard review endpoint
// Process multiple card reviews in a single request
app.post('/make-server-f02c4c3b/flashcard/review/batch', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { reviews } = await c.req.json();

    if (!Array.isArray(reviews) || reviews.length === 0) {
      return c.json({ error: 'Reviews array required' }, 400);
    }

    const results = [];
    const topicProgressMap = new Map();

    // Process all reviews
    for (const review of reviews) {
      const { flashcardId, topicId, quality } = review;

      if (!flashcardId || !topicId || quality === undefined) {
        continue; // Skip invalid reviews
      }

      // Get or initialize flashcard state
      const stateKey = `user:${user.id}:flashcard:${flashcardId}`;
      let state = await kv.get(stateKey);

      if (!state) {
        state = {
          flashcardId,
          userId: user.id,
          lastReviewed: new Date().toISOString(),
          nextReview: new Date().toISOString(),
          easeFactor: 2.5,
          repetitions: 0,
          interval: 1,
          isBookmarked: false,
        };
      }

      // Calculate next review using SM-2 algorithm
      let { easeFactor, interval, repetitions } = state;
      const qualityNum = quality;

      easeFactor = Math.max(
        1.3,
        easeFactor + (0.1 - (5 - qualityNum) * (0.08 + (5 - qualityNum) * 0.02))
      );

      if (qualityNum < 3) {
        repetitions = 0;
        interval = 1;
      } else {
        repetitions += 1;

        if (repetitions === 1) {
          interval = 1;
        } else if (repetitions === 2) {
          interval = 6;
        } else {
          interval = Math.round(interval * easeFactor);
        }
      }

      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + interval);

      state = {
        ...state,
        lastReviewed: new Date().toISOString(),
        nextReview: nextReview.toISOString(),
        easeFactor,
        interval,
        repetitions,
      };

      await kv.set(stateKey, state);

      // Track topic progress updates
      if (!topicProgressMap.has(topicId)) {
        const progressKey = `user:${user.id}:progress:${topicId}`;
        let progress = await kv.get(progressKey);

        if (!progress) {
          progress = {
            userId: user.id,
            topicId,
            completed: false,
            cardsReviewed: 0,
            totalCards: 0,
            lastStudied: new Date().toISOString(),
            masteryLevel: 0,
          };
        }

        topicProgressMap.set(topicId, progress);
      }

      const progress = topicProgressMap.get(topicId);
      progress.cardsReviewed = (progress.cardsReviewed || 0) + 1;
      progress.lastStudied = new Date().toISOString();

      results.push({ flashcardId, state });
    }

    // Save all topic progress updates
    for (const [topicId, progress] of topicProgressMap.entries()) {
      const progressKey = `user:${user.id}:progress:${topicId}`;
      await kv.set(progressKey, progress);
    }

    // Update streak once for the batch
    await updateStreak(user.id);

    return c.json({
      success: true,
      reviewsProcessed: results.length,
      results,
    });
  } catch (error) {
    console.log('Batch review error:', error);
    return c.json({ error: 'Failed to process batch review' }, 500);
  }
});

// Get topic progress
app.get('/make-server-f02c4c3b/progress/:topicId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const topicId = c.req.param('topicId');
    const progressKey = `user:${user.id}:progress:${topicId}`;
    const progress = await kv.get(progressKey);

    return c.json({ progress: progress || null });
  } catch (error) {
    console.log('Get progress error:', error);
    return c.json({ error: 'Failed to get progress' }, 500);
  }
});

// Get all user progress
app.get('/make-server-f02c4c3b/progress', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const progressData = await kv.getByPrefix(`user:${user.id}:progress:`);

    return c.json({ progress: progressData });
  } catch (error) {
    console.log('Get all progress error:', error);
    return c.json({ error: 'Failed to get progress' }, 500);
  }
});

// Get streak data
app.get('/make-server-f02c4c3b/streak', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const streak = await kv.get(`user:${user.id}:streak`);

    return c.json({
      streak: streak || { currentStreak: 0, longestStreak: 0, lastStudyDate: null },
    });
  } catch (error) {
    console.log('Get streak error:', error);
    return c.json({ error: 'Failed to get streak' }, 500);
  }
});

// Bookmark/unbookmark flashcard
app.post('/make-server-f02c4c3b/flashcard/bookmark', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { flashcardId, isBookmarked } = await c.req.json();

    if (!flashcardId) {
      return c.json({ error: 'Flashcard ID required' }, 400);
    }

    const stateKey = `user:${user.id}:flashcard:${flashcardId}`;
    let state = await kv.get(stateKey);

    if (!state) {
      state = {
        flashcardId,
        userId: user.id,
        lastReviewed: null,
        nextReview: new Date().toISOString(),
        easeFactor: 2.5,
        repetitions: 0,
        interval: 1,
        isBookmarked: false,
      };
    }

    state.isBookmarked = isBookmarked;
    await kv.set(stateKey, state);

    return c.json({ state });
  } catch (error) {
    console.log('Bookmark error:', error);
    return c.json({ error: 'Failed to update bookmark' }, 500);
  }
});

// Get due flashcards for a topic
app.get('/make-server-f02c4c3b/flashcards/due/:topicId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get all flashcard states for this user
    const allStates = await kv.getByPrefix(`user:${user.id}:flashcard:`);

    // Filter for cards that are due for review
    const now = new Date();
    const dueCards = allStates.filter((state) => {
      const nextReview = new Date(state.nextReview);
      return nextReview <= now;
    });

    return c.json({ dueCards });
  } catch (error) {
    console.log('Get due cards error:', error);
    return c.json({ error: 'Failed to get due cards' }, 500);
  }
});

// ====================
// HELPER FUNCTIONS
// ====================

async function updateStreak(userId: string) {
  const streakKey = `user:${userId}:streak`;
  let streak = await kv.get(streakKey);

  if (!streak) {
    streak = {
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: null,
    };
  }

  const today = new Date().toDateString();
  const lastStudy = streak.lastStudyDate ? new Date(streak.lastStudyDate).toDateString() : null;

  if (lastStudy !== today) {
    // Different day
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastStudy === yesterdayStr) {
      // Continue streak
      streak.currentStreak += 1;
    } else if (lastStudy === null) {
      // First study
      streak.currentStreak = 1;
    } else {
      // Streak broken
      streak.currentStreak = 1;
    }

    streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
    streak.lastStudyDate = new Date().toISOString();

    await kv.set(streakKey, streak);

    // Also update user profile
    const userProfile = await kv.get(`user:${userId}`);
    if (userProfile) {
      userProfile.currentStreak = streak.currentStreak;
      userProfile.longestStreak = streak.longestStreak;
      userProfile.lastStudyDate = streak.lastStudyDate;
      await kv.set(`user:${userId}`, userProfile);
    }
  }

  return streak;
}

// ====================
// EMAIL NOTIFICATION PREFERENCES
// ====================

// Get email notification preferences
app.get('/make-server-f02c4c3b/notifications/email', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const prefs = await kv.get(`user:${user.id}:email_prefs`);

    return c.json({
      prefs: prefs || {
        user_id: user.id,
        email_daily_reminder: false,
        email_weekly_digest: false,
        email_streak_alert: false,
        email_achievement: false,
        reminder_time: '19:00',
      },
    });
  } catch (error) {
    console.log('Get email prefs error:', error);
    return c.json({ error: 'Failed to get email preferences' }, 500);
  }
});

// Save email notification preferences
app.put('/make-server-f02c4c3b/notifications/email', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();

    // Validate and whitelist fields
    const prefs = {
      user_id: user.id,
      email_daily_reminder: !!body.email_daily_reminder,
      email_weekly_digest: !!body.email_weekly_digest,
      email_streak_alert: !!body.email_streak_alert,
      email_achievement: !!body.email_achievement,
      email_missed_class: !!body.email_missed_class,
      email_reengagement: !!body.email_reengagement,
      reminder_time:
        typeof body.reminder_time === 'string' && /^\d{2}:\d{2}$/.test(body.reminder_time)
          ? body.reminder_time
          : '19:00',
      updated_at: new Date().toISOString(),
    };

    await kv.set(`user:${user.id}:email_prefs`, prefs);

    return c.json({ prefs });
  } catch (error) {
    console.log('Save email prefs error:', error);
    return c.json({ error: 'Failed to save email preferences' }, 500);
  }
});

// ====================
// AI GENERATION PROXY
// ====================
// Keeps the Groq API key server-side only

app.post('/make-server-f02c4c3b/generate-ai', async (c) => {
  try {
    // Validate user auth
    const authHeader = c.req.header('Authorization');
    if (!authHeader) return c.json({ error: 'Unauthorized' }, 401);

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser(token);
    if (authError || !user) return c.json({ error: 'Invalid token' }, 401);

    // Check admin (only admins can generate content)
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || '';
    if (user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const { systemPrompt, userPrompt, type } = await c.req.json();
    if (!systemPrompt || !userPrompt) {
      return c.json({ error: 'Missing prompts' }, 400);
    }

    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      return c.json({ error: 'AI service not configured' }, 500);
    }

    // Call Groq API server-side
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error('Groq API error:', errText);
      return c.json({ error: 'AI generation failed' }, 500);
    }

    const result = await groqResponse.json();
    const content = result.choices?.[0]?.message?.content || '';

    return c.json({ content, type });
  } catch (error) {
    console.error('AI proxy error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

Deno.serve(app.fetch);
