import { Resend } from "resend";

const from = process.env.FROM_EMAIL ?? "academy@tradeverse.io";

let resendClient: Resend | null = null;

/** Lazy init so `next build` does not require RESEND_API_KEY at import time. */
function getResend(): Resend {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  resendClient ??= new Resend(key);
  return resendClient;
}

type WeeklyStats = { xpEarned: number; lessonsCompleted: number; leaguePosition: number; recommendations: string[] };

function template(title: string, body: string) {
  return `
  <div style="background:#0F172A;padding:24px;color:#E2E8F0;font-family:Inter,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#1E293B;border:1px solid #334155;border-radius:16px;padding:24px;">
      <h1 style="color:#F7C325;margin:0 0 12px;">Tradeverse Academy</h1>
      <h2 style="margin:0 0 12px;">${title}</h2>
      ${body}
      <p style="margin-top:22px;font-size:12px;color:#94A3B8;">If you no longer want these emails, you can unsubscribe in settings.</p>
    </div>
  </div>`;
}

export async function sendWelcomeEmail(to: string, name: string) {
  return getResend().emails.send({
    from,
    to,
    subject: "Welcome to Tradeverse Academy 🎓",
    html: template("Welcome aboard", `<p>Hi ${name}, your trading journey starts now.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/learn/what-is-a-candlestick" style="color:#F7C325">Start your first lesson</a></p>`),
  });
}

export async function sendStreakReminderEmail(to: string, name: string, streak: number) {
  return getResend().emails.send({
    from,
    to,
    subject: `Don't break your ${streak}-day streak 🔥`,
    html: template("Keep your momentum", `<p>Hi ${name}, you are on a ${streak}-day streak.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="color:#F7C325">Keep Your Streak</a></p>`),
  });
}

export async function sendWeeklyDigestEmail(to: string, name: string, stats: WeeklyStats) {
  return getResend().emails.send({
    from,
    to,
    subject: "Your trading progress this week 📈",
    html: template("Weekly Digest", `<p>${name}, you earned ${stats.xpEarned} XP and completed ${stats.lessonsCompleted} lessons.</p><p>League position: #${stats.leaguePosition}</p><ul>${stats.recommendations.map((r) => `<li>${r}</li>`).join("")}</ul>`),
  });
}

export async function sendLevelUpEmail(to: string, name: string, newLevel: number, title: string) {
  return getResend().emails.send({
    from,
    to,
    subject: `You reached Level ${newLevel}: ${title}! ⭐`,
    html: template("Level up!", `<p>${name}, congrats on reaching Level ${newLevel}.</p><p>Your new title is <strong>${title}</strong>.</p>`),
  });
}
