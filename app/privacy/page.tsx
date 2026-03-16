export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <nav className="bg-white border-b-3 border-black shadow-[0_4px_0_#000]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="text-xl font-bold uppercase tracking-tight">
            Repurpose<span className="text-secondary">AI</span>
          </a>
          <a href="/" className="text-sm font-bold uppercase tracking-wider hover:text-secondary transition-colors">&larr; Home</a>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-bold uppercase mb-8">Privacy Policy</h1>
        <div className="brutal-card p-8 bg-white space-y-6 text-dark/80 font-medium leading-relaxed">
          <p><strong>Last updated:</strong> March 15, 2026</p>
          <h2 className="text-xl font-bold uppercase pt-4">1. Information We Collect</h2>
          <p>When you sign in with Google, we collect your name, email address, and profile picture. We use this information solely to provide and improve our service.</p>
          <h2 className="text-xl font-bold uppercase pt-4">2. How We Use Your Data</h2>
          <p>Your data is used to authenticate your account, display your profile in the dashboard, and provide personalized content repurposing services. We do not sell your data to third parties.</p>
          <h2 className="text-xl font-bold uppercase pt-4">3. Content You Upload</h2>
          <p>Content you upload for repurposing is processed by our AI systems and stored temporarily. You retain full ownership of your content. We do not use your content to train AI models.</p>
          <h2 className="text-xl font-bold uppercase pt-4">4. Cookies</h2>
          <p>We use essential cookies for authentication and session management. No tracking or advertising cookies are used.</p>
          <h2 className="text-xl font-bold uppercase pt-4">5. Data Security</h2>
          <p>We use industry-standard encryption (HTTPS, encrypted storage) to protect your data. Access to user data is restricted to authorized personnel only.</p>
          <h2 className="text-xl font-bold uppercase pt-4">6. Contact</h2>
          <p>For privacy-related inquiries, contact us at <strong>privacy@repurposeai.com</strong>.</p>
        </div>
      </main>
    </div>
  );
}
