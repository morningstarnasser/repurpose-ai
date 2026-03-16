export async function sendWelcomeEmail(email: string, name: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const firstName = name?.split(" ")[0] || "there";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Space Grotesk',system-ui,sans-serif;background:#FAFAFA">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    <div style="border:3px solid #000;box-shadow:4px 4px 0 #000;background:#FFD700;padding:32px;margin-bottom:24px">
      <h1 style="margin:0;font-size:28px;font-weight:800;text-transform:uppercase;letter-spacing:-0.02em">
        Welcome to Repurpose<span style="color:#FF6B6B">AI</span>!
      </h1>
    </div>
    <div style="border:3px solid #000;box-shadow:4px 4px 0 #000;background:#fff;padding:32px">
      <p style="font-size:16px;font-weight:600;margin:0 0 16px">Hey ${firstName},</p>
      <p style="font-size:14px;line-height:1.6;color:#333;margin:0 0 16px">
        You're in! RepurposeAI transforms your content into posts for 10 different platforms in seconds.
      </p>
      <p style="font-size:14px;line-height:1.6;color:#333;margin:0 0 24px">
        You get <strong>5 free repurposes per month</strong>. Each one generates optimized content for Twitter/X, LinkedIn, Instagram, TikTok, Email, YouTube, Reddit, Threads, Blog Posts, and Carousel Slides.
      </p>
      <a href="https://repurpose-ai-nine.vercel.app/dashboard/new" style="display:inline-block;border:3px solid #000;box-shadow:4px 4px 0 #000;background:#4ECDC4;padding:14px 28px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;text-decoration:none;color:#000;font-size:14px">
        Create Your First Repurpose
      </a>
      <p style="font-size:12px;color:#999;margin:24px 0 0">
        Questions? Just reply to this email.
      </p>
    </div>
  </div>
</body>
</html>`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: "RepurposeAI <onboarding@resend.dev>",
        to: email,
        subject: `Welcome to RepurposeAI, ${firstName}!`,
        html,
      }),
    });
  } catch {
    // Silent fail - email is non-critical
  }
}
