/**
 * Send Email Reminders - Supabase Edge Function
 *
 * Triggered via cron job or webhook to send email notifications.
 * Checks user preferences and sends:
 *   - Daily study reminders (if user hasn't studied today)
 *   - Weekly progress digests (on Sundays)
 *   - Streak at risk alerts (if streak > 0 and no study today)
 *   - Achievement notifications (called externally with payload)
 *
 * Requires environment variables:
 *   - RESEND_API_KEY: API key from resend.com
 *   - SUPABASE_URL: Supabase project URL
 *   - SUPABASE_SERVICE_ROLE_KEY: Service role key for admin access
 *   - SITE_URL: Frontend URL (e.g. https://neuralcards.com)
 *   - CRON_SECRET: Shared secret to authorize cron/webhook calls
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://neuralcards.com';
const FROM_EMAIL = 'NeuralCards <noreply@neuralcards.com>';
const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? '';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email send');
    return false;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`Email send failed for ${payload.to}:`, errText);
    return false;
  }

  console.log(`Email sent to ${payload.to}: ${payload.subject}`);
  return true;
}

function dailyReminderHtml(name: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
      <h1 style="font-size: 24px; color: #1a1a1a; margin-bottom: 8px;">📚 Time to Study, ${name}!</h1>
      <p style="color: #555; font-size: 16px; line-height: 1.6;">You haven't studied today yet. Just 5 minutes of flashcard practice can make a big difference for retention!</p>
      <a href="${SITE_URL}/dashboard" style="display: inline-block; margin-top: 20px; padding: 14px 28px; background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">Start Studying →</a>
      <p style="color: #999; font-size: 12px; margin-top: 32px;">You received this because you enabled daily study reminders on <a href="${SITE_URL}" style="color: #8b5cf6;">NeuralCards</a>. <a href="${SITE_URL}/dashboard" style="color: #8b5cf6;">Manage preferences</a></p>
    </div>
  `;
}

function streakAlertHtml(name: string, streakDays: number): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
      <h1 style="font-size: 24px; color: #1a1a1a; margin-bottom: 8px;">🔥 Your ${streakDays}-Day Streak is at Risk!</h1>
      <p style="color: #555; font-size: 16px; line-height: 1.6;">You've built an impressive <strong>${streakDays}-day streak</strong> on NeuralCards. Don't let it break — study today to keep it alive!</p>
      <a href="${SITE_URL}/dashboard" style="display: inline-block; margin-top: 20px; padding: 14px 28px; background: linear-gradient(135deg, #f97316, #ef4444); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">Save My Streak →</a>
      <p style="color: #999; font-size: 12px; margin-top: 32px;">You received this because you enabled streak alerts on <a href="${SITE_URL}" style="color: #8b5cf6;">NeuralCards</a>. <a href="${SITE_URL}/dashboard" style="color: #8b5cf6;">Manage preferences</a></p>
    </div>
  `;
}

function weeklyDigestHtml(
  name: string,
  stats: { cardsLearned: number; streak: number; studyDays: number; xp: number }
): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
      <h1 style="font-size: 24px; color: #1a1a1a; margin-bottom: 8px;">📊 Your Weekly Progress, ${name}</h1>
      <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Here's how your learning week went:</p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
        <div style="background: #f3f4f6; padding: 16px; border-radius: 12px; text-align: center;">
          <div style="font-size: 28px; font-weight: 700; color: #1a1a1a;">${stats.cardsLearned}</div>
          <div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Cards Reviewed</div>
        </div>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 12px; text-align: center;">
          <div style="font-size: 28px; font-weight: 700; color: #1a1a1a;">${stats.streak}</div>
          <div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Day Streak</div>
        </div>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 12px; text-align: center;">
          <div style="font-size: 28px; font-weight: 700; color: #1a1a1a;">${stats.studyDays}</div>
          <div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Study Days</div>
        </div>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 12px; text-align: center;">
          <div style="font-size: 28px; font-weight: 700; color: #1a1a1a;">${stats.xp}</div>
          <div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">XP Earned</div>
        </div>
      </div>
      <a href="${SITE_URL}/dashboard" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">View Full Dashboard →</a>
      <p style="color: #999; font-size: 12px; margin-top: 32px;">You received this because you enabled weekly digests on <a href="${SITE_URL}" style="color: #8b5cf6;">NeuralCards</a>. <a href="${SITE_URL}/dashboard" style="color: #8b5cf6;">Manage preferences</a></p>
    </div>
  `;
}

function missedClassHtml(name: string, daysMissed: number): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
      <h1 style="font-size: 24px; color: #1a1a1a; margin-bottom: 8px;">⚠️ You've Missed ${daysMissed} Days, ${name}!</h1>
      <p style="color: #555; font-size: 16px; line-height: 1.6;">Hey ${name}, we noticed you haven't studied for <strong>${daysMissed} consecutive days</strong>. Consistency is the key to mastering AI & ML concepts!</p>
      <p style="color: #555; font-size: 16px; line-height: 1.6;">Even just <strong>5 minutes</strong> of flashcard practice today can help you retain what you've already learned. Don't let your progress fade away! 💪</p>
      <div style="background: #fef3cd; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #92400e; font-size: 14px; margin: 0;"><strong>Quick tip:</strong> Studies show that reviewing material within 3 days of learning it dramatically improves long-term retention.</p>
      </div>
      <a href="${SITE_URL}/dashboard" style="display: inline-block; margin-top: 20px; padding: 14px 28px; background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">Get Back on Track →</a>
      <p style="color: #999; font-size: 12px; margin-top: 32px;">You received this because you enabled missed class alerts on <a href="${SITE_URL}" style="color: #8b5cf6;">NeuralCards</a>. <a href="${SITE_URL}/dashboard" style="color: #8b5cf6;">Manage preferences</a></p>
    </div>
  `;
}

function reengagementHtml(name: string, daysMissed: number, cardsLearned: number, xp: number): string {
  const messages = [
    `We haven't seen you in ${daysMissed} days and honestly... NeuralCards feels a little empty without you. 🥺`,
    `Your flashcards have been waiting patiently for ${daysMissed} days. They miss being flipped by you! 💜`,
    `It's been ${daysMissed} days since your last session. Your AI learning journey is still right where you left it, waiting for you to come back.`,
  ];
  const emotionalMsg = messages[daysMissed % messages.length];

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; text-align: center;">
      <div style="font-size: 72px; margin-bottom: 16px;">💜</div>
      <h1 style="font-size: 28px; color: #1a1a1a; margin-bottom: 12px;">We Miss You, ${name}! 🥺</h1>
      <p style="color: #555; font-size: 17px; line-height: 1.7; margin-bottom: 24px;">${emotionalMsg}</p>

      <div style="background: linear-gradient(135deg, #f3e8ff, #fce7f3); padding: 24px; border-radius: 16px; margin: 24px 0; text-align: left;">
        <h3 style="color: #6b21a8; font-size: 16px; margin: 0 0 16px 0;">Your Journey So Far 🌟</h3>
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 100px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #7c3aed;">${cardsLearned}</div>
            <div style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Cards Learned</div>
          </div>
          <div style="flex: 1; min-width: 100px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #db2777;">${xp}</div>
            <div style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px;">XP Earned</div>
          </div>
        </div>
      </div>

      <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">Every expert was once a beginner. Your knowledge is still there — it just needs a little refresh. Come back and pick up where you left off! 🚀</p>

      <a href="${SITE_URL}/dashboard" style="display: inline-block; padding: 16px 36px; background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; text-decoration: none; border-radius: 14px; font-weight: 700; font-size: 18px; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);">Come Back & Learn 💜</a>

      <p style="color: #aaa; font-size: 13px; margin-top: 28px; font-style: italic;">— The NeuralCards Team (who genuinely cares about your learning!) 🧠</p>
      <p style="color: #999; font-size: 12px; margin-top: 16px;">You received this because you enabled re-engagement notifications on <a href="${SITE_URL}" style="color: #8b5cf6;">NeuralCards</a>. <a href="${SITE_URL}/dashboard" style="color: #8b5cf6;">Manage preferences</a></p>
    </div>
  `;
}

function achievementHtml(name: string, achievementTitle: string, achievementIcon: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; text-align: center;">
      <div style="font-size: 64px; margin-bottom: 16px;">${achievementIcon}</div>
      <h1 style="font-size: 24px; color: #1a1a1a; margin-bottom: 8px;">🎉 Achievement Unlocked!</h1>
      <p style="color: #555; font-size: 18px; line-height: 1.6;">Congratulations ${name}, you earned <strong>${achievementTitle}</strong>!</p>
      <a href="${SITE_URL}/dashboard" style="display: inline-block; margin-top: 20px; padding: 14px 28px; background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">View Your Achievements →</a>
      <p style="color: #999; font-size: 12px; margin-top: 32px;">You received this because you enabled achievement notifications on <a href="${SITE_URL}" style="color: #8b5cf6;">NeuralCards</a>. <a href="${SITE_URL}/dashboard" style="color: #8b5cf6;">Manage preferences</a></p>
    </div>
  `;
}

Deno.serve(async (req) => {
  try {
    // Authenticate cron/webhook caller
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');
    if (!CRON_SECRET || token !== CRON_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Support achievement email via POST body
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body.type === 'achievement' && body.userId && body.achievementTitle && body.achievementIcon) {
          const { data: userData } = await supabase.auth.admin.getUserById(body.userId);
          if (userData?.user?.email) {
            const { data: prefs } = await supabase
              .from('notification_preferences')
              .select('email_achievement')
              .eq('user_id', body.userId)
              .single();
            if (prefs?.email_achievement) {
              const name = userData.user.user_metadata?.name || userData.user.email.split('@')[0];
              await sendEmail({
                to: userData.user.email,
                subject: `🎉 Achievement Unlocked: ${body.achievementTitle}`,
                html: achievementHtml(name, body.achievementTitle, body.achievementIcon),
              });
              return new Response(JSON.stringify({ message: 'Achievement email sent' }), { headers: { 'Content-Type': 'application/json' } });
            }
          }
          return new Response(JSON.stringify({ message: 'Achievement email skipped (pref disabled or user not found)' }), { headers: { 'Content-Type': 'application/json' } });
        }
      } catch {
        // Not a valid POST body, fall through to cron logic
      }
    }

    const today = new Date().toISOString().split('T')[0];
    const dayOfWeek = new Date().getDay(); // 0 = Sunday
    let emailsSent = 0;

    // Fetch all users who have any email notifications enabled
    const { data: prefRows, error: prefError } = await supabase
      .from('notification_preferences')
      .select('*')
      .or(
        'email_daily_reminder.eq.true,email_weekly_digest.eq.true,email_streak_alert.eq.true,email_achievement.eq.true,email_missed_class.eq.true,email_reengagement.eq.true'
      );

    if (prefError) {
      console.error('Failed to fetch notification preferences:', prefError);
      return new Response(JSON.stringify({ error: prefError.message }), { status: 500 });
    }

    if (!prefRows || prefRows.length === 0) {
      return new Response(JSON.stringify({ message: 'No users with email notifications enabled', emailsSent: 0 }));
    }

    for (const pref of prefRows) {
      // Get user info
      const { data: userData } = await supabase.auth.admin.getUserById(pref.user_id);
      if (!userData?.user?.email) continue;

      const email = userData.user.email;
      const name = userData.user.user_metadata?.name || email.split('@')[0];

      // Get user stats
      const { data: userStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', pref.user_id)
        .single();

      const lastStudyDate = userStats?.last_study_date
        ? new Date(userStats.last_study_date).toISOString().split('T')[0]
        : null;
      const hasStudiedToday = lastStudyDate === today;
      const currentStreak = userStats?.current_streak || 0;

      // 1. Daily study reminder
      if (pref.email_daily_reminder && !hasStudiedToday) {
        const sent = await sendEmail({
          to: email,
          subject: '📚 Time to Study! Your streak is waiting',
          html: dailyReminderHtml(name),
        });
        if (sent) emailsSent++;
      }

      // 2. Streak at risk alert
      if (pref.email_streak_alert && !hasStudiedToday && currentStreak > 0) {
        const sent = await sendEmail({
          to: email,
          subject: `🔥 Your ${currentStreak}-day streak is at risk!`,
          html: streakAlertHtml(name, currentStreak),
        });
        if (sent) emailsSent++;
      }

      // 3. Weekly digest (send on Sundays)
      if (pref.email_weekly_digest && dayOfWeek === 0) {
        // Count study sessions this week
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];

        const { data: sessions } = await supabase
          .from('study_sessions')
          .select('studied_on')
          .eq('user_id', pref.user_id)
          .gte('studied_on', weekAgoStr);

        const studyDays = sessions ? new Set(sessions.map((s) => s.studied_on)).size : 0;

        const sent = await sendEmail({
          to: email,
          subject: '📊 Your Weekly Learning Report',
          html: weeklyDigestHtml(name, {
            cardsLearned: studyDays > 0 ? Math.round((userStats?.cards_learned_total || 0) / Math.max(1, studyDays)) * studyDays : 0,
            streak: currentStreak,
            studyDays,
            xp: studyDays > 0 ? Math.round((userStats?.xp || 0) / Math.max(1, studyDays)) * studyDays : 0,
          }),
        });
        if (sent) emailsSent++;
      }

      // 4. Missed class alert (3 consecutive days without studying)
      if (pref.email_missed_class && lastStudyDate) {
        const lastStudy = new Date(lastStudyDate);
        const nowDate = new Date(today);
        const daysSinceStudy = Math.floor((nowDate.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));

        // Send on exactly day 3 to avoid repeated emails every day
        if (daysSinceStudy === 3) {
          const sent = await sendEmail({
            to: email,
            subject: `⚠️ You've missed 3 days of studying, ${name}!`,
            html: missedClassHtml(name, 3),
          });
          if (sent) emailsSent++;
        }
      }

      // 5. Emotional re-engagement (10-20 days of inactivity)
      if (pref.email_reengagement && lastStudyDate) {
        const lastStudy = new Date(lastStudyDate);
        const nowDate = new Date(today);
        const daysSinceStudy = Math.floor((nowDate.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));

        // Send emotional re-engagement emails at day 10, 15, and 20
        if (daysSinceStudy === 10 || daysSinceStudy === 15 || daysSinceStudy === 20) {
          const cardsLearned = userStats?.cards_learned_total || 0;
          const xp = userStats?.xp || 0;
          const sent = await sendEmail({
            to: email,
            subject: `💜 NeuralCards misses you, ${name}! Come back?`,
            html: reengagementHtml(name, daysSinceStudy, cardsLearned, xp),
          });
          if (sent) emailsSent++;
        }
      }
    }

    return new Response(
      JSON.stringify({ message: `Processed ${prefRows.length} users, sent ${emailsSent} emails` }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Email reminder function error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
});
