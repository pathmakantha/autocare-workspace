import nodemailer, { Transporter } from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

/**
 * Mail only goes out when SMTP credentials are actually present. Without them we log
 * loudly and report `delivered: false` rather than quietly pretending — a reset flow
 * that silently swallows its emails is worse than one that visibly isn't wired up yet.
 */
export const isMailConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      // Port 465 is implicit TLS; 587 upgrades via STARTTLS.
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return cachedTransporter;
}

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface MailResult {
  delivered: boolean;
}

export async function sendMail(message: MailMessage): Promise<MailResult> {
  if (!isMailConfigured) {
    console.warn(
      '[mailer] SMTP is not configured (SMTP_HOST / SMTP_USER / SMTP_PASS) — NOT sending. ' +
        'Set them in .env to enable real delivery.'
    );
    console.warn(`[mailer] would have sent to ${message.to}: ${message.subject}\n${message.text}`);
    return { delivered: false };
  }

  await getTransporter().sendMail({
    from: SMTP_FROM,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
  return { delivered: true };
}

/** The one email this app sends today: a short-lived numeric password-reset code. */
export function buildResetCodeEmail(code: string, ttlMinutes: number): Omit<MailMessage, 'to'> {
  const text = [
    'Your AutoCare password reset code is:',
    '',
    code,
    '',
    `This code expires in ${ttlMinutes} minutes and can only be used once.`,
    "If you didn't ask to reset your password, you can ignore this email — nothing has changed.",
  ].join('\n');

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1a1c1c">
      <h1 style="font-size:20px;margin:0 0 8px">AutoCare password reset</h1>
      <p style="font-size:14px;line-height:20px;margin:0 0 24px;color:#4a4a55">
        Enter this code in the app to choose a new password.
      </p>
      <div style="font-size:34px;letter-spacing:10px;font-weight:700;text-align:center;padding:20px;background:#f3f3f3;border-radius:14px;color:#000666">
        ${code}
      </div>
      <p style="font-size:13px;line-height:19px;margin:24px 0 0;color:#4a4a55">
        This code expires in ${ttlMinutes} minutes and can only be used once.
      </p>
      <p style="font-size:13px;line-height:19px;margin:8px 0 0;color:#8a8a95">
        If you didn't ask to reset your password, you can ignore this email — nothing has changed.
      </p>
    </div>
  `;

  return { subject: 'Your AutoCare password reset code', text, html };
}
