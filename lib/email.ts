import type { Transporter } from "nodemailer";

let _transporter: Transporter | null = null;

async function getTransporter(): Promise<Transporter> {
  if (_transporter) return _transporter;
  const nodemailer = await import("nodemailer");
  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "asmtp.mail.hostpoint.ch",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  return _transporter;
}

const FROM = process.env.SMTP_FROM || "RepurposeAI <info@creativesync.ch>";
const APP_URL = process.env.AUTH_URL || "https://repurpose-ai-nine.vercel.app";

function brutalFooter() {
  return `<div style="text-align:center;margin-top:32px;padding-top:24px;border-top:2px solid #eee">
    <p style="font-size:12px;color:#999;margin:0">
      Repurpose<span style="color:#FF6B6B">AI</span> by <a href="https://creativesync.ch" style="color:#4ECDC4;text-decoration:none;font-weight:600">CreativeSync</a>
    </p>
  </div>`;
}

function emailWrapper(content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Space Grotesk',system-ui,sans-serif;background:#FAFAFA">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    ${content}
    ${brutalFooter()}
  </div>
</body>
</html>`;
}

export async function sendVerificationCode(email: string, code: string) {
  const html = emailWrapper(`
    <div style="border:3px solid #000;box-shadow:4px 4px 0 #000;background:#4ECDC4;padding:32px;margin-bottom:24px">
      <h1 style="margin:0;font-size:28px;font-weight:800;text-transform:uppercase;letter-spacing:-0.02em">
        Your Login Code
      </h1>
    </div>
    <div style="border:3px solid #000;box-shadow:4px 4px 0 #000;background:#fff;padding:32px">
      <p style="font-size:16px;font-weight:600;margin:0 0 16px">Here&rsquo;s your verification code:</p>
      <div style="border:3px solid #000;background:#FFD700;padding:20px;text-align:center;margin:0 0 20px">
        <span style="font-size:36px;font-weight:800;letter-spacing:8px;font-family:monospace">${code}</span>
      </div>
      <p style="font-size:14px;line-height:1.6;color:#333;margin:0 0 8px">
        Enter this code on the login page to sign in. It expires in <strong>10 minutes</strong>.
      </p>
      <p style="font-size:12px;color:#999;margin:0">
        If you didn&rsquo;t request this code, you can safely ignore this email.
      </p>
    </div>
  `);

  const transporter = await getTransporter();
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `${code} - Your RepurposeAI Login Code`,
    html,
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  const firstName = name?.split(" ")[0] || "there";

  const html = emailWrapper(`
    <div style="border:3px solid #000;box-shadow:4px 4px 0 #000;background:#FFD700;padding:32px;margin-bottom:24px">
      <h1 style="margin:0;font-size:28px;font-weight:800;text-transform:uppercase;letter-spacing:-0.02em">
        Welcome to Repurpose<span style="color:#FF6B6B">AI</span>!
      </h1>
    </div>
    <div style="border:3px solid #000;box-shadow:4px 4px 0 #000;background:#fff;padding:32px">
      <p style="font-size:16px;font-weight:600;margin:0 0 16px">Hey ${firstName},</p>
      <p style="font-size:14px;line-height:1.6;color:#333;margin:0 0 16px">
        You&rsquo;re in! RepurposeAI transforms your content into posts for 10 different platforms in seconds.
      </p>
      <p style="font-size:14px;line-height:1.6;color:#333;margin:0 0 24px">
        You get <strong>5 free repurposes per month</strong> plus <strong>3 AI images</strong>. Each repurpose generates optimized content for Twitter/X, LinkedIn, Instagram, TikTok, Email, YouTube, Reddit, Threads, Blog Posts, and Carousel Slides.
      </p>
      <a href="${APP_URL}/dashboard/new" style="display:inline-block;border:3px solid #000;box-shadow:4px 4px 0 #000;background:#4ECDC4;padding:14px 28px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;text-decoration:none;color:#000;font-size:14px">
        Create Your First Repurpose
      </a>
      <p style="font-size:12px;color:#999;margin:24px 0 0">
        Questions? Reply to this email or contact us at info@creativesync.ch
      </p>
    </div>
  `);

  try {
    const transporter = await getTransporter();
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: `Welcome to RepurposeAI, ${firstName}!`,
      html,
    });
  } catch {
    // Silent fail - welcome email is non-critical
  }
}
