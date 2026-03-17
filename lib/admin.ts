import { sql } from "./db";

const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL || "nasser.duhok@gmail.com",
  "ali.nasser@bluewin.ch",
].map(e => e.toLowerCase());

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function getAdminStats() {
  const [users, repurposes, blogPosts, recentUsers, recentRepurposes, topUsers] = await Promise.all([
    sql`SELECT COUNT(*) as total, COUNT(CASE WHEN plan != 'free' THEN 1 END) as pro, COUNT(CASE WHEN plan = 'free' THEN 1 END) as free, SUM(repurpose_count) as total_repurposes FROM users`,
    sql`SELECT COUNT(*) as total, COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as today, COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as week FROM repurposes`,
    sql`SELECT COUNT(*) as total FROM blog_posts`,
    sql`SELECT email, name, image, plan, repurpose_count, created_at FROM users ORDER BY created_at DESC LIMIT 10`,
    sql`SELECT id, title, user_email, content_type, created_at FROM repurposes ORDER BY created_at DESC LIMIT 10`,
    sql`SELECT email, name, repurpose_count FROM users ORDER BY repurpose_count DESC LIMIT 5`,
  ]);

  return {
    users: { total: Number(users[0].total), pro: Number(users[0].pro), free: Number(users[0].free), totalRepurposes: Number(users[0].total_repurposes || 0) },
    repurposes: { total: Number(repurposes[0].total), today: Number(repurposes[0].today), week: Number(repurposes[0].week) },
    blogPosts: Number(blogPosts[0].total),
    recentUsers,
    recentRepurposes,
    topUsers,
  };
}

export async function getAllUsers(page = 1, limit = 20, search = "") {
  const offset = (page - 1) * limit;
  if (search) {
    const q = `%${search}%`;
    const [rows, count] = await Promise.all([
      sql`SELECT * FROM users WHERE email ILIKE ${q} OR name ILIKE ${q} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      sql`SELECT COUNT(*) as total FROM users WHERE email ILIKE ${q} OR name ILIKE ${q}`,
    ]);
    return { users: rows, total: Number(count[0].total), page, totalPages: Math.ceil(Number(count[0].total) / limit) };
  }
  const [rows, count] = await Promise.all([
    sql`SELECT * FROM users ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
    sql`SELECT COUNT(*) as total FROM users`,
  ]);
  return { users: rows, total: Number(count[0].total), page, totalPages: Math.ceil(Number(count[0].total) / limit) };
}

export async function updateUserPlan(email: string, plan: string) {
  await sql`UPDATE users SET plan = ${plan} WHERE email = ${email}`;
}

export async function resetUserCount(email: string) {
  await sql`UPDATE users SET repurpose_count = 0 WHERE email = ${email}`;
}

export async function deleteUser(email: string) {
  await sql`DELETE FROM repurposes WHERE user_email = ${email}`;
  await sql`DELETE FROM users WHERE email = ${email}`;
}

export async function getAllRepurposes(page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const [rows, count] = await Promise.all([
    sql`SELECT r.*, u.name as user_name FROM repurposes r LEFT JOIN users u ON r.user_email = u.email ORDER BY r.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
    sql`SELECT COUNT(*) as total FROM repurposes`,
  ]);
  return { repurposes: rows, total: Number(count[0].total), page, totalPages: Math.ceil(Number(count[0].total) / limit) };
}

export async function deleteRepurpose(id: string) {
  await sql`DELETE FROM repurposes WHERE id = ${id}`;
}

export async function deleteBlogPost(slug: string) {
  await sql`DELETE FROM blog_posts WHERE slug = ${slug}`;
}

export async function getBillingStats() {
  const [subs, revenue] = await Promise.all([
    sql`SELECT COUNT(*) as active FROM users WHERE subscription_status = 'active'`,
    sql`SELECT COUNT(*) as total_pro FROM users WHERE plan != 'free'`,
  ]);

  // Try Stripe API for real revenue data
  let mrr = 0;
  let totalRevenue = 0;
  let recentCharges: Array<{ amount: number; email: string; date: string }> = [];

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const subscriptions = await stripe.subscriptions.list({ status: "active", limit: 100 });
    mrr = subscriptions.data.reduce((sum, sub) => sum + (sub.items.data[0]?.price?.unit_amount || 0), 0) / 100;

    const charges = await stripe.charges.list({ limit: 10 });
    recentCharges = charges.data.map((c) => ({
      amount: c.amount / 100,
      email: c.billing_details?.email || "unknown",
      date: new Date(c.created * 1000).toISOString(),
    }));

    totalRevenue = charges.data.filter((c) => c.paid).reduce((sum, c) => sum + c.amount, 0) / 100;
  } catch {
    // Stripe not configured yet, skip revenue data
  }

  return {
    activeSubs: Number(subs[0].active),
    totalPro: Number(revenue[0].total_pro),
    mrr,
    totalRevenue,
    recentCharges,
  };
}

export async function getAnalytics() {
  const [platformStats, dailyStats] = await Promise.all([
    sql`SELECT output->>'platform' as platform, COUNT(*) as count
        FROM repurposes, jsonb_array_elements(outputs) as output
        GROUP BY output->>'platform' ORDER BY count DESC`,
    sql`SELECT DATE(created_at) as day, COUNT(*) as count
        FROM repurposes WHERE created_at > NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at) ORDER BY day`,
  ]);

  return { platformStats, dailyStats };
}
